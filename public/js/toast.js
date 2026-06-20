// Create container
const toastContainer = document.createElement('div');
toastContainer.className = 'toast-container';
document.body.appendChild(toastContainer);

function showToast(message, type = 'info', duration = 3000) {
  const icons = { success: '✓', error: '✕', info: 'ℹ' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="removeToast(this.parentElement)">×</button>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => removeToast(toast), duration);
}

function removeToast(toast) {
  if (!toast) return;
  toast.classList.add('hiding');
  setTimeout(() => toast.remove(), 300);
}

function showConfirm(message, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box">
      <div class="modal-icon">🗑️</div>
      <div class="modal-title">Are you sure?</div>
      <div class="modal-message">${message}</div>
      <div class="modal-actions">
        <button class="modal-cancel" id="modal-cancel">Cancel</button>
        <button class="modal-confirm" id="modal-confirm">Delete</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('modal-cancel').onclick = () => overlay.remove();
  document.getElementById('modal-confirm').onclick = () => {
    overlay.remove();
    onConfirm();
  };

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
}