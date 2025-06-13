import { API_BASE_URL } from './config.js';

const mapContainer = document.getElementById('map');
const defaultCenter = new kakao.maps.LatLng(37.55445080992788, 126.93453008736239);
let map;
let marker;
let lastBounds = null;
const BOUNDS_CHANGE_THRESHOLD = 0.001; // 위경도 기준 약 100m

// 위치 기반 지도 초기화
function initializeMap() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const userCenter = new kakao.maps.LatLng(lat, lng);
        createMap(userCenter);
      },
      (error) => {
        console.warn('위치 정보 가져오기 실패:', error);
        createMap(defaultCenter);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  } else {
    console.warn('이 브라우저는 Geolocation을 지원하지 않습니다.');
    createMap(defaultCenter);
  }
}

// 지도 생성 함수
function createMap(center) {
  // 현재 페이지가 mapdriving.html인 경우 최대 배율(level 1)로 설정
  // 그 외의 경우 기본 배율(level 4)로 설정
  const isDrivingPage = window.location.pathname.includes('mapdriving.html');
  const zoomLevel = isDrivingPage ? 1 : 4;

  // 주행 시작 시 이전 마커 데이터 초기화
  if (isDrivingPage) {
    localStorage.removeItem('drivingMarkers');
  }

  const mapOption = {
    center: center,
    level: zoomLevel,  // 주행 시작 시 최대 배율로 확대 (level 1이 가장 확대된 상태)
    disableDoubleClickZoom: true  // 더블클릭 줌 기능 비활성화
  };
  map = new kakao.maps.Map(mapContainer, mapOption);

  // 클릭 위치 마커
  marker = new kakao.maps.Marker({ position: center });
  marker.setMap(map);

  // 주행 시작 시 3초마다 현재 위치로 지도 이동 (mapdriving.html 페이지에서만)
  if (isDrivingPage) {
    setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const newCenter = new kakao.maps.LatLng(lat, lng);
            map.setCenter(newCenter);
            marker.setPosition(newCenter);
          },
          (error) => {
            console.warn('위치 정보 업데이트 실패:', error);
          },
          {
            enableHighAccuracy: true,
            timeout: 3000,
            maximumAge: 0
          }
        );
      }
    }, 3000); // 3초마다 실행
  }

  kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
    const latlng = mouseEvent.latLng;
    marker.setPosition(latlng);

    // clickLatlng 요소가 존재하는 경우에만 업데이트
    const clickLatlngElement = document.getElementById('clickLatlng');
    if (clickLatlngElement) {
      clickLatlngElement.innerText =
        `클릭한 위치의 위도는 ${latlng.getLat().toFixed(5)} 이고, 경도는 ${latlng.getLng().toFixed(5)} 입니다`;
    }
  });

  // 더블클릭 이벤트 리스너 추가 - 핀 생성
  kakao.maps.event.addListener(map, 'dblclick', function(mouseEvent) {
    const latlng = mouseEvent.latLng;

    // 현 위치의 좌표를 콘솔로 출력
    // API 연동 부분
    console.log(`더블클릭 위치 좌표 - 위도: ${latlng.getLat()}, 경도: ${latlng.getLng()}`);

    // 핀 이미지 설정
    const pinImage = new kakao.maps.MarkerImage(
      "imgs/flag.png", // 깃발 이미지 사용
      new kakao.maps.Size(40, 40),
      { offset: new kakao.maps.Point(20, 40) }
    );

    // 마커 위치 저장 및 순서 번호 가져오기
    const markerPositions = JSON.parse(localStorage.getItem('drivingMarkers') || '[]');
    const seqNumber = markerPositions.length + 1; // 새 마커의 순서 번호

    // 새 마커 생성
    const newPin = new kakao.maps.Marker({
      position: latlng,
      map: map,
      image: pinImage
    });

    // 마커 위치 저장
    saveMarkerPosition(latlng);

    // 마커 위에 순서 번호 표시
    const markerContent = `<div style="background:#f1c40f; color:#fff; padding:4px 8px; border-radius:20px; font-weight:bold;">${seqNumber}</div>`;
    const customOverlay = new kakao.maps.CustomOverlay({
      position: latlng,
      content: markerContent,
      yAnchor: 1
    });
    customOverlay.setMap(map);

    // 신고 완료 팝업 표시 (팝업 요소가 존재하는 경우에만)
    const popup = document.getElementById("report-popup");
    if (popup) {
      popup.style.display = "flex";

      // 2초 후 팝업 닫기
      setTimeout(() => {
        popup.style.display = "none";
      }, 2000);
    }
  });

  placeDangerMarkers(); // 마커 생성
  kakao.maps.event.addListener(map, 'idle', placeDangerMarkers);
}

// 기존 랜덤 마커 생성 제거 후 DB 연동으로 대체
function placeDangerMarkers() {
  const bounds = map.getBounds();
  if (!shouldRefetchMarkers(bounds)) return;
  lastBounds = bounds;

  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();

  const url = `${API_BASE_URL}/reports/markers?minLat=${sw.getLat()}&maxLat=${ne.getLat()}&minLon=${sw.getLng()}&maxLon=${ne.getLng()}`;

  fetch(url, {
    method: 'GET',
    credentials: 'include' // 쿠키를 포함하여 요청
  })
    .then(res => res.json())
    .then(markers => {
      markers.forEach(marker => {
        const markerImage = new kakao.maps.MarkerImage(
          getIconByRiskLevel(marker.riskLevel),
          new kakao.maps.Size(40, 40),
          { offset: new kakao.maps.Point(20, 40) }
        );

        const kakaoMarker = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(marker.latitude, marker.longitude),
          map: map,
          image: markerImage
        });

        kakao.maps.event.addListener(kakaoMarker, 'click', () => {
          fetch(`${API_BASE_URL}/reports/${marker.id}/details`, {
            method: 'GET',
            credentials: 'include' // 쿠키를 포함하여 요청
          })
            .then(res => res.json())
            .then(showReportDetails)
            .catch(err => console.error("상세 정보 조회 실패:", err));
        });
      });
    })
    .catch(err => console.error("마커 불러오기 실패:", err));
}

// 위험도에 따른 아이콘 매핑 함수
function getIconByRiskLevel(level) {
  switch (level) {
    case 1: return "imgs/green2.png";
    case 2: return "imgs/yellow1.png";
    case 3: return "imgs/yellow3.png";
    default: return "imgs/green5.png";
  }
}

function shouldRefetchMarkers(newBounds) {
  if (!lastBounds) return true;

  const oldSW = lastBounds.getSouthWest();
  const oldNE = lastBounds.getNorthEast();
  const newSW = newBounds.getSouthWest();
  const newNE = newBounds.getNorthEast();

  const latChange = Math.abs(oldSW.getLat() - newSW.getLat()) + Math.abs(oldNE.getLat() - newNE.getLat());
  const lngChange = Math.abs(oldSW.getLng() - newSW.getLng()) + Math.abs(oldNE.getLng() - newNE.getLng());

  return latChange > BOUNDS_CHANGE_THRESHOLD || lngChange > BOUNDS_CHANGE_THRESHOLD;
}

// 상세 정보 표시
function showReportDetails(detail) {
  const card = document.getElementById("info-card");
  card.classList.add("show");
  card.querySelector("#report-title").innerText = `유형: ${detail.typeId}`;
  card.querySelector("#report-desc").innerText = detail.descriptions?.[0] || "설명이 없습니다";
}

// 슬라이딩 카드 닫기
document.querySelector('#info-card .handle').addEventListener('click', function () {
  document.getElementById('info-card').classList.remove('show');
});

// 사이드바 토글
const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");
menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

// 지도 초기화 실행
initializeMap();
