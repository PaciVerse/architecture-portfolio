const API = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'https://architecture-portfolio-production.up.railway.app/api';

const params = new URLSearchParams(window.location.search);
const projectId = params.get('id');
let selectedRating = 0;

// Load project
async function loadProject() {
  try {
    const res = await fetch(`${API}/projects/${projectId}`);
    const p = await res.json();

    document.title = `${p.title} | Oni DesignStudio`;
    document.getElementById('project-title').textContent = p.title;
    document.getElementById('project-category').textContent = p.category || '';
    document.getElementById('project-year').textContent = p.year || '';
    document.getElementById('project-description').textContent = p.description || '';

    const hero = document.getElementById('project-hero');
    if (p.image) {
      hero.style.backgroundImage = `url(${p.image})`;
      hero.style.backgroundSize = 'cover';
      hero.style.backgroundPosition = 'center';
    }
  } catch (err) {
    console.error('Error loading project:', err);
  }
}

// Load likes
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

// Toggle like
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

// Load reviews
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

// Star rating
document.querySelectorAll('.star').forEach(star => {
  star.addEventListener('click', () => {
    selectedRating = parseInt(star.dataset.value);
    document.querySelectorAll('.star').forEach((s, i) => {
      s.classList.toggle('active', i < selectedRating);
    });
  });
});

// Submit review
async function submitReview() {
  const token = localStorage.getItem('visitorToken');
  const comment = document.getElementById('review-comment').value;

  if (!selectedRating) return alert('Please select a rating');
  if (!comment.trim()) return alert('Please write a comment');

  try {
    const res = await fetch(`${API}/reviews/${projectId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: token },
      body: JSON.stringify({ rating: selectedRating, comment })
    });
    const data = await res.json();
    alert(data.message);
    document.getElementById('review-comment').value = '';
    selectedRating = 0;
    document.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
    loadReviews();
  } catch (err) {
    console.error('Error submitting review:', err);
  }
}

// Delete review
async function deleteReview(id) {
  const token = localStorage.getItem('visitorToken');
  if (!confirm('Delete this review?')) return;

  try {
    const res = await fetch(`${API}/reviews/${id}`, {
      method: 'DELETE',
      headers: { authorization: token }
    });
    const data = await res.json();
    alert(data.message);
    loadReviews();
  } catch (err) {
    console.error('Error deleting review:', err);
  }
}

// Check auth for review form
function checkAuth() {
  const token = localStorage.getItem('visitorToken');
  const adminToken = localStorage.getItem('adminToken');
  const navAuth = document.getElementById('nav-auth');

  if (token) {
    document.getElementById('review-form').style.display = 'block';
    document.getElementById('review-login-msg').style.display = 'none';
    const username = localStorage.getItem('visitorUsername');
    if (navAuth) navAuth.innerHTML = `
      <span style="font-size:0.8rem;color:var(--gold);margin-right:1rem">${username}</span>
      <a href="#" class="btn-outline" onclick="logout()">Logout</a>
    `;
  } else if (adminToken) {
    document.getElementById('review-form').style.display = 'none';
    document.getElementById('review-login-msg').style.display = 'none';
    if (navAuth) navAuth.innerHTML = `<a href="admin.html" class="btn-outline">Dashboard</a>`;
  }
}

function logout() {
  localStorage.removeItem('visitorToken');
  localStorage.removeItem('visitorUsername');
  localStorage.removeItem('adminToken');
  location.reload();
}

// Init
loadProject();
loadLikes();
loadReviews();
checkAuth();