import { API_BASE_URL } from './config.js';

document.addEventListener("DOMContentLoaded", () => {
  loginCheck();
  const form = document.querySelector(".login-box");
  form.addEventListener("submit", handleLogin);
});

function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!email || !password) {
    alert("이메일과 비밀번호를 입력해주세요.");
    return;
  }

  // 자전거 애니메이션 표시
  const bike = document.getElementById("bike-animation");
  if (bike) {
    bike.style.display = "inline";
  }

  fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    // credentials: "include", // 쿠키를 포함하여 요청
    body: JSON.stringify({ email, password })
  })
    .then(res => {
      if (!res.ok) throw new Error("로그인 실패");
      return res.json();
    })
    .then(data => {
      localStorage.setItem('accessToken', data.token);
      const mode = localStorage.getItem('reportMode');
      const redirect = localStorage.getItem('redirect');
      
      if (mode === 'driver' && redirect === 'driver-report') {
        window.location.href = "report.html";
      } else {
        window.location.href = "mapstart.html";
      }
    })
    .catch(err => {
      console.error("Login failed:", err);
      alert("로그인 정보가 올바르지 않습니다.");
      if (bike) bike.style.display = "none"
    });
}

async function loginCheck() {
  const token = localStorage.getItem('accessToken');
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/check`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return;

    alert("로그인 정보가 존재합니다. 지도 홈으로 이동합니다.");
    window.location.href = "mapstart.html";

  } catch {
    return;
  }
}

document.getElementById('guest-login-btn').addEventListener('click', () => {
  document.getElementById('email').value = 'byeoltago@gmail.com';
  document.getElementById('password').value = '20250620';

  // 로그인 form submit 트리거
  document.querySelector('.login-box').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
});