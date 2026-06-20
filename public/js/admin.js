const API = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'https://architecture-portfolio-production.up.railway.app/api';
// Protect page
const adminToken = localStorage.getItem('adminToken');
if (!adminToken) location.href = 'auth.html';

// Switch tabs
function showTab(tab) {
  document.querySelectorAll('.admin-tab').forEach(t => t.style.display = 'none');
  document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
  document.getElementById(`tab-${tab}`).style.display = 'block';
  document.querySelectorAll('.sidebar-item')[['projects','messages','add'].indexOf(tab)].classList.add('active');

  if (tab === 'projects') loadProjects();
  if (tab === 'messages') loadMessages();
}

// Load projects
async function loadProjects() {
  try {
    const res = await fetch(`${API}/projects`);
    const projects = await res.json();
    const list = document.getElementById('admin-projects-list');

    if (projects.length === 0) {
      list.innerHTML = `<p style="color:var(--muted)">No projects yet. Add your first one!</p>`;
      return;
    }

    list.innerHTML = projects.map(p => `
      <div class="admin-project-item">
        ${p.image
          ? `<img src="/uploads/${p.image}" class="admin-project-thumb" alt="${p.title}"/>`
          : `<div class="admin-project-thumb-placeholder">🏗</div>`
        }
        <div class="admin-project-info">
          <div class="admin-project-title">${p.title}</div>
          <div class="admin-project-meta">${p.category || ''} ${p.year ? '· ' + p.year : ''}</div>
        </div>
        <div class="admin-project-actions">
          <button class="btn-edit" onclick="editProject(${p.id}, '${p.title}', '${p.category}', ${p.year}, \`${p.description}\`)">Edit</button>
          <button class="btn-delete" onclick="deleteProject(${p.id})">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error loading projects:', err);
  }
}

// Save project (add or update)
async function saveProject() {
  const id = document.getElementById('edit-id').value;
  const title = document.getElementById('f-title').value;
  const category = document.getElementById('f-category').value;
  const year = document.getElementById('f-year').value;
  const description = document.getElementById('f-description').value;
  const image = document.getElementById('f-image').files[0];

  if (!title) return showFormMsg('Title is required', 'error');

  const formData = new FormData();
  formData.append('title', title);
  formData.append('category', category);
  formData.append('year', year);
  formData.append('description', description);
  if (image) formData.append('image', image);

  try {
    const url = id ? `${API}/projects/${id}` : `${API}/projects`;
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { authorization: adminToken },
      body: formData
    });
    const data = await res.json();

    if (!res.ok) return showFormMsg(data.message, 'error');

    showFormMsg(id ? 'Project updated!' : 'Project added!', 'success');
    cancelEdit();
    setTimeout(() => showTab('projects'), 1000);
  } catch (err) {
    showFormMsg('Server error', 'error');
  }
}

// Edit project
function editProject(id, title, category, year, description) {
  showTab('add');
  document.getElementById('form-title').textContent = 'Edit Project';
  document.getElementById('edit-id').value = id;
  document.getElementById('f-title').value = title;
  document.getElementById('f-category').value = category;
  document.getElementById('f-year').value = year;
  document.getElementById('f-description').value = description;
  document.getElementById('cancel-edit').style.display = 'inline-block';
}

// Cancel edit
function cancelEdit() {
  document.getElementById('form-title').textContent = 'Add New Project';
  document.getElementById('edit-id').value = '';
  document.getElementById('f-title').value = '';
  document.getElementById('f-category').value = '';
  document.getElementById('f-year').value = '';
  document.getElementById('f-description').value = '';
  document.getElementById('f-image').value = '';
  document.getElementById('cancel-edit').style.display = 'none';
}

// Delete project
async function deleteProject(id) {
  if (!confirm('Delete this project?')) return;

  try {
    const res = await fetch(`${API}/projects/${id}`, {
      method: 'DELETE',
      headers: { authorization: adminToken }
    });
    const data = await res.json();
    alert(data.message);
    loadProjects();
  } catch (err) {
    console.error('Error deleting project:', err);
  }
}

// Load messages
async function loadMessages() {
  try {
    const res = await fetch(`${API}/contacts`, {
      headers: { authorization: adminToken }
    });
    const messages = await res.json();
    const list = document.getElementById('admin-messages-list');

    if (messages.length === 0) {
      list.innerHTML = `<p style="color:var(--muted)">No messages yet.</p>`;
      return;
    }

    list.innerHTML = messages.map(m => `
      <div class="message-item">
        <div class="message-header">
          <div>
            <div class="message-name">${m.name}</div>
            <div class="message-email">${m.email}</div>
          </div>
          <button class="btn-delete" onclick="deleteMessage(${m.id})">Delete</button>
        </div>
        <div class="message-text">${m.message}</div>
        <div class="message-date">${new Date(m.created_at).toLocaleDateString()}</div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error loading messages:', err);
  }
}

// Delete message
async function deleteMessage(id) {
  if (!confirm('Delete this message?')) return;

  try {
    const res = await fetch(`${API}/contacts/${id}`, {
      method: 'DELETE',
      headers: { authorization: adminToken }
    });
    const data = await res.json();
    alert(data.message);
    loadMessages();
  } catch (err) {
    console.error('Error deleting message:', err);
  }
}

function showFormMsg(msg, type) {
  const el = document.getElementById('form-msg');
  el.textContent = msg;
  el.className = `auth-msg ${type}`;
}

function logout() {
  localStorage.removeItem('adminToken');
  location.href = 'auth.html';
}

// Init
loadProjects();