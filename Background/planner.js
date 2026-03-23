/* ═══════════════════════════════════════════════════════
   Smart Study Planner — planner.js
   Subjects, Countdown Timers, Tasks, Progress Bar
   ICT 2204 / COM 2303 | Rajarata University of Sri Lanka
═══════════════════════════════════════════════════════ */

// ── STATE ──
let subjects = JSON.parse(localStorage.getItem('ssp_subjects') || '[]');
let tasks = JSON.parse(localStorage.getItem('ssp_tasks') || '[]');
let selectedColor = '#4a90d9';
let selectedSubjectId = null;
let countdownIntervals = {};

// ── SAVE ──
function save() {
  localStorage.setItem('ssp_subjects', JSON.stringify(subjects));
  localStorage.setItem('ssp_tasks', JSON.stringify(tasks));
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  // SVG gradient for progress ring
  const svgDefs = `<defs>
    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#4a90d9"/>
      <stop offset="100%" style="stop-color:#7b61ff"/>
    </linearGradient>
  </defs>`;
  const ring = document.querySelector('.progress-ring');
  if (ring) ring.insertAdjacentHTML('afterbegin', svgDefs);

  setupColorPicker();
  setupSubjectForm();
  setupTaskForm();
  renderSubjects();
  renderTasks();
  updateProgress();
  setMinDate();
  updateTaskSubjectSelect();
});

// ── SET MIN DATE ──
function setMinDate() {
  const dateInput = document.getElementById('examDate');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }
}

// ── COLOR PICKER ──
function setupColorPicker() {
  const dots = document.querySelectorAll('.color-dot');
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      dots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      selectedColor = dot.dataset.color;
    });
  });
}

// ── FORM TOGGLE ──
window.toggleForm = function () {
  const body = document.getElementById('formBody');
  const btn = document.getElementById('toggleFormBtn');
  if (!body || !btn) return;
  const isHidden = body.style.display === 'none';
  body.style.display = isHidden ? '' : 'none';
  btn.textContent = isHidden ? 'Collapse ▲' : 'Expand ▼';
};

window.resetForm = function () {
  document.getElementById('addSubjectForm').reset();
  clearErrors(['subjectName', 'examDate']);
  const dots = document.querySelectorAll('.color-dot');
  dots.forEach((d, i) => d.classList.toggle('active', i === 0));
  selectedColor = '#4a90d9';
};

// ── VALIDATION HELPER ──
function setError(fieldId, msg) {
  const input = document.getElementById(fieldId);
  const err = document.getElementById('err-' + fieldId);
  if (input) input.classList.toggle('is-invalid', !!msg);
  if (err) err.textContent = msg || '';
}

function clearErrors(fields) {
  fields.forEach(f => setError(f, ''));
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── SUBJECT FORM ──
function setupSubjectForm() {
  const form = document.getElementById('addSubjectForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('subjectName').value.trim();
    const examDate = document.getElementById('examDate').value;
    const code = document.getElementById('moduleCode').value.trim();
    const credits = document.getElementById('creditHours').value;

    let valid = true;

    if (!name) { setError('subjectName', 'Subject name is required.'); valid = false; }
    else if (name.length < 2) { setError('subjectName', 'Name must be at least 2 characters.'); valid = false; }
    else { setError('subjectName', ''); }

    if (!examDate) { setError('examDate', 'Exam date is required.'); valid = false; }
    else if (new Date(examDate) < new Date().setHours(0,0,0,0)) {
      setError('examDate', 'Exam date must be in the future.'); valid = false;
    } else { setError('examDate', ''); }

    if (!valid) return;

    const subject = {
      id: Date.now().toString(),
      name,
      code,
      examDate,
      color: selectedColor,
      credits: credits || '—',
      addedOn: new Date().toLocaleDateString()
    };

    subjects.push(subject);
    save();
    renderSubjects();
    updateTaskSubjectSelect();
    resetForm();
    showToast(`✅ "${name}" added successfully!`);
  });
}

// ── RENDER SUBJECTS ──
function renderSubjects() {
  const grid = document.getElementById('subjectsGrid');
  const empty = document.getElementById('emptyState');
  const count = document.getElementById('subjectCount');
  if (!grid) return;

  // Clear old countdown intervals
  Object.values(countdownIntervals).forEach(clearInterval);
  countdownIntervals = {};

  if (subjects.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    if (count) count.textContent = '0 subjects';
    return;
  }

  if (empty) empty.style.display = 'none';
  if (count) count.textContent = `${subjects.length} subject${subjects.length !== 1 ? 's' : ''}`;

  grid.innerHTML = subjects.map(s => `
    <div class="col-md-6 col-lg-4 fade-in visible">
      <div class="subject-card" style="border-left-color:${s.color}" onclick="openModal('${s.id}')">
        <div class="subject-card-header">
          <div class="subject-name">${escHtml(s.name)}</div>
          ${s.code ? `<div class="subject-code-badge">${escHtml(s.code)}</div>` : ''}
        </div>
        <div class="exam-date-label">📅 Exam: ${formatDate(s.examDate)}</div>
        <div class="countdown-display" id="cd-${s.id}">
          <div class="countdown-units">
            <div class="countdown-unit"><span class="count-num cd-d" style="color:${s.color}">--</span><span class="count-lbl">days</span></div>
            <div class="countdown-unit"><span class="count-num cd-h" style="color:${s.color}">--</span><span class="count-lbl">hrs</span></div>
            <div class="countdown-unit"><span class="count-num cd-m" style="color:${s.color}">--</span><span class="count-lbl">min</span></div>
            <div class="countdown-unit"><span class="count-num cd-s" style="color:${s.color}">--</span><span class="count-lbl">sec</span></div>
          </div>
        </div>
        <div class="card-click-hint">Click for details →</div>
      </div>
    </div>
  `).join('');

  // Start countdowns
  subjects.forEach(s => startCountdown(s));
}

// ── COUNTDOWN TIMER ──
function startCountdown(subject) {
  const cdEl = document.getElementById('cd-' + subject.id);
  if (!cdEl) return;

  function update() {
    const examTime = new Date(subject.examDate).getTime();
    const now = Date.now();
    const diff = examTime - now;

    if (diff <= 0) {
      cdEl.innerHTML = `<div style="font-size:0.9rem;font-weight:700;color:#e74c3c;">📢 EXAM TIME!</div>`;
      clearInterval(countdownIntervals[subject.id]);
      return;
    }

    const days = Math.floor(diff / 86400000);
    const hrs = Math.floor((diff % 86400000) / 3600000);
    const min = Math.floor((diff % 3600000) / 60000);
    const sec = Math.floor((diff % 60000) / 1000);

    const dEl = cdEl.querySelector('.cd-d');
    const hEl = cdEl.querySelector('.cd-h');
    const mEl = cdEl.querySelector('.cd-m');
    const sEl = cdEl.querySelector('.cd-s');

    if (dEl) dEl.textContent = pad(days);
    if (hEl) hEl.textContent = pad(hrs);
    if (mEl) mEl.textContent = pad(min);
    if (sEl) sEl.textContent = pad(sec);
  }

  update();
  countdownIntervals[subject.id] = setInterval(update, 1000);
}

function pad(n) { return String(n).padStart(2, '0'); }

// ── MODAL ──
window.openModal = function (id) {
  const subject = subjects.find(s => s.id === id);
  if (!subject) return;
  selectedSubjectId = id;

  const header = document.getElementById('modalHeader');
  const title = document.getElementById('modalTitle');
  const body = document.getElementById('modalBody');

  if (header) header.style.borderLeft = `4px solid ${subject.color}`;
  if (title) title.innerHTML = `<span style="display:inline-block;width:12px;height:12px;background:${subject.color};border-radius:3px;margin-right:8px;vertical-align:middle"></span>${escHtml(subject.name)}`;

  const examTime = new Date(subject.examDate).getTime();
  const diff = examTime - Date.now();
  const days = diff > 0 ? Math.floor(diff / 86400000) : 0;

  const subjectTasks = tasks.filter(t => t.subjectId === id);
  const done = subjectTasks.filter(t => t.completed).length;

  if (body) {
    body.innerHTML = `
      <div class="modal-detail-row">
        <span class="modal-detail-label">Subject Name</span>
        <span class="modal-detail-value">${escHtml(subject.name)}</span>
      </div>
      ${subject.code ? `
      <div class="modal-detail-row">
        <span class="modal-detail-label">Module Code</span>
        <span class="modal-detail-value">${escHtml(subject.code)}</span>
      </div>` : ''}
      <div class="modal-detail-row">
        <span class="modal-detail-label">Exam Date</span>
        <span class="modal-detail-value">${formatDate(subject.examDate)}</span>
      </div>
      <div class="modal-detail-row">
        <span class="modal-detail-label">Days Remaining</span>
        <span class="modal-detail-value" style="color:${days <= 7 ? '#e74c3c' : days <= 14 ? '#e97b3c' : '#5cb85c'}">${days} days</span>
      </div>
      <div class="modal-detail-row">
        <span class="modal-detail-label">Credit Hours</span>
        <span class="modal-detail-value">${subject.credits}</span>
      </div>
      <div class="modal-detail-row">
        <span class="modal-detail-label">Added On</span>
        <span class="modal-detail-value">${subject.addedOn}</span>
      </div>
      <div class="modal-detail-row">
        <span class="modal-detail-label">Tasks (linked)</span>
        <span class="modal-detail-value">${done}/${subjectTasks.length} completed</span>
      </div>
    `;
  }

  const deleteBtn = document.getElementById('deleteSubjectBtn');
  if (deleteBtn) {
    deleteBtn.onclick = () => deleteSubject(id);
  }

  const modal = new bootstrap.Modal(document.getElementById('subjectModal'));
  modal.show();
};

function deleteSubject(id) {
  const subject = subjects.find(s => s.id === id);
  subjects = subjects.filter(s => s.id !== id);
  tasks = tasks.filter(t => t.subjectId !== id);
  save();
  renderSubjects();
  renderTasks();
  updateProgress();
  updateTaskSubjectSelect();
  bootstrap.Modal.getInstance(document.getElementById('subjectModal')).hide();
  if (subject) showToast(`🗑 "${subject.name}" deleted.`, 'error');
}

// ── TASK FORM ──
function setupTaskForm() {
  const form = document.getElementById('addTaskForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = document.getElementById('taskInput');
    const subjectLink = document.getElementById('taskSubjectLink');
    const text = input.value.trim();
    const errEl = document.getElementById('err-task');

    if (!text) {
      if (errEl) errEl.textContent = 'Task description is required.';
      input.classList.add('is-invalid');
      return;
    }

    if (errEl) errEl.textContent = '';
    input.classList.remove('is-invalid');

    const task = {
      id: Date.now().toString(),
      text,
      completed: false,
      subjectId: subjectLink ? subjectLink.value : '',
      addedOn: new Date().toLocaleDateString()
    };

    tasks.push(task);
    save();
    renderTasks();
    updateProgress();
    input.value = '';
    if (subjectLink) subjectLink.value = '';
    showToast(`📝 Task added!`);
  });
}

function updateTaskSubjectSelect() {
  const select = document.getElementById('taskSubjectLink');
  if (!select) return;
  const current = select.value;
  select.innerHTML = `<option value="">-- Link to Subject (optional) --</option>` +
    subjects.map(s => `<option value="${s.id}">${escHtml(s.name)}</option>`).join('');
  select.value = current;
}

// ── RENDER TASKS ──
function renderTasks() {
  const list = document.getElementById('taskList');
  const noMsg = document.getElementById('noTasks');
  if (!list) return;

  if (tasks.length === 0) {
    list.innerHTML = '';
    if (noMsg) noMsg.style.display = 'block';
    return;
  }

  if (noMsg) noMsg.style.display = 'none';

  list.innerHTML = tasks.map(t => {
    const sub = subjects.find(s => s.id === t.subjectId);
    return `
      <div class="task-item ${t.completed ? 'completed' : ''}" id="task-${t.id}" onclick="toggleTask('${t.id}')">
        <div class="task-checkbox">${t.completed ? '✓' : ''}</div>
        <span class="task-text">${escHtml(t.text)}</span>
        ${sub ? `<span class="task-subject-tag" style="background:${sub.color}">${escHtml(sub.name)}</span>` : ''}
        <button class="task-delete" onclick="deleteTask(event,'${t.id}')" title="Delete">✕</button>
      </div>
    `;
  }).join('');
}

window.toggleTask = function (id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  save();
  renderTasks();
  updateProgress();
};

window.deleteTask = function (e, id) {
  e.stopPropagation();
  tasks = tasks.filter(t => t.id !== id);
  save();
  renderTasks();
  updateProgress();
};

// ── PROGRESS ──
function updateProgress() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  // Ring
  const ring = document.getElementById('progressRing');
  if (ring) {
    const circumference = 314;
    ring.style.strokeDashoffset = circumference - (circumference * pct / 100);
    ring.style.stroke = 'url(#progressGradient)';
  }

  // Percentage text
  const pctEl = document.getElementById('progressPct');
  if (pctEl) pctEl.textContent = pct + '%';

  // Bar
  const bar = document.getElementById('progressBarFill');
  if (bar) bar.style.width = pct + '%';

  // Stats
  const compEl = document.getElementById('completedCount');
  const remEl = document.getElementById('remainingCount');
  const totEl = document.getElementById('totalCount');
  const lblEl = document.getElementById('taskProgressLabel');

  if (compEl) compEl.textContent = completed;
  if (remEl) remEl.textContent = total - completed;
  if (totEl) totEl.textContent = total;
  if (lblEl) lblEl.textContent = pct + '% complete';
}

// ── HELPERS ──
function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}