const API = 'https://architecture-portfolio-production.up.railway.app/api';
function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach((t, i) => {
    t.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'register'));
  });
  document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
}

function showMsg(id, msg, type) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = `auth-msg ${type}`;
}

// Visitor login
async function login() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch(`${API}/visitors/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) return showMsg('login-msg', data.message, 'error');

    localStorage.setItem('visitorToken', data.token);
    localStorage.setItem('visitorUsername', data.username);
    showMsg('login-msg', 'Login successful! Redirecting...', 'success');
    setTimeout(() => location.href = '../index.html', 1000);
  } catch (err) {
    showMsg('login-msg', 'Server error', 'error');
  }
}

// Visitor register
async function register() {
  const username = document.getElementById('reg-username').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;

  try {
    const res = await fetch(`${API}/visitors/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();

    if (!res.ok) return showMsg('reg-msg', data.message, 'error');

    showMsg('reg-msg', 'Account created! Please login.', 'success');
    setTimeout(() => switchTab('login'), 1500);
  } catch (err) {
    showMsg('reg-msg', 'Server error', 'error');
  }
}

// Show admin form
function adminLogin() {
  const form = document.getElementById('admin-form');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

// Admin login
async function loginAdmin() {
  const username = document.getElementById('admin-username').value;
  const password = document.getElementById('admin-password').value;

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (!res.ok) return showMsg('admin-msg', data.message, 'error');

    localStorage.setItem('adminToken', data.token);
    showMsg('admin-msg', 'Welcome back! Redirecting...', 'success');
    setTimeout(() => location.href = 'admin.html', 1000);
  } catch (err) {
    showMsg('admin-msg', 'Server error', 'error');
  }
}

// Redirect if already logged in
if (localStorage.getItem('visitorToken') || localStorage.getItem('adminToken')) {
  location.href = '../index.html';
}