const API = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : 'https://architecture-portfolio-production.up.railway.app/api';


// Update hero counter
function updateCounter(count) {
  const counter = document.getElementById('hero-counter');
  if (counter) counter.textContent = String(count).padStart(2, '0');
}

// Load projects
async function loadProjects(filter = 'all') {
  try {
    const res = await fetch(`${API}/projects`);
    const projects = await res.json();

    const filtered = filter === 'all'
      ? projects
      : projects.filter(p => p.category === filter);

    updateCounter(filtered.length);

    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    if (filtered.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:4rem;color:var(--muted)">No projects found.</div>`;
      return;
    }

    grid.innerHTML = filtered.map(p => `
      <div class="project-card fade-up" onclick="location.href='pages/project.html?id=${p.id}'">
        ${p.image
          ? `<img src="/uploads/${p.image}" alt="${p.title}"/>`
          : `<div class="project-card-no-img"><span>A</span></div>`
        }
        <div class="project-card-info">
          <div class="project-card-title">${p.title}</div>
          <div class="project-card-meta">${p.category || ''} ${p.year ? '· ' + p.year : ''}</div>
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error('Error loading projects:', err);
  }
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadProjects(btn.dataset.filter);
  });
});

// Check auth for nav
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
      <span style="font-size:0.8rem;color:var(--gold);margin-right:1rem">${username}</span>
      <a href="#" class="btn-outline" onclick="logout()">Logout</a>
    `;
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