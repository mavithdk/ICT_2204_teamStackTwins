// ── NAVBAR SCROLL EFFECT ──
(function () {
  const navbar = document.getElementById('mainNavbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });
})();

// ── FADE-IN ANIMATION (Intersection Observer) ──
(function () {
  const elements = document.querySelectorAll('.fade-in');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || '0', 10);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  elements.forEach(el => observer.observe(el));
})();

// ── SMOOTH SCROLLING ──
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.smooth-scroll, a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});

// ── HERO COUNTER ANIMATION (index.html) ──
function animateCounter(el, target, duration) {
  if (!el) return;
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      el.textContent = target;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(start);
    }
  }, 16);
}

window.addEventListener('load', () => {
  // Load stats from localStorage for home page display
  const subjects = JSON.parse(localStorage.getItem('ssp_subjects') || '[]');
  const tasks = JSON.parse(localStorage.getItem('ssp_tasks') || '[]');

  const statSubjects = document.getElementById('statSubjects');
  const statTasks = document.getElementById('statTasks');

  if (statSubjects) animateCounter(statSubjects, subjects.length || 3, 1500);
  if (statTasks) animateCounter(statTasks, tasks.length || 8, 1500);
});

// ── FEATURE CARD HOVER EVENTS ──
document.querySelectorAll('[data-hover]').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transition = 'all 0.3s cubic-bezier(0.4,0,0.2,1)';
  });
});

// ── CONTACT PAGE: FAQ TOGGLE ──
window.toggleFaq = function (el) {
  el.classList.toggle('open');
};

// ── TOAST HELPER ──
window.showToast = function (msg, type = 'success') {
  const toastEl = document.getElementById('appToast');
  const msgEl = document.getElementById('toastMsg');
  if (!toastEl || !msgEl) return;

  msgEl.textContent = msg;
  toastEl.style.background = type === 'error' ? '#2d1a1a' : '#1a2d1a';
  toastEl.style.borderColor = type === 'error' ? '#e74c3c44' : '#5cb85c44';

  const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
  toast.show();
};