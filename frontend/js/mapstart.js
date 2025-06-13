import { API_BASE_URL } from './config.js';

const mapContainer = document.getElementById('map');
const defaultCenter = new kakao.maps.LatLng(37.55445080992788, 126.93453008736239);
let map;
let lastBounds = null;
const BOUNDS_CHANGE_THRESHOLD = 0.002; // 위경도 기준 약 200m

let watchId = null;
let userMarker = null;
let autoTracking = true;

// 위치 기반 지도 초기화
function initializeMap() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const userCenter = new kakao.maps.LatLng(lat, lng);
        createMap(userCenter);
        startTracking(); // 위치 추적 시작
      },
      (error) => {
        console.warn('위치 정보 가져오기 실패:', error);
        createMap(defaultCenter);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 5000
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

  // 지도 이동 시 자동 추적 중단
  kakao.maps.event.addListener(map, 'dragstart', () => {
    autoTracking = false;
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
        radius: 10,
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

// 상세 정보 표시
function showReportDetails(detail) {
  
}

// 사이드바 토글
const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");
menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

// 지도 초기화 실행
initializeMap();
window.centerUserLocation = centerUserLocation;
