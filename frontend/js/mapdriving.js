// 지도 관련 변수
const mapContainer = document.getElementById('map');
const defaultCenter = new kakao.maps.LatLng(37.55445080992788, 126.93453008736239);
let map;
let marker;

// 지도 초기화
initializeMap();

// 지도 초기화 함수
function initializeMap() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        createMap(new kakao.maps.LatLng(lat, lng));
      },
      () => createMap(defaultCenter),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
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

  marker = new kakao.maps.Marker({ position: center });
  marker.setMap(map);

  if (isDrivingPage) {
    setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newCenter = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map.setCenter(newCenter);
            marker.setPosition(newCenter);
          },
          () => console.warn('위치 업데이트 실패')
        );
      }
    }, 3000);
  }

  kakao.maps.event.addListener(map, 'click', (e) => {
    const latlng = e.latLng;
    marker.setPosition(latlng);
    const latlngText = document.getElementById('clickLatlng');
    if (latlngText) {
      latlngText.innerText = `클릭한 위치의 위도는 ${latlng.getLat().toFixed(5)} 이고, 경도는 ${latlng.getLng().toFixed(5)} 입니다`;
    }
  });

  kakao.maps.event.addListener(map, 'dblclick', (e) => {
    const latlng = e.latLng;
    console.log(`더블클릭 위치: 위도 ${latlng.getLat()}, 경도 ${latlng.getLng()}`);

    const markerImage = new kakao.maps.MarkerImage(
      "imgs/flag.png",
      new kakao.maps.Size(40, 40),
      { offset: new kakao.maps.Point(20, 40) }
    );

    const positions = JSON.parse(localStorage.getItem('drivingMarkers') || '[]');
    const seq = positions.length + 1;

    new kakao.maps.Marker({
      position: latlng,
      map: map,
      image: markerImage
    });

    saveMarkerPosition(latlng);

    const label = `<div style="background:#f1c40f;color:#fff;padding:4px 8px;border-radius:20px;font-weight:bold;">${seq}</div>`;
    new kakao.maps.CustomOverlay({
      position: latlng,
      content: label,
      yAnchor: 1
    }).setMap(map);

    const popup = document.getElementById("report-popup");
    if (popup) {
      popup.style.display = "flex";
      setTimeout(() => popup.style.display = "none", 2000);
    }
  });

  placeCustomDangerMarkers();
}

// 마커 위치 저장
function saveMarkerPosition(latlng) {
  const positions = JSON.parse(localStorage.getItem('drivingMarkers') || '[]');
  positions.push({ lat: latlng.getLat(), lng: latlng.getLng(), seq: positions.length + 1 });
  localStorage.setItem('drivingMarkers', JSON.stringify(positions));
}

// 위험 마커 생성
function placeCustomDangerMarkers(count = 30) {
  const bounds = map.getBounds();
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();

  const icons = [
    "imgs/green2.png", "imgs/green5.png",
    "imgs/red2.png", "imgs/red4.png",
    "imgs/yellow3.png", "imgs/yellow1.png"
  ];

  for (let i = 0; i < count; i++) {
    const lat = Math.random() * (ne.getLat() - sw.getLat()) + sw.getLat();
    const lng = Math.random() * (ne.getLng() - sw.getLng()) + sw.getLng();
    const icon = icons[Math.floor(Math.random() * icons.length)];

    const markerImage = new kakao.maps.MarkerImage(
      icon,
      new kakao.maps.Size(40, 40),
      { offset: new kakao.maps.Point(20, 40) }
    );

    const dangerMarker = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(lat, lng),
      map: map,
      image: markerImage
    });

    if (icon.includes("marker-pin-04.png")) {
      kakao.maps.event.addListener(dangerMarker, 'click', () => {
        document.getElementById("info-card").classList.add("show");
      });
    }
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
  }, 5000);
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