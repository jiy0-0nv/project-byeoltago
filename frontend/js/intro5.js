import { API_BASE_URL } from './config.js';

async function loginCheck() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/check`, {
      method: 'GET',
      credentials: 'include',
    });
  
    if (!res.ok) throw new Error();
    window.location.href = "../mapstart.html";
  } catch {
    window.location.href = "../login.html";
  }
  window.location.href = "../login.html";
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('start-btn')?.addEventListener('click', loginCheck);
});
