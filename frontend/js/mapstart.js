import { API_BASE_URL } from './config.js';

const mapContainer = document.getElementById('map');
const defaultCenter = new kakao.maps.LatLng(37.55445080992788, 126.93453008736239);
let map;
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
          getIconByRiskLevel(marker.risk_level, marker.report_type),
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

// 아이콘 매핑 함수
function getIconByRiskLevel(level, type) {
  let color;
  switch (level) {
    case 1:
      color = "green";
      break;
    case 2:
      color = "yellow";
      break;
    case 3:
      color = "red";
      break;
    default:
      return "imgs/green6.png"
  }
  return `imgs/${color}${type}.png`;
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
