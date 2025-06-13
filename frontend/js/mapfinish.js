const mapContainer = document.getElementById('map');
  const mapCenter = new kakao.maps.LatLng(37.56163583847079,126.93377113568499);

// 마커 좌표 (지도 중심보다 남서쪽으로 약간 떨어진 곳)
const markerPosition = new kakao.maps.LatLng(37.56458786656103,126.93606622186019 );

// 지도 생성
const map = new kakao.maps.Map(mapContainer, {
  center: mapCenter,
  level: 4
});

// 마커 생성
const marker = new kakao.maps.Marker({
  position: markerPosition
});
marker.setMap(map);

    kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
      const latlng = mouseEvent.latLng;
      marker.setPosition(latlng);
      document.getElementById('clickLatlng').innerText =
        `클릭한 위치의 위도는 ${latlng.getLat().toFixed(5)} 이고, 경도는 ${latlng.getLng().toFixed(5)} 입니다`;
    });

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

    placeCustomDangerMarkers();

    function startRide() {
      alert("주행을 시작합니다. 안전 운전하세요!");
    }

    function startRide() {
      window.location.href="finish"
    }
    function goSelectLocation() {
      window.location.href="report2.html"
    }
    function reportNow() {
  window.location.href="report2.html";
};
  

    // 사이드바
    const menuToggle = document.getElementById("menu-toggle");
    const sidebar = document.getElementById("sidebar");
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    })