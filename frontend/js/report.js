import { API_BASE_URL } from './config.js';

// 테스트용 마커 데이터 3개 추가
document.addEventListener('DOMContentLoaded', () => {
  const reportBtn = document.getElementById('testdata');
  if (!reportBtn) return;
  reportBtn.addEventListener('click', () => {
    localStorage.clear();
    alert("로컬 스토리지 초기화됨. 테스트 데이터가 추가되었습니다.");
    
    const testMarkers = [
      {
        lat: 37.56577,
        lng: 126.9368989,
        seq: 1,
        timestamp: new Date().toISOString()
      },
      {
        lat: 37.564,
        lng: 126.93500,
        seq: 2,
        timestamp: new Date().toISOString()
      },
      {
        lat: 37.564800,
        lng: 126.9300,
        seq: 3,
        timestamp: new Date().toISOString()
      }
    ];
    
    localStorage.setItem('drivingMarkers', JSON.stringify(testMarkers));
    location.reload();
  });
});

const markerPositions = JSON.parse(localStorage.getItem('drivingMarkers') || '[]');
const container = document.getElementById('map');

let map;
const path = markerPositions.map(pos => new kakao.maps.LatLng(pos.lat, pos.lng));

function createMap(centerLat, centerLng) {
  const options = {
    center: new kakao.maps.LatLng(centerLat, centerLng),
    level: 4
  };
  map = new kakao.maps.Map(container, options);

  // Polyline 그리기
  if (path.length > 1) {
    const polyline = new kakao.maps.Polyline({
      path: path,
      strokeWeight: 5,
      strokeColor: '#FF6600',
      strokeOpacity: 0.8,
      strokeStyle: 'solid'
    });
    polyline.setMap(map);
  }

  // 마커 + 번호 오버레이
  const pinImage = new kakao.maps.MarkerImage(
    "imgs/flag.png",
    new kakao.maps.Size(40, 40),
    { offset: new kakao.maps.Point(20, 40) }
  );

  markerPositions.forEach((position, idx) => {
    const latlng = new kakao.maps.LatLng(position.lat, position.lng);
    
    const marker = new kakao.maps.Marker({
      position: latlng,
      map: map,
      image: pinImage
    });

    const markerContent = `<div style="background:#f1c40f; color:#fff; padding:4px 8px; border-radius:20px; font-weight:bold;">${position.seq ?? idx + 1}</div>`;
    const customOverlay = new kakao.maps.CustomOverlay({
      position: latlng,
      content: markerContent,
      yAnchor: 1
    });
    customOverlay.setMap(map);
  });

  // 전체 bounds로 조정
  if (path.length > 1) {
    const bounds = new kakao.maps.LatLngBounds();
    path.forEach(point => bounds.extend(point));
    map.setBounds(bounds, 50);
  }
}

if (markerPositions.length > 0) {
  // 첫 마커를 기준으로 지도 초기화
  createMap(markerPositions[0].lat, markerPositions[0].lng);
} else if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      createMap(position.coords.latitude, position.coords.longitude);
    },
    () => createMap(37.5495, 126.9425),
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
  );
} else {
  createMap(37.5495, 126.9425);
}

function populateLocationSelect() {
  const markerPositions = JSON.parse(localStorage.getItem('drivingMarkers') || '[]');
  const select = document.getElementById('location-select');
  select.innerHTML = '';

  const uniqueSeqs = [...new Set(markerPositions.map(m => m.seq))].sort((a, b) => a - b);
  uniqueSeqs.forEach(seq => {
    const option = document.createElement('option');
    option.value = seq;
    option.textContent = seq;
    select.appendChild(option);
  });
}

function updateDamageDisplay() {
  const select = document.getElementById('location-select');
  const damageDisplay = document.getElementById('damage-display');
  if (!select || !damageDisplay) return;

  const selectedSeq = parseInt(select.value);
  const reports = JSON.parse(localStorage.getItem('heldReports') || '[]');

  const match = reports.find(r => r.seq === selectedSeq);

  if (match) {
    damageDisplay.textContent = match.damageType;
    damageDisplay.style.color = '#333';
    damageDisplay.style.fontWeight = 'bold';
  } else {
    damageDisplay.textContent = '(종류 선택)';
    damageDisplay.style.color = 'gray';
    damageDisplay.style.fontWeight = 'normal';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  populateLocationSelect();

  const select = document.getElementById('location-select');
  if (select) {
    select.addEventListener('change', () => {
      updateDamageDisplay();
    });
  }

  // 초기 상태 반영
  updateDamageDisplay();
});

function holdReportData(seq, damageType) {
  const reports = JSON.parse(localStorage.getItem('heldReports') || '[]');
  const marker = markerPositions.find(m => m.seq === seq);
  if (!marker) return;

  const filtered = reports.filter(r => r.seq !== seq); // 기존 같은 seq 제거
  const newReport = {
    seq: seq,
    lat: marker.lat,
    lng: marker.lng,
    timestamp: marker.timestamp,
    damageType: damageType
  };
  filtered.push(newReport); // 새 항목 추가
  localStorage.setItem('heldReports', JSON.stringify(filtered));
}

function selectChoice(elem) {
  const damage = elem.innerText.trim();
  selectedDamageType = damage;
  closeModal();

  const seq = parseInt(document.getElementById('location-select').value);
  holdReportData(seq, selectedDamageType);

  updateDamageDisplay();

  alert(`결함 저장됨: 위치 ${seq}, 종류 ${selectedDamageType}`);
}
document.addEventListener('DOMContentLoaded', () => {
  const choiceElements = document.querySelectorAll('.choice');
  choiceElements.forEach(choice => {
    choice.addEventListener('click', () => {
      selectChoice(choice);
    });
  });
});

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      createMap(position.coords.latitude, position.coords.longitude);
    },
    () => createMap(37.5495, 126.9425),
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
  );
} else {
  createMap(37.5495, 126.9425);
}


document.addEventListener('DOMContentLoaded', () => {
  const reportBtn = document.getElementById('submit-report');
  if (!reportBtn) return;

  reportBtn.addEventListener('click', async () => {
    const reports = JSON.parse(localStorage.getItem('heldReports') || '[]');

    if (reports.length === 0) {
      alert("신고할 정보가 없습니다.");
      return;
    }

    for (const report of reports) {
      const formData = new FormData();

      formData.append('lat', report.latitude);
      formData.append('lng', report.longitude);
      formData.append('timestamp', report.timestamp);
      formData.append('damageType', report.type_id);

      // localStorage에 저장된 이미지가 있다면 추가
      const imageKey = `image_${report.seq}`;
      const imageDataUrl = localStorage.getItem(imageKey);
      if (imageDataUrl) {
        const blob = await (await fetch(imageDataUrl)).blob();
        formData.append('image', blob, `image_${report.seq}.png`);
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/reports/report`, {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        if (!response.ok) {
          console.error(`신고 실패 (seq: ${report.seq})`, await response.text());
        } else {
          console.log(`신고 완료 (seq: ${report.seq})`);
        }
      } catch (err) {
        console.error(`네트워크 오류 (seq: ${report.seq})`, err);
      }
    }

    alert("모든 신고가 전송되었습니다.");
  });
})