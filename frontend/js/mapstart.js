import { API_BASE_URL } from './config.js';

const mapContainer = document.getElementById('map');
const defaultCenter = new kakao.maps.LatLng(37.55445080992788, 126.93453008736239);

const geocoder = new kakao.maps.services.Geocoder();

let map;
let lastBounds = null;
const BOUNDS_CHANGE_THRESHOLD = 0.002; // 위경도 기준 약 200m

let watchId = null;
let userMarker = null;
let autoTracking = true;

localStorage.clear();

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
        const imgPath = getIconByRiskLevel(marker.risk_level, marker.report_type);
  
        const testImg = new Image();
        testImg.src = imgPath;
  
        testImg.onload = () => {
          const markerImage = new kakao.maps.MarkerImage(
            imgPath,
            new kakao.maps.Size(40, 40),
            { offset: new kakao.maps.Point(20, 40) }
          );
          createKakaoMarker(position, markerImage, marker.id);
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
  if (type == 6) {
    return `imgs/${color}6.svg`;
  }
  else {
    return `imgs/${color}${type}.png`;
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
let currentSlide = 0;

function showReportDetails(detail) {
  const titleEl = document.getElementById("modal-title");
  const dateEl = document.getElementById("modal-date");
  const descEl = document.getElementById("modal-description");
  const imageEl = document.getElementById("modal-images");
  const iconEl = document.getElementById("modal-icon");
  const modalEl = document.getElementById("report-modal");
  const overlayEl = document.getElementById("modal-overlay");

  // 역지오코딩: 좌표 → 주소
  const coord = new kakao.maps.LatLng(detail.latitude, detail.longitude);
  const geocoder = new kakao.maps.services.Geocoder();
  geocoder.coord2Address(coord.getLng(), coord.getLat(), function(result, status) {
    if (status === kakao.maps.services.Status.OK && result[0]) {
      const roadAddr = result[0].road_address?.address_name;
      const jibunAddr = result[0].address?.address_name;
      titleEl.textContent = roadAddr || jibunAddr || "위치 정보 없음";
    } else {
      titleEl.textContent = "주소 불러오기 실패";
    }
  });

  // 날짜 표시
  if (detail.reported_at) {
    dateEl.textContent = `마지막 신고: ${formatDate(detail.reported_at)}`;
  } else {
    dateEl.textContent = '';
  }

  const statusMap = {
    0: "확인중",
    1: "접수됨",
    2: "처리 중",
    3: "처리 완료",
    4: "반려됨"
  };
  const typeMap = {
    1: "차도와 구분 어려움",
    2: "도로 융기",
    3: "도로 파임",
    4: "불법 주차",
    5: "공사 구간",
    6: "기타 위험 요소"
  };

  const statusText = statusMap[detail.status_id] ?? "상태 미정";
  const typeText = typeMap[detail.type_id] ?? "유형 미정";
  const reportCount = detail.report_count ?? 0;
  let reportClass = 'pill-default';
  if (reportCount <= 3) reportClass = 'pill-green';
  else if (reportCount <= 5) reportClass = 'pill-yellow';
  else reportClass = 'pill-red';

  let statusClass = 'pill-default';
  if (detail.status_id == 4) statusClass = 'pill-gray';
  else if (detail.status_id == 1 || detail.status_id == 2) statusClass = 'pill-blue';
  else if (detail.status_id == 3) statusClass = 'pill-green';

  descEl.innerHTML = `
    <div class="pill-container">
      <div class="pill ${reportClass}">${reportCount}회 신고됨</div>
      <div class="pill pill-default">${typeText}</div>
      <div class="pill ${statusClass}">${statusText}</div>
    </div>
    ${Array.isArray(detail.descriptions) ? detail.descriptions.join('<br>') : ''}
  `;

  imageEl.innerHTML = "";
  // 이미지 캐러셀 동적 생성
  if (Array.isArray(detail.imagePaths) && detail.imagePaths.length > 0) {
    renderCarousel(detail.imagePaths);
  } else {
    imageEl.innerHTML = "<p style='color:#888; font-size: 14px;'>이미지가 제공되지 않았습니다.</p>";
  }

  const iconPath = getIconByRiskLevel(detail.risk_level, detail.type_id);
  iconEl.src = iconPath;

  overlayEl.classList.add("show");
  modalEl.classList.add("show");

  overlayEl.addEventListener("click", function (e) {
    const modalContent = document.querySelector(".modal-content");
    if (!modalContent.contains(e.target)) {
      overlayEl.classList.remove("show");
      modalEl.classList.remove("show");
    }
  });
  
}

function formatDate(isoString) {
  const utc = new Date(isoString);

  // UTC → KST(+9)
  const kst = new Date(utc.getTime() + 9 * 60 * 60 * 1000);

  const yyyy = kst.getFullYear();
  const mm = String(kst.getMonth() + 1).padStart(2, '0');
  const dd = String(kst.getDate()).padStart(2, '0');
  const hh = String(kst.getHours()).padStart(2, '0');
  const mi = String(kst.getMinutes()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd} ${hh}:${mi}`;
}

function renderCarousel(images) {
  const modalImages = document.getElementById("modal-images");
  modalImages.innerHTML = ""; // 초기화
  currentSlide = 0;

  // 캐러셀 컨테이너 생성
  const carousel = document.createElement("div");
  carousel.className = "carousel";

  const prevBtn = document.createElement("button");
  prevBtn.id = "carousel-prev";
  prevBtn.innerHTML = "&#8592;";

  const nextBtn = document.createElement("button");
  nextBtn.id = "carousel-next";
  nextBtn.innerHTML = "&#8594;";

  const track = document.createElement("div");
  track.id = "carousel-track";
  track.className = "carousel-track";

  images.forEach(path => {
    const img = document.createElement("img");
    img.src = path;
    track.appendChild(img);
  });

  carousel.appendChild(prevBtn);
  carousel.appendChild(track);
  carousel.appendChild(nextBtn);
  modalImages.appendChild(carousel);

  // 이벤트
  prevBtn.addEventListener("click", () => {
    currentSlide = Math.max(0, currentSlide - 1);
    updateCarousel();
  });
  nextBtn.addEventListener("click", () => {
    currentSlide = Math.min(track.children.length - 1, currentSlide + 1);
    updateCarousel();
  });

  updateCarousel();
}

function updateCarousel() {
  const track = document.getElementById("carousel-track");
  if (track) {
    const slideWidth = 210;
    track.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
  }
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

document.getElementById("carousel-prev").addEventListener("click", () => {
  currentSlide = Math.max(0, currentSlide - 1);
  updateCarousel();
});

document.getElementById("carousel-next").addEventListener("click", () => {
  const track = document.getElementById("carousel-track");
  const totalSlides = track.children.length;
  currentSlide = Math.min(totalSlides - 1, currentSlide + 1);
  updateCarousel();
});