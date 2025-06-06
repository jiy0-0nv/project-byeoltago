const mapContainer = document.getElementById('map');
const defaultCenter = new kakao.maps.LatLng(37.55445080992788, 126.93453008736239);
let map;
let marker;

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
  const mapOption = {
    center: center,
    level: 4
  };
  map = new kakao.maps.Map(mapContainer, mapOption);

  // 클릭 위치 마커
  marker = new kakao.maps.Marker({ position: center });
  marker.setMap(map);

  kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
    const latlng = mouseEvent.latLng;
    marker.setPosition(latlng);
    document.getElementById('clickLatlng').innerText =
      `클릭한 위치의 위도는 ${latlng.getLat().toFixed(5)} 이고, 경도는 ${latlng.getLng().toFixed(5)} 입니다`;
  });

  placeCustomDangerMarkers(); // 마커 생성
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
      kakao.maps.event.addListener(marker, 'click', function () {
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

// 사이드바 토글
const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");
menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

// 지도 초기화 실행
initializeMap();