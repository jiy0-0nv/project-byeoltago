const mapContainer = document.getElementById('map');
const defaultCenter = new kakao.maps.LatLng(37.56163583847079,126.93377113568499);
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

  // 현재 위치 마커 생성
  marker = new kakao.maps.Marker({ position: center });
  marker.setMap(map);

  // 현재 위치 마커 스타일 변경 (선택사항)
  const currentLocationImage = new kakao.maps.MarkerImage(
    "imgs/marker-pin-03.png", // 현재 위치를 표시할 마커 이미지
    new kakao.maps.Size(40, 40),
    { offset: new kakao.maps.Point(20, 40) }
  );
  marker.setImage(currentLocationImage);

  // 이벤트 리스너 추가
  addMapClickListener();

  // 위험 마커 생성
  placeCustomDangerMarkers();

  // 주행 중 생성된 마커 표시
  displayDrivingMarkers();
}

// 지도 클릭 이벤트 리스너 추가
function addMapClickListener() {
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
}

    function placeCustomDangerMarkers(count = 7) { //마커 생성 수 조정가능 
      const bounds = map.getBounds();
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();

      const icons = [
        "imgs/green2.png", // 초록
        "imgs/yellow5.png", // 주황
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

        // 빨간색 마커만 이벤트 연결
        if (icon.includes("marker-pin-04.png")) {
          kakao.maps.event.addListener(marker, 'click', function () {
            document.getElementById("info-card").classList.add("show");
          });
        }
      }
    }
// 슬라이딩 카드 닫기 기능
document.querySelector('#info-card .handle').addEventListener('click', function () {
  document.getElementById('info-card').classList.remove('show');
});

function startRide() {
  alert("주행을 시작합니다. 안전 운전하세요!");
  window.location.href = "finish";
}

function goSelectLocation() {
  // 마지막 마커 위치와 현재 지도 레벨 저장
  saveLastMarkerAndLevel();
  window.location.href = "reportselect.html";
}

function reportNow() {
  // 마지막 마커 위치와 현재 지도 레벨 저장
  saveLastMarkerAndLevel();
  window.location.href = "reportselect.html";
}

// 마지막 마커 위치와 지도 레벨 저장 함수
function saveLastMarkerAndLevel() {
  // localStorage에서 마커 위치 배열 가져오기
  const markerPositions = JSON.parse(localStorage.getItem('drivingMarkers') || '[]');

  // 마커가 있는 경우 마지막 마커 위치 저장
  if (markerPositions.length > 0) {
    const lastMarker = markerPositions[markerPositions.length - 1];
    localStorage.setItem('lastMarkerLat', lastMarker.lat);
    localStorage.setItem('lastMarkerLng', lastMarker.lng);
  }

  // 현재 지도 레벨 저장
  const currentLevel = map.getLevel();
  localStorage.setItem('mapLevel', currentLevel);
}


// 사이드바
const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");
menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

// 주행 중 생성된 마커 표시 함수
function displayDrivingMarkers() {
  // localStorage에서 마커 위치 배열 가져오기
  const markerPositions = JSON.parse(localStorage.getItem('drivingMarkers') || '[]');

  // 마커 이미지 설정
  const pinImage = new kakao.maps.MarkerImage(
    "imgs/flag.png", // 깃발 이미지 사용
    new kakao.maps.Size(40, 40),
    { offset: new kakao.maps.Point(20, 40) }
  );

  // 각 위치에 마커 생성
  markerPositions.forEach(position => {
    const latlng = new kakao.maps.LatLng(position.lat, position.lng);

    // 마커 생성
    const marker = new kakao.maps.Marker({
      position: latlng,
      map: map,
      image: pinImage
    });

    // 순서 번호 표시 (position.seq가 있는 경우에만)
    if (position.seq !== undefined) {
      // 마커 위에 순서 번호 표시
      const markerContent = `<div style="background:#f1c40f; color:#fff; padding:4px 8px; border-radius:20px; font-weight:bold;">${position.seq}</div>`;
      const customOverlay = new kakao.maps.CustomOverlay({
        position: latlng,
        content: markerContent,
        yAnchor: 1
      });
      customOverlay.setMap(map);
    }
  });
}

// 지도 초기화 실행
initializeMap();
