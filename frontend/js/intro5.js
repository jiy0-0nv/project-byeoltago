import { API_BASE_URL } from './config.js';

async function loginCheck() {
  const token = localStorage.getItem('accessToken');
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/check`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error();
    window.location.href = "../mapstart.html";
  } catch {
    window.location.href = "../login.html";
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('start-btn')?.addEventListener('click', loginCheck);
});
