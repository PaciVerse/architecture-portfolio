const API = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : 'https://architecture-portfolio-production.up.railway.app/api';

const adminToken = localStorage.getItem('adminToken');
if (!adminToken) location.href = 'auth.html';

function showTab(tab) {
  document.querySelectorAll('.admin-tab').forEach(t => t.style.display = 'none');
  document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
  document.getElementById(`tab-${tab}`).style.display = 'block';
  document.querySelectorAll('.sidebar-item')[['projects','messages','add'].indexOf(tab)].classList.add('active');
  if (tab === 'projects') loadProjects();
  if (tab === 'messages') loadMessages();
}

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
        ${p.cover_image || p.image
          ? `<img src="${p.cover_image || p.image}" class="admin-project-thumb" alt="${p.title}"/>`
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

// Preview images before upload with caption inputs
function previewImages() {
  const files = document.getElementById('f-image').files;
  const container = document.getElementById('image-previews');

  if (files.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = Array.from(files).map((file, index) => {
    const url = URL.createObjectURL(file);
    return `
      <div class="image-preview-item">
        <div class="image-preview-thumb-wrap">
          <img src="${url}" class="image-preview-thumb" alt="preview"/>
          ${index === 0 ? `<span class="cover-badge">Cover</span>` : ''}
        </div>
        <input
          type="text"
          class="caption-input"
          id="caption-${index}"
          placeholder="Add a caption for this image (optional)"
        />
      </div>
    `;
  }).join('');
}

async function saveProject() {
  const id = document.getElementById('edit-id').value;
  const title = document.getElementById('f-title').value;
  const category = document.getElementById('f-category').value;
  const year = document.getElementById('f-year').value;
  const description = document.getElementById('f-description').value;
  const images = document.getElementById('f-image').files;

  if (!title) return showToast('Title is required', 'error');

  const formData = new FormData();
  formData.append('title', title);
  formData.append('category', category);
  formData.append('year', year);
  formData.append('description', description);

  for (let i = 0; i < images.length; i++) {
    formData.append('images', images[i]);
    const caption = document.getElementById(`caption-${i}`)?.value || '';
    formData.append('captions', caption);
  }

  try {
    const url = id ? `${API}/projects/${id}` : `${API}/projects`;
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { authorization: adminToken },
      body: formData
    });
    const data = await res.json();

    if (!res.ok) return showToast(data.message, 'error');

    showToast(id ? 'Project updated!' : 'Project added!', 'success');
    cancelEdit();
    setTimeout(() => showTab('projects'), 1000);
  } catch (err) {
    showToast('Server error', 'error');
  }
}

function editProject(id, title, category, year, description) {
  showTab('add');
  document.getElementById('form-title').textContent = 'Edit Project';
  document.getElementById('edit-id').value = id;
  document.getElementById('f-title').value = title;
  document.getElementById('f-category').value = category;
  document.getElementById('f-year').value = year;
  document.getElementById('f-description').value = description;
  document.getElementById('cancel-edit').style.display = 'inline-block';
  document.getElementById('current-images-section').style.display = 'block';
  loadProjectImages(id);
}

async function loadProjectImages(projectId) {
  try {
    const res = await fetch(`${API}/projects/${projectId}`);
    const project = await res.json();
    const container = document.getElementById('current-images');

    if (!project.images || project.images.length === 0) {
      container.innerHTML = `<p style="color:var(--muted);font-size:0.8rem">No images yet.</p>`;
      return;
    }

    container.innerHTML = project.images.map(img => `
      <div class="image-thumb-wrap" id="img-${img.id}">
        <img src="${img.image}" class="image-thumb" alt="project image"/>
        ${img.is_cover ? `<span class="cover-badge">Cover</span>` : `<button class="btn-set-cover" onclick="setCover(${projectId}, ${img.id})">Set Cover</button>`}
        <button class="btn-del-img" onclick="deleteImage(${projectId}, ${img.id})">×</button>
        <input
          type="text"
          class="caption-input-small"
          value="${img.caption || ''}"
          placeholder="Caption..."
          onblur="updateCaption(${projectId}, ${img.id}, this.value)"
        />
      </div>
    `).join('');
  } catch (err) {
    console.error('Error loading images:', err);
  }
}

async function updateCaption(projectId, imageId, caption) {
  try {
    await fetch(`${API}/projects/${projectId}/images/${imageId}/caption`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', authorization: adminToken },
      body: JSON.stringify({ caption })
    });
    showToast('Caption saved!', 'success');
  } catch (err) {
    showToast('Error saving caption', 'error');
  }
}

async function deleteImage(projectId, imageId) {
  showConfirm('Delete this image?', async () => {
    try {
      const res = await fetch(`${API}/projects/${projectId}/images/${imageId}`, {
        method: 'DELETE',
        headers: { authorization: adminToken }
      });
      const data = await res.json();
      showToast(data.message, 'success');
      loadProjectImages(projectId);
    } catch (err) {
      showToast('Error deleting image', 'error');
    }
  });
}

async function setCover(projectId, imageId) {
  try {
    const res = await fetch(`${API}/projects/${projectId}/images/${imageId}/cover`, {
      method: 'PUT',
      headers: { authorization: adminToken }
    });
    const data = await res.json();
    showToast(data.message, 'success');
    loadProjectImages(projectId);
  } catch (err) {
    showToast('Error setting cover', 'error');
  }
}

function cancelEdit() {
  document.getElementById('form-title').textContent = 'Add New Project';
  document.getElementById('edit-id').value = '';
  document.getElementById('f-title').value = '';
  document.getElementById('f-category').value = '';
  document.getElementById('f-year').value = '';
  document.getElementById('f-description').value = '';
  document.getElementById('f-image').value = '';
  document.getElementById('cancel-edit').style.display = 'none';
  document.getElementById('current-images-section').style.display = 'none';
  document.getElementById('current-images').innerHTML = '';
  document.getElementById('image-previews').innerHTML = '';
}

function deleteProject(id) {
  showConfirm('This action cannot be undone. The project will be permanently deleted.', async () => {
    try {
      const res = await fetch(`${API}/projects/${id}`, {
        method: 'DELETE',
        headers: { authorization: adminToken }
      });
      const data = await res.json();
      showToast(data.message, 'success');
      loadProjects();
    } catch (err) {
      showToast('Error deleting project', 'error');
    }
  });
}

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

function deleteMessage(id) {
  showConfirm('This message will be permanently deleted.', async () => {
    try {
      const res = await fetch(`${API}/contacts/${id}`, {
        method: 'DELETE',
        headers: { authorization: adminToken }
      });
      const data = await res.json();
      showToast(data.message, 'success');
      loadMessages();
    } catch (err) {
      showToast('Error deleting message', 'error');
    }
  });
}

function logout() {
  localStorage.removeItem('adminToken');
  location.href = 'auth.html';
}

loadProjects();