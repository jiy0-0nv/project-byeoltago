import { API_BASE_URL } from './config.js';

// 전역 변수
const reportMode = localStorage.getItem('reportMode') || 'driving';
let markerPositions = JSON.parse(localStorage.getItem('drivingMarkers') || '[]');
if (reportMode === 'walker') {
  markerPositions = markerPositions.filter(m => m.seq === 0);
}
const container = document.getElementById('map');

let map;
const path = markerPositions.map(pos => new kakao.maps.LatLng(pos.lat, pos.lng));
let selectedDamageType = null;

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
    if (reportMode === 'driving') {
      const markerContent = `<div style="background:#f1c40f; color:#fff; padding:4px 8px; border-radius:20px; font-weight:bold;">${position.seq ?? idx + 1}</div>`;
      const customOverlay = new kakao.maps.CustomOverlay({
        position: latlng,
        content: markerContent,
        yAnchor: 1
      });
      customOverlay.setMap(map);
  }
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

// 위치 선택
function populateLocationSelect() {
  if (reportMode === 'walker') {
    document.getElementById('location-select').style.display = 'none';
    document.getElementById('location-text').style.display = 'block';
  
    const marker = markerPositions.find(m => m.seq === 0);
    if (marker) {
      const geocoder = new kakao.maps.services.Geocoder();
      geocoder.coord2Address(marker.lng, marker.lat, (result, status) => {
        if (status === kakao.maps.services.Status.OK) {
          const address = result[0].address.address_name;
          document.getElementById('location-text').textContent = address;
        } else {
          document.getElementById('location-text').textContent = "위치 정보를 불러올 수 없습니다.";
        }
      });
    }
  }
  else {
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
}

// 선택된 타입 표시
function updateDamageDisplay() {
  const damageDisplay = document.getElementById('damage-display');
  if (!damageDisplay) return;

  const reports = JSON.parse(localStorage.getItem('heldReports') || '[]');
  const seq = reportMode === 'walker' ? 0 : parseInt(document.getElementById('location-select').value);

  const match = reports.find(r => r.seq === seq);

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

// 작성된 설명 표시
function updateDescriptDisplay() {
  const descriptDisplay = document.getElementById('description-display');
  if (!descriptDisplay) return;

  const reports = JSON.parse(localStorage.getItem('heldReports') || '[]');
  const seq = reportMode === 'walker' ? 0 : parseInt(document.getElementById('location-select').value);

  const match = reports.find(r => r.seq === seq);

  if (match) {
    descriptDisplay.textContent = match.description
      ? (match.description.length > 10 ? match.description.slice(0, 10) + '...' : match.description)
      : '';
    descriptDisplay.style.color = '#333';
    descriptDisplay.style.fontSize = '12px';
  } else {
    descriptDisplay.textContent = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  populateLocationSelect();

  let seq;
  let select;
  if (reportMode === 'walker') {
    seq = 0;
  } else {
    select = document.getElementById('location-select');
    seq = parseInt(select.value);
  }
  if (select) {
    select.addEventListener('change', () => {
      updateDamageDisplay();
      updateDescriptDisplay();
    });
  }

  // 초기 상태 반영
  updateDamageDisplay();
  updateDescriptDisplay();
});

// localStorage에 작성 중 데이터 보관
function holdReportData(seq, damageType) {
  const reports = JSON.parse(localStorage.getItem('heldReports') || '[]');
  const marker = markerPositions.find(m => m.seq === seq);
  if (!marker) return;

  const prevReport = reports.find(r => r.seq === seq);
  const existingDescription = prevReport?.description ?? null;

  const filtered = reports.filter(r => r.seq !== seq);
  
  const newReport = {
    seq: seq,
    lat: marker.lat,
    lng: marker.lng,
    timestamp: marker.timestamp,
    damageType: damageType,
    description: existingDescription
  };
  filtered.push(newReport); // 새 항목 추가
  localStorage.setItem('heldReports', JSON.stringify(filtered));
}

// 결함 종류 선택 모달
function selectChoice(elem) {
  selectedDamageType = elem.innerText.trim();
  closeModal();

  let seq;
  if (reportMode === 'walker') {
    seq = 0;
  } else {
    const select = document.getElementById('location-select');
    seq = parseInt(select.value);
  }

  holdReportData(seq, selectedDamageType);

  updateDamageDisplay();
  updateDescriptDisplay();
}

document.addEventListener('DOMContentLoaded', () => {
  const choiceElements = document.querySelectorAll('.choice');
  choiceElements.forEach(choice => {
    choice.addEventListener('click', () => {
      selectChoice(choice);
    });
  });
});

// 설명 입력 모달
document.getElementById('save-description-btn-2').addEventListener('click', () => {
  let seq;
  if (reportMode === 'walker') {
    seq = 0;
  } else {
    const select = document.getElementById('location-select');
    seq = parseInt(select.value);
  }
  const textarea = document.getElementById('custom-description');
  const description = textarea.value.trim();

  const damageType = document.getElementById('damage-display').textContent.trim();
  if (!damageType || damageType === '(종류 선택)') {
    alert('결함 종류를 먼저 선택해주세요.');
    return;
  }

  const reports = JSON.parse(localStorage.getItem('heldReports') || '[]');
  const marker = markerPositions.find(m => m.seq === seq);
  if (!marker) return;

  const filtered = reports.filter(r => r.seq !== seq);

  const newReport = {
    seq: seq,
    lat: marker.lat,
    lng: marker.lng,
    timestamp: marker.timestamp,
    damageType: damageType,
    description: description || null
  };

  filtered.push(newReport);
  localStorage.setItem('heldReports', JSON.stringify(filtered));

  closeModal2();
  updateDamageDisplay();
  updateDescriptDisplay();
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

const types = {
  "차도와 구분 어려움":1,
  "도로 융기":2,
  "도로 파임":3,
  "불법 주차":4,
  "공사 구간":5,
  "직접 입력":6
};

document.addEventListener('DOMContentLoaded', () => {
  const reportBtn = document.getElementById('submit-report');
  if (!reportBtn) return;

  reportBtn.addEventListener('click', async () => {
    const reports = JSON.parse(localStorage.getItem('heldReports') || '[]');

    if (reports.length === 0) {
      const confirmed = confirm("신고할 정보가 없습니다. 신고를 취소하고 홈으로 이동할까요?");
      if (confirmed) {
        window.location.href = "mapstart.html";
      }
      return;
    } else {
      const confirmed = confirm(`총 ${reports.length}건의 결함을 신고합니다. 계속하시겠습니까?`);
      if (!confirmed) return;
    }

    for (const report of reports) {
      const formData = new FormData();

      formData.append('latitude', report.lat);
      formData.append('longitude', report.lng);
      formData.append('timestamp', report.timestamp);
      formData.append('typeId', types[report.damageType]);
      if (report.description) {
        formData.append('description', report.description);
      }

      // localStorage에 저장된 이미지가 있다면 추가
      const imageKey = `image_${report.seq}`;
      const imageDataUrl = localStorage.getItem(imageKey);
      if (imageDataUrl) {
        const blob = await (await fetch(imageDataUrl)).blob();
        formData.append('image', blob, `image_${report.lat}_${report.lng}_${report.seq}.png`);
      }

      const token = localStorage.getItem('accessToken');
      
      try {
        const response = await fetch(`${API_BASE_URL}/reports/report`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}` // 토큰용
          },
          // credentials: 'include',  // 쿠키용
          body: formData
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
    setTimeout(() => {
      window.location.href = "mapstart.html";
    }, 1000);
  });
})