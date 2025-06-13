import { API_BASE_URL } from './config.js';

document.addEventListener("DOMContentLoaded", () => {
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
      credentials: "include", // 쿠키를 포함하여 요청
      body: JSON.stringify({ email, password })
    })
      .then(res => {
        if (!res.ok) throw new Error("로그인 실패");
        return res.json();
      })
      .then(data => {
        // 로그인 성공 후 1초 후 페이지 이동
        setTimeout(() => {
          window.location.href = "mapstart.html";
        }, 1000);
      })
      .catch(err => {
        console.error("Login failed:", err);
        alert("로그인 정보가 올바르지 않습니다.");
        if (bike) bike.style.display = "none"
      });
  }
