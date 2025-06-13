import { API_BASE_URL } from './config.js';

// 지도 관련 변수
const mapContainer = document.getElementById('map');
const defaultCenter = new kakao.maps.LatLng(37.55445080992788, 126.93453008736239);
let map;
let marker;
let lastBounds = null;
const BOUNDS_CHANGE_THRESHOLD = 0.002; // 위경도 기준 약 200m

let watchId = null;
let userMarker = null;
let autoTracking = true;

// 지도 초기화 함수
function initializeMap() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        createMap(new kakao.maps.LatLng(lat, lng));
        startTracking(); // 위치 추적 시작
      },
      () => createMap(defaultCenter),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 5000 }
    );
  } else {
    createMap(defaultCenter);
  }
}

// 지도 생성 함수
function createMap(center) {
  const isDrivingPage = window.location.pathname.includes('mapdriving.html');
  const zoomLevel = isDrivingPage ? 1 : 4;

  if (isDrivingPage) localStorage.removeItem('drivingMarkers');

  map = new kakao.maps.Map(mapContainer, {
    center,
    level: zoomLevel,
    disableDoubleClickZoom: true
  });

  // 지도 이동 시 자동 추적 중단
  kakao.maps.event.addListener(map, 'dragstart', () => {
    autoTracking = false;
  });

  kakao.maps.event.addListener(map, 'dblclick', () => {
    if (!navigator.geolocation) return;
  
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const userLatLng = new kakao.maps.LatLng(lat, lng);
  
        const markerImage = new kakao.maps.MarkerImage(
          "imgs/flag.png",
          new kakao.maps.Size(40, 40),
          { offset: new kakao.maps.Point(20, 40) }
        );
  
        const positions = JSON.parse(localStorage.getItem('drivingMarkers') || '[]');
        const seq = positions.length + 1;
  
        new kakao.maps.Marker({
          position: userLatLng,
          map: map,
          image: markerImage
        });
  
        saveMarkerPosition(userLatLng);
  
        const label = `<div style="background:#f1c40f;color:#fff;padding:4px 8px;border-radius:20px;font-weight:bold;">${seq}</div>`;
        new kakao.maps.CustomOverlay({
          position: userLatLng,
          content: label,
          yAnchor: 1
        }).setMap(map);
  
        autoTracking = true; // 자동 추적 활성화
        startTracking();

        const popup = document.getElementById("report-popup");
        if (popup) {
          popup.style.display = "flex";
          setTimeout(() => popup.style.display = "none", 2000);
        }
      },
      (err) => {
        console.warn("현재 위치 가져오기 실패", err);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 5000 }
    );
  });
  
  placeDangerMarkers(); // 마커 생성
  kakao.maps.event.addListener(map, 'idle', placeDangerMarkers);
}

// 위치 추적 시작
function startTracking() {
  if (!navigator.geolocation) return;

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const latlng = new kakao.maps.LatLng(lat, lng);

      // 기존 마커 제거
      if (userMarker) userMarker.setMap(null);

      // 현재 위치 마커 생성 (파란 점)
      userMarker = new kakao.maps.Circle({
        center: latlng,
        radius: 5,
        strokeWeight: 0,
        fillColor: '#3498db',
        fillOpacity: 0.9,
        map: map
      });

      if (autoTracking) {
        map.setCenter(latlng);
      }
    },
    (error) => console.error('위치 추적 실패:', error),
    {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 5000
    }
  );
}

function centerUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        map.setCenter(latlng);
      },
      (err) => console.warn("위치 가져오기 실패:", err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }
}

// 마커 위치 저장
function saveMarkerPosition(latlng) {
  const positions = JSON.parse(localStorage.getItem('drivingMarkers') || '[]');
  const now = new Date();
  positions.push({
    lat: latlng.getLat(),
    lng: latlng.getLng(),
    seq: positions.length + 1,
    timestamp: now.toISOString()
  });
  localStorage.setItem('drivingMarkers', JSON.stringify(positions));
}

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
        const position = new kakao.maps.LatLng(marker.latitude, marker.longitude);
        const pngPath = getIconByRiskLevel(marker.risk_level, marker.report_type);
        const svgPath = pngPath.replace('.png', '.svg');
  
        const testImg = new Image();
        testImg.src = pngPath;
  
        testImg.onload = () => {
          const markerImage = new kakao.maps.MarkerImage(
            pngPath,
            new kakao.maps.Size(40, 40),
            { offset: new kakao.maps.Point(20, 40) }
          );
          createKakaoMarker(position, markerImage, marker.id);
        };
  
        testImg.onerror = () => {
          const fallbackImage = new kakao.maps.MarkerImage(
            svgPath,
            new kakao.maps.Size(40, 40),
            { offset: new kakao.maps.Point(20, 40) }
          );
          createKakaoMarker(position, fallbackImage, marker.id);
        };
      });
    })
    .catch(err => console.error("마커 불러오기 실패:", err));
}

function createKakaoMarker(position, markerImage, reportId) {
  const kakaoMarker = new kakao.maps.Marker({
    position,
    map,
    image: markerImage
  });

  kakao.maps.event.addListener(kakaoMarker, 'click', () => {
    fetch(`${API_BASE_URL}/reports/${reportId}/details`, {
      method: 'GET',
      credentials: 'include'
    })
      .then(res => res.json())
      .then(showReportDetails)
      .catch(err => console.error("상세 정보 조회 실패:", err));
  });
}

// 아이콘 매핑 함수
function getIconByRiskLevel(level, type) {
  let color;
  switch (level) {
    case 1: color = "green"; break;
    case 2: color = "yellow"; break;
    case 3: color = "red"; break;
    default: color = "green";
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

// 오버레이 닫기 (처음 한 번만 보여짐)
function closeOverlay(e) {
  e.stopPropagation();
  document.getElementById("report-overlay").style.display = "none";
}

// 오버레이 자동 닫기
window.addEventListener("load", () => {
  setTimeout(() => {
    const overlay = document.getElementById("report-overlay");
    if (overlay) overlay.style.display = "none";
  }, 3000); // 3초
});

// 더블탭 감지
let lastTap = 0;
function detectDoubleTap(e) {
  const now = new Date().getTime();
  if (now - lastTap < 400) handleReport();
  lastTap = now;
}

// 신고 팝업
function handleReport() {
  const popup = document.getElementById("report-popup");
  popup.style.display = "flex";
  setTimeout(() => popup.style.display = "none", 2000);
}

// 슬라이딩 카드 닫기
document.querySelector('#info-card .handle').addEventListener('click', () => {
  document.getElementById('info-card').classList.remove('show');
});

// 사이드바 토글
document.getElementById("menu-toggle").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
});

// 주행 종료 이동
function endRide() {
  window.location.href = "mapfinish.html";
}

// 뒤로 가기
function goBack() {
  window.history.back();
}

// 지도 초기화 실행
initializeMap();

// 뒤로가기 버튼
document.querySelector('.back-btn')?.addEventListener('click', goBack);

// 사이드바 토글
document.getElementById("menu-toggle")?.addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
});

// 신고 안내 오버레이 닫기
document.getElementById("close-overlay")?.addEventListener("click", closeOverlay);

// 더블탭 감지
document.getElementById("map-container")?.addEventListener("touchend", detectDoubleTap);

// 주행 종료 버튼
document.querySelector('.map-button.end-btn')?.addEventListener("click", endRide);

window.centerUserLocation = centerUserLocation;
