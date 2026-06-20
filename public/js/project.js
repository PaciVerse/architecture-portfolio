const API = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : 'https://architecture-portfolio-production.up.railway.app/api';

const params = new URLSearchParams(window.location.search);
const projectId = params.get('id');
let selectedRating = 0;
let currentImageIndex = 0;
let projectImages = [];

async function loadProject() {
  try {
    const res = await fetch(`${API}/projects/${projectId}`);
    const p = await res.json();

    document.title = `${p.title} | Oni DesignStudio`;
    document.getElementById('project-title').textContent = p.title;
    document.getElementById('project-category').textContent = p.category || '';
    document.getElementById('project-year').textContent = p.year || '';
    document.getElementById('project-description').textContent = p.description || '';

    projectImages = p.images || [];

    const hero = document.getElementById('project-hero');
    const coverImage = projectImages.find(img => img.is_cover) || projectImages[0];

    if (coverImage) {
      hero.style.backgroundImage = `url(${coverImage.image})`;
      hero.style.backgroundSize = 'cover';
      hero.style.backgroundPosition = 'center';
    } else if (p.image) {
      hero.style.backgroundImage = `url(${p.image})`;
      hero.style.backgroundSize = 'cover';
      hero.style.backgroundPosition = 'center';
    }

    // Render gallery
    if (projectImages.length > 0) {
      const gallerySection = document.getElementById('gallery-section');
      gallerySection.style.display = 'block';
      renderGallery();
    }

  } catch (err) {
    console.error('Error loading project:', err);
  }
}

function renderGallery() {
  const gallery = document.getElementById('gallery-grid');
  gallery.innerHTML = projectImages.map((img, index) => `
    <div class="gallery-item ${img.is_cover ? 'is-cover' : ''}" onclick="openLightbox(${index})">
      <img src="${img.image}" alt="Project image ${index + 1}"/>
      ${img.is_cover ? `<span class="gallery-cover-badge">Cover</span>` : ''}
    </div>
  `).join('');
}

function openLightbox(index) {
  currentImageIndex = index;
  const lightbox = document.getElementById('lightbox');
  lightbox.style.display = 'flex';
  updateLightbox();
}

function updateLightbox() {
  document.getElementById('lightbox-img').src = projectImages[currentImageIndex].image;
  document.getElementById('lightbox-counter').textContent = `${currentImageIndex + 1} / ${projectImages.length}`;
}

function lightboxNext() {
  currentImageIndex = (currentImageIndex + 1) % projectImages.length;
  updateLightbox();
}

function lightboxPrev() {
  currentImageIndex = (currentImageIndex - 1 + projectImages.length) % projectImages.length;
  updateLightbox();
}

function closeLightbox() {
  document.getElementById('lightbox').style.display = 'none';
}

async function loadLikes() {
  try {
    const res = await fetch(`${API}/likes/${projectId}`);
    const data = await res.json();
    document.getElementById('like-count').textContent = data.likes;

    const token = localStorage.getItem('visitorToken');
    if (token) {
      const checkRes = await fetch(`${API}/likes/${projectId}/check`, {
        headers: { authorization: token }
      });
      const checkData = await checkRes.json();
      if (checkData.liked) {
        document.getElementById('like-btn').classList.add('liked');
        document.getElementById('like-icon').textContent = '♥';
      }
    }
  } catch (err) {
    console.error('Error loading likes:', err);
  }
}

async function toggleLike() {
  const token = localStorage.getItem('visitorToken');
  if (!token) return location.href = 'auth.html';

  try {
    const res = await fetch(`${API}/likes/${projectId}`, {
      method: 'POST',
      headers: { authorization: token }
    });
    const data = await res.json();
    const btn = document.getElementById('like-btn');
    const icon = document.getElementById('like-icon');

    if (data.liked) {
      btn.classList.add('liked');
      icon.textContent = '♥';
    } else {
      btn.classList.remove('liked');
      icon.textContent = '♡';
    }
    loadLikes();
  } catch (err) {
    console.error('Error toggling like:', err);
  }
}

async function loadReviews() {
  try {
    const res = await fetch(`${API}/reviews/${projectId}`);
    const reviews = await res.json();
    const list = document.getElementById('reviews-list');
    const visitorToken = localStorage.getItem('visitorToken');

    if (reviews.length === 0) {
      list.innerHTML = `<p style="color:var(--muted);font-size:0.85rem">No reviews yet. Be the first!</p>`;
      return;
    }

    list.innerHTML = reviews.map(r => `
      <div class="review-item">
        <div class="review-header">
          <div>
            <span class="review-username">${r.username}</span>
            <span class="review-stars" style="margin-left:1rem">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
          </div>
          ${visitorToken ? `<button class="delete-review" onclick="deleteReview(${r.id})">Delete</button>` : ''}
        </div>
        <div class="review-comment">${r.comment}</div>
        <div class="review-date">${new Date(r.created_at).toLocaleDateString()}</div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error loading reviews:', err);
  }
}

document.querySelectorAll('.star').forEach(star => {
  star.addEventListener('click', () => {
    selectedRating = parseInt(star.dataset.value);
    document.querySelectorAll('.star').forEach((s, i) => {
      s.classList.toggle('active', i < selectedRating);
    });
  });
});

async function submitReview() {
  const token = localStorage.getItem('visitorToken');
  const comment = document.getElementById('review-comment').value;

  if (!selectedRating) return showToast('Please select a rating', 'error');
  if (!comment.trim()) return showToast('Please write a comment', 'error');

  try {
    const res = await fetch(`${API}/reviews/${projectId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: token },
      body: JSON.stringify({ rating: selectedRating, comment })
    });
    const data = await res.json();
    showToast(data.message, res.ok ? 'success' : 'error');
    if (res.ok) {
      document.getElementById('review-comment').value = '';
      selectedRating = 0;
      document.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
      loadReviews();
    }
  } catch (err) {
    showToast('Server error', 'error');
  }
}

function deleteReview(id) {
  showConfirm('This review will be permanently deleted.', async () => {
    const token = localStorage.getItem('visitorToken');
    try {
      const res = await fetch(`${API}/reviews/${id}`, {
        method: 'DELETE',
        headers: { authorization: token }
      });
      const data = await res.json();
      showToast(data.message, 'success');
      loadReviews();
    } catch (err) {
      showToast('Error deleting review', 'error');
    }
  });
}

function checkAuth() {
  const token = localStorage.getItem('visitorToken');
  const adminToken = localStorage.getItem('adminToken');
  const username = localStorage.getItem('visitorUsername');
  const navAuth = document.getElementById('nav-auth');

  if (token) {
    document.getElementById('review-form').style.display = 'block';
    document.getElementById('review-login-msg').style.display = 'none';
    if (navAuth) navAuth.innerHTML = `
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
  } else if (adminToken) {
    document.getElementById('review-form').style.display = 'none';
    document.getElementById('review-login-msg').style.display = 'none';
    if (navAuth) navAuth.innerHTML = `<a href="admin.html" class="btn-outline">Dashboard</a>`;
  } else {
    if (navAuth) navAuth.innerHTML = `<a href="auth.html" class="btn-outline">Login</a>`;
  }
}

function logout() {
  localStorage.removeItem('visitorToken');
  localStorage.removeItem('visitorUsername');
  localStorage.removeItem('adminToken');
  location.reload();
}

// Keyboard navigation for lightbox
document.addEventListener('keydown', (e) => {
  const lightbox = document.getElementById('lightbox');
  if (lightbox.style.display === 'flex') {
    if (e.key === 'ArrowRight') lightboxNext();
    if (e.key === 'ArrowLeft') lightboxPrev();
    if (e.key === 'Escape') closeLightbox();
  }
});

loadProject();
loadLikes();
loadReviews();
checkAuth();