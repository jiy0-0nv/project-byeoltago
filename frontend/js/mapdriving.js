import { API_BASE_URL } from './config.js';

// 지도 관련 변수
const mapContainer = document.getElementById('map');
const defaultCenter = new kakao.maps.LatLng(37.55445080992788, 126.93453008736239);
let map;
let lastBounds = null;
const BOUNDS_CHANGE_THRESHOLD = 0.002; // 위경도 기준 약 200m

let userMarker = null;
let autoTracking = true;
let watchId = null;

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

// 주행 종료 이동
async function endRide() {
  localStorage.setItem('reportMode', 'driver');
  const token = localStorage.getItem("accessToken");

  try {
    const res = await fetch(`${API_BASE_URL}/auth/check`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error();
    window.location.href = "report.html";
  } catch {
    alert("로그인이 필요합니다.");
    window.location.href = "login.html";
  }
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
