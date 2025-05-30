  // 지도 생성
  const mapContainer = document.getElementById('map');
  const mapOption = {
    center: new kakao.maps.LatLng(37.56461040983631, 126.93610015875485),
    level: 4
  };
  const map = new kakao.maps.Map(mapContainer, mapOption);

  const marker = new kakao.maps.Marker({
    position: map.getCenter(),
    map: map
  });

  kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
    const latlng = mouseEvent.latLng;
    marker.setPosition(latlng);
  });

  // 결함 선택 토글
  function selectChoice(el) {
    document.querySelectorAll('.choice').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
  }
  function goNextPage() {
    window.location.href = "afterreport.html";  // 원하는 페이지로 이동
  }
  function placeCustomDangerMarkers(count = 40) { //마커 생성 수 조정가능 
      const bounds = map.getBounds();
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();

      const icons = [
        "imgs/marker-pin-01.png", // 초록
        "imgs/marker-pin-02.png", // 주황
        "imgs/marker-pin-03.png"  // 빨강
      ] ;
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
      }
    }