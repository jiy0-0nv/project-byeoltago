import { API_BASE_URL } from './config.js';

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".signup-box");
  const usernameInput = document.getElementById("username");

  form.addEventListener("submit", handleSignup);
  usernameInput.addEventListener("input", validateUsernameInput);
});

function validateUsernameInput(event) {
  const input = event.target.value;
  const warning = document.getElementById('username-warning');
  const isValid = /^[a-zA-Z0-9]*$/.test(input);

  warning.style.display = isValid ? 'none' : 'block';
}

function handleSignup(event) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const nickname = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const passwordConfirmation = document.getElementById('confirm-password').value;
  const phoneNumber = document.getElementById('phone').value;
  const agree = document.getElementById('agree').checked;
  const warning = document.getElementById('username-warning');

  if (!/^[a-zA-Z0-9]+$/.test(nickname)) {
    warning.style.display = 'block';
    return;
  }

  if (!email || !nickname || !password || !passwordConfirmation || !phoneNumber || !agree) {
    alert("모든 항목을 입력하고 개인정보 이용에 동의해주세요.");
    return;
  }

  if (password !== passwordConfirmation) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }

  const bike = document.getElementById("bike-animation");
  bike.style.display = "inline";

  fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password, passwordConfirmation, phoneNumber, nickname })
  })
    .then(res => {
      if (!res.ok) throw new Error("회원가입 실패");
      return res.json();
    })
    .then(data => {
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);
    })
    .catch(err => {
      console.error("Signup failed:", err);
      alert("회원가입에 실패했습니다. 입력값을 확인해주세요.");
      bike.style.display = "none";
    });
}
