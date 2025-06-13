import { API_BASE_URL } from './config.js';

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".signup-box");
  form.addEventListener("submit", handleSignup);

  const usernameInput = document.getElementById("username");
  usernameInput.addEventListener("input", validateUsernameInput);
});

function validateUsernameInput(event) {
  const input = event.target.value;
  const warning = document.getElementById('username-warning');
  const isValid = /^[가-힣a-zA-Z0-9]{2,100}$/u.test(input);
  warning.style.display = isValid ? 'none' : 'block';
}

function handleSignup(event) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  const phone = document.getElementById('phone').value;
  const agree = document.getElementById('agree').checked;

  if (!/^[가-힣a-zA-Z0-9]{2,100}$/u.test(username)) {
    document.getElementById('username-warning').style.display = 'block';
    return;
  }

  if (!email || !username || !password || !confirmPassword || !phone || !agree) {
    alert("모든 항목을 입력하고 개인정보 이용에 동의해주세요.");
    return;
  }

  if (password !== confirmPassword) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }

  fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
        email,
        password,
        password_confirmation: confirmPassword,
        phone_number: phone,
        nickname: username
    })
  })
    .then(res => {
      if (!res.ok) throw new Error("회원가입 실패");
      return res.json();
    })
    .then(() => {
      document.getElementById("bike-animation").style.display = "inline";
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);
    })
    .catch(err => {
      console.error("Signup failed:", err);
      alert("회원가입 실패");
    });
}
