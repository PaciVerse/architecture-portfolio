const API = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : 'https://architecture-portfolio-production.up.railway.app/api';

let allProjects = [];
let currentFilter = 'all';

// Update hero counter
function updateCounter(count) {
  const counter = document.getElementById('hero-counter');
  if (counter) counter.textContent = String(count).padStart(2, '0');
}

// Render projects
function renderProjects(projects) {
  updateCounter(projects.length);
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  if (projects.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <h3>No projects found</h3>
        <p>Try a different search or filter</p>
      </div>`;
    return;
  }

  grid.innerHTML = projects.map(p => `
    <div class="project-card fade-up" onclick="location.href='pages/project.html?id=${p.id}'">
      ${p.image
        ? `<img src="${p.image}" alt="${p.title}"/>`
        : `<div class="project-card-no-img"><span>A</span></div>`
      }
      <div class="project-card-info">
        <div class="project-card-title">${p.title}</div>
        <div class="project-card-meta">
          ${p.category ? `<span class="category-badge">${p.category}</span>` : ''}
          ${p.year ? `<span class="project-year">${p.year}</span>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

// Filter and search
function filterProjects() {
  const search = document.getElementById('search-input')?.value.toLowerCase() || '';

  const filtered = allProjects.filter(p => {
    const matchFilter = currentFilter === 'all' || p.category === currentFilter;
    const matchSearch =
      p.title.toLowerCase().includes(search) ||
      (p.category && p.category.toLowerCase().includes(search)) ||
      (p.year && String(p.year).includes(search)) ||
      (p.description && p.description.toLowerCase().includes(search));
    return matchFilter && matchSearch;
  });

  renderProjects(filtered);
}

// Set active filter
function setFilter(btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentFilter = btn.dataset.filter;
  filterProjects();
}

// Load all projects
async function loadProjects() {
  try {
    const res = await fetch(`${API}/projects`);
    allProjects = await res.json();
    renderProjects(allProjects);
  } catch (err) {
    console.error('Error loading projects:', err);
  }
}

// Update nav
function updateNav() {
  const token = localStorage.getItem('visitorToken');
  const username = localStorage.getItem('visitorUsername');
  const adminToken = localStorage.getItem('adminToken');
  const navAuth = document.getElementById('nav-auth');

  if (!navAuth) return;

  if (adminToken) {
    navAuth.innerHTML = `<a href="pages/admin.html" class="btn-outline">Dashboard</a>`;
  } else if (token) {
    navAuth.innerHTML = `
      <div style="display:flex;align-items:center;gap:1rem">
        <div style="display:flex;align-items:center;gap:0.5rem">
          <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--blue),#7B5FFF);display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:600;color:white">
            ${username.charAt(0).toUpperCase()}
          </div>
          <span style="font-size:0.85rem;color:var(--text)">${username}</span>
        </div>
        <a href="#" class="btn-outline" onclick="logout()">Logout</a>
      </div>
    `;
  } else {
    navAuth.innerHTML = `<a href="pages/auth.html" class="btn-outline">Login</a>`;
  }
}

function logout() {
  localStorage.removeItem('visitorToken');
  localStorage.removeItem('visitorUsername');
  localStorage.removeItem('adminToken');
  location.reload();
}

// Init
updateNav();
loadProjects();