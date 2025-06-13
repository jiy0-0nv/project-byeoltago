const mapContainer = document.getElementById('map');
const defaultCenter = new kakao.maps.LatLng(37.55445080992788, 126.93453008736239);
let map;
let marker;

// 지도 초기화 및 실시간 위치 추적
function initializeMap() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const userCenter = new kakao.maps.LatLng(lat, lng);
        createMap(userCenter);
        trackUserPosition(); // 위치 추적 시작
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
  map = new kakao.maps.Map(mapContainer, {
    center: center,
    level: 4
  });

  // 초기 위치 마커 생성
  marker = new kakao.maps.Marker({ position: center });
  marker.setMap(map);

  placeCustomDangerMarkers(); // 커스텀 마커 표시
}

// 실시간 위치 추적하여 마커 갱신
function trackUserPosition() {
  navigator.geolocation.watchPosition(
    (position) => {
      const newPos = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
      marker.setPosition(newPos);
      map.panTo(newPos); // 지도도 이동
    },
    (error) => {
      console.error("위치 추적 실패:", error);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000
    }
  );
}

// 커스텀 위험 마커 생성
function placeCustomDangerMarkers(count = 30) {
  const bounds = map.getBounds();
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();

  const icons = [
    "imgs/marker-pin-01.png", // 초록
    "imgs/marker-pin-02.png", // 주황
    "imgs/marker-pin-03.png", // 빨강
    "imgs/marker-pin-04.png"  // 빨강2
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

    const marker = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(lat, lng),
      map: map,
      image: markerImage
    });

    // 빨간 마커만 클릭 시 info-card 표시
    if (icon.includes("marker-pin-04.png")) {
      kakao.maps.event.addListener(marker, 'click', () => {
        document.getElementById("info-card").classList.add("show");
      });
    }
  }
}

// 슬라이딩 카드 닫기
document.querySelector('#info-card .handle').addEventListener('click', function () {
  document.getElementById('info-card').classList.remove('show');
});

// 주행 시작 → mapfinish.html로 이동
function startRide() {
  window.location.href = "mapfinish.html";
}

// 신고 → report2.html로 이동
function reportNow() {
  window.location.href = "report2.html";
}

initializeMap();