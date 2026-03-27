let subjects = [];
let tasks    = [];
let selectedColor     = '#4a90d9';
let selectedSubjectId = null;
let countdownIntervals = {};
let currentUser = null;
let useBackend  = false;
const API = 'includes/';

function isUserLoggedIn() {
  return localStorage.getItem('isLoggedIn') === 'true';
}
function requireLogin() {
  alert('\u26a0\ufe0f Please login to continue!');
  window.location.href = 'login.html';
}
async function apiFetch(endpoint, body) {
  try {
    const res = await fetch(API + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return await res.json();
  } catch (e) { return { success: false, message: 'Network error' }; }
}

document.addEventListener('DOMContentLoaded', async () => {
  const svgDefs = `<defs><linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:#4a90d9"/><stop offset="100%" style="stop-color:#7b61ff"/></linearGradient></defs>`;
  const ring = document.querySelector('.progress-ring');
  if (ring) ring.insertAdjacentHTML('afterbegin', svgDefs);
  setupColorPicker();
  setMinDate();
  currentUser = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
  if (currentUser && currentUser.id) {
    useBackend = true;
    await loadFromBackend();
  } else {
    subjects = JSON.parse(localStorage.getItem('ssp_subjects') || '[]');
    tasks    = JSON.parse(localStorage.getItem('ssp_tasks')    || '[]');
  }
  setupSubjectForm();
  setupTaskForm();
  renderSubjects();
  renderTasks();
  updateProgress();
  updateTaskSubjectSelect();
});

async function loadFromBackend() {
  const uid = currentUser.id;
  const [sRes, tRes] = await Promise.all([
    apiFetch('subjects.php', { action: 'get', user_id: uid }),
    apiFetch('tasks.php',    { action: 'get', user_id: uid })
  ]);
  subjects = sRes.success ? sRes.subjects : [];
  tasks    = tRes.success ? tRes.tasks    : [];
}

function saveLocal() {
  if (!useBackend) {
    localStorage.setItem('ssp_subjects', JSON.stringify(subjects));
    localStorage.setItem('ssp_tasks',    JSON.stringify(tasks));
  }
}

function setMinDate() {
  const d = document.getElementById('examDate');
  if (d) d.min = new Date().toISOString().split('T')[0];
}

function setupColorPicker() {
  document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      selectedColor = dot.dataset.color;
    });
  });
}

window.toggleForm = function () {
  const body = document.getElementById('formBody');
  const btn  = document.getElementById('toggleFormBtn');
  if (!body || !btn) return;
  const hidden = body.style.display === 'none';
  body.style.display = hidden ? '' : 'none';
  btn.textContent = hidden ? 'Collapse \u25b2' : 'Expand \u25bc';
};

window.resetForm = function () {
  document.getElementById('addSubjectForm').reset();
  clearErrors(['subjectName', 'examDate']);
  document.querySelectorAll('.color-dot').forEach((d, i) => d.classList.toggle('active', i === 0));
  selectedColor = '#4a90d9';
};

function setError(fieldId, msg) {
  const input = document.getElementById(fieldId);
  const err   = document.getElementById('err-' + fieldId);
  if (input) input.classList.toggle('is-invalid', !!msg);
  if (err)   err.textContent = msg || '';
}
function clearErrors(fields) { fields.forEach(f => setError(f, '')); }

function setupSubjectForm() {
  const form = document.getElementById('addSubjectForm');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!isUserLoggedIn()) { requireLogin(); return; }
    const name     = document.getElementById('subjectName').value.trim();
    const examDate = document.getElementById('examDate').value;
    const code     = document.getElementById('moduleCode').value.trim();
    const credits  = document.getElementById('creditHours').value;
    let valid = true;
    if (!name || name.length < 2) { setError('subjectName', !name ? 'Subject name is required.' : 'Name must be at least 2 characters.'); valid = false; } else setError('subjectName', '');
    if (!examDate) { setError('examDate', 'Exam date is required.'); valid = false; }
    else if (new Date(examDate) < new Date().setHours(0,0,0,0)) { setError('examDate', 'Exam date must be in the future.'); valid = false; }
    else setError('examDate', '');
    if (!valid) return;
    const subjectData = { name, code, examDate, color: selectedColor, credits: credits || '\u2014', addedOn: new Date().toLocaleDateString('en-GB') };
    if (useBackend && currentUser && currentUser.id) {
      const res = await apiFetch('subjects.php', { action: 'add', user_id: currentUser.id, ...subjectData });
      if (!res.success) { showToast('\u274c ' + res.message, 'error'); return; }
      subjectData.id = res.id;
    } else {
      subjectData.id = Date.now().toString();
    }
    subjects.push(subjectData);
    saveLocal();
    renderSubjects();
    updateTaskSubjectSelect();
    resetForm();
    showToast('\u2705 "' + name + '" added successfully!');
  });
}

function renderSubjects() {
  const grid  = document.getElementById('subjectsGrid');
  const empty = document.getElementById('emptyState');
  const count = document.getElementById('subjectCount');
  if (!grid) return;
  Object.values(countdownIntervals).forEach(clearInterval);
  countdownIntervals = {};
  if (subjects.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    if (count) count.textContent = '0 subjects';
    return;
  }
  if (empty) empty.style.display = 'none';
  if (count) count.textContent = subjects.length + ' subject' + (subjects.length !== 1 ? 's' : '');
  grid.innerHTML = subjects.map(s => `
    <div class="col-md-6 col-lg-4 fade-in visible">
      <div class="subject-card" style="border-left-color:${s.color}" onclick="openModal('${s.id}')">
        <div class="subject-card-header">
          <div class="subject-name">${escHtml(s.name)}</div>
          ${s.code ? `<div class="subject-code-badge">${escHtml(s.code)}</div>` : ''}
        </div>
        <div class="exam-date-label">\ud83d\udcc5 Exam: ${formatDate(s.examDate)}</div>
        <div class="countdown-display" id="cd-${s.id}">
          <div class="countdown-units">
            <div class="countdown-unit"><span class="count-num cd-d" style="color:${s.color}">--</span><span class="count-lbl">days</span></div>
            <div class="countdown-unit"><span class="count-num cd-h" style="color:${s.color}">--</span><span class="count-lbl">hrs</span></div>
            <div class="countdown-unit"><span class="count-num cd-m" style="color:${s.color}">--</span><span class="count-lbl">min</span></div>
            <div class="countdown-unit"><span class="count-num cd-s" style="color:${s.color}">--</span><span class="count-lbl">sec</span></div>
          </div>
        </div>
        <div class="card-click-hint">Click for details \u2192</div>
      </div>
    </div>`).join('');
  subjects.forEach(s => startCountdown(s));
}

function startCountdown(subject) {
  const cdEl = document.getElementById('cd-' + subject.id);
  if (!cdEl) return;
  function update() {
    const diff = new Date(subject.examDate).getTime() - Date.now();
    if (diff <= 0) { cdEl.innerHTML = '<div style="font-size:.9rem;font-weight:700;color:#e74c3c;">\ud83d\udce2 EXAM TIME!</div>'; clearInterval(countdownIntervals[subject.id]); return; }
    const dEl = cdEl.querySelector('.cd-d'), hEl = cdEl.querySelector('.cd-h');
    const mEl = cdEl.querySelector('.cd-m'), sEl = cdEl.querySelector('.cd-s');
    if (dEl) dEl.textContent = pad(Math.floor(diff / 86400000));
    if (hEl) hEl.textContent = pad(Math.floor((diff % 86400000) / 3600000));
    if (mEl) mEl.textContent = pad(Math.floor((diff % 3600000) / 60000));
    if (sEl) sEl.textContent = pad(Math.floor((diff % 60000) / 1000));
  }
  update();
  countdownIntervals[subject.id] = setInterval(update, 1000);
}

function pad(n) { return String(n).padStart(2, '0'); }

window.openModal = function (id) {
  const subject = subjects.find(s => s.id === id);
  if (!subject) return;
  selectedSubjectId = id;
  const header = document.getElementById('modalHeader');
  const title  = document.getElementById('modalTitle');
  const body   = document.getElementById('modalBody');
  if (header) header.style.borderLeft = '4px solid ' + subject.color;
  if (title)  title.innerHTML = '<span style="display:inline-block;width:12px;height:12px;background:' + subject.color + ';border-radius:3px;margin-right:8px;vertical-align:middle"></span>' + escHtml(subject.name);
  const diff = new Date(subject.examDate).getTime() - Date.now();
  const days = diff > 0 ? Math.floor(diff / 86400000) : 0;
  const subjectTasks = tasks.filter(t => t.subjectId === id);
  const done = subjectTasks.filter(t => t.completed).length;
  if (body) body.innerHTML = `
    <div class="modal-detail-row"><span class="modal-detail-label">Subject Name</span><span class="modal-detail-value">${escHtml(subject.name)}</span></div>
    ${subject.code ? `<div class="modal-detail-row"><span class="modal-detail-label">Module Code</span><span class="modal-detail-value">${escHtml(subject.code)}</span></div>` : ''}
    <div class="modal-detail-row"><span class="modal-detail-label">Exam Date</span><span class="modal-detail-value">${formatDate(subject.examDate)}</span></div>
    <div class="modal-detail-row"><span class="modal-detail-label">Days Remaining</span><span class="modal-detail-value" style="color:${days<=7?'#e74c3c':days<=14?'#e97b3c':'#5cb85c'}">${days} days</span></div>
    <div class="modal-detail-row"><span class="modal-detail-label">Credit Hours</span><span class="modal-detail-value">${subject.credits}</span></div>
    <div class="modal-detail-row"><span class="modal-detail-label">Added On</span><span class="modal-detail-value">${subject.addedOn}</span></div>
    <div class="modal-detail-row"><span class="modal-detail-label">Tasks (linked)</span><span class="modal-detail-value">${done}/${subjectTasks.length} completed</span></div>`;
  const deleteBtn = document.getElementById('deleteSubjectBtn');
  if (deleteBtn) deleteBtn.onclick = () => deleteSubject(id);
  new bootstrap.Modal(document.getElementById('subjectModal')).show();
};

async function deleteSubject(id) {
  const subject = subjects.find(s => s.id === id);
  if (useBackend && currentUser && currentUser.id) {
    const res = await apiFetch('subjects.php', { action: 'delete', user_id: currentUser.id, subject_id: id });
    if (!res.success) { showToast('\u274c ' + res.message, 'error'); return; }
  }
  subjects = subjects.filter(s => s.id !== id);
  tasks    = tasks.filter(t => t.subjectId !== id);
  saveLocal();
  renderSubjects(); renderTasks(); updateProgress(); updateTaskSubjectSelect();
  bootstrap.Modal.getInstance(document.getElementById('subjectModal')).hide();
  if (subject) showToast('\ud83d\uddd1 "' + subject.name + '" deleted.', 'error');
}

function setupTaskForm() {
  const form = document.getElementById('addTaskForm');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!isUserLoggedIn()) { requireLogin(); return; }
    const input       = document.getElementById('taskInput');
    const subjectLink = document.getElementById('taskSubjectLink');
    const text        = input.value.trim();
    const errEl       = document.getElementById('err-task');
    if (!text) { if (errEl) errEl.textContent = 'Task description is required.'; input.classList.add('is-invalid'); return; }
    if (errEl) errEl.textContent = '';
    input.classList.remove('is-invalid');
    const taskData = { text, completed: false, subjectId: subjectLink ? subjectLink.value : '', addedOn: new Date().toLocaleDateString('en-GB') };
    if (useBackend && currentUser && currentUser.id) {
      const res = await apiFetch('tasks.php', { action: 'add', user_id: currentUser.id, ...taskData });
      if (!res.success) { showToast('\u274c ' + res.message, 'error'); return; }
      taskData.id = res.id;
    } else {
      taskData.id = Date.now().toString();
    }
    tasks.push(taskData);
    saveLocal();
    renderTasks(); updateProgress();
    input.value = '';
    if (subjectLink) subjectLink.value = '';
    showToast('\ud83d\udcdd Task added!');
  });
}

function updateTaskSubjectSelect() {
  const select = document.getElementById('taskSubjectLink');
  if (!select) return;
  const current = select.value;
  select.innerHTML = '<option value="">-- Link to Subject (optional) --</option>' + subjects.map(s => '<option value="' + s.id + '">' + escHtml(s.name) + '</option>').join('');
  select.value = current;
}

function renderTasks() {
  const list  = document.getElementById('taskList');
  const noMsg = document.getElementById('noTasks');
  if (!list) return;
  if (tasks.length === 0) { list.innerHTML = ''; if (noMsg) noMsg.style.display = 'block'; return; }
  if (noMsg) noMsg.style.display = 'none';
  list.innerHTML = tasks.map(t => {
    const sub = subjects.find(s => s.id === t.subjectId);
    return '<div class="task-item ' + (t.completed ? 'completed' : '') + '" id="task-' + t.id + '" onclick="toggleTask(\'' + t.id + '\')">' +
      '<div class="task-checkbox">' + (t.completed ? '\u2713' : '') + '</div>' +
      '<span class="task-text">' + escHtml(t.text) + '</span>' +
      (sub ? '<span class="task-subject-tag" style="background:' + sub.color + '">' + escHtml(sub.name) + '</span>' : '') +
      '<button class="task-delete" onclick="deleteTask(event,\'' + t.id + '\')" title="Delete">\u2715</button></div>';
  }).join('');
}

window.toggleTask = async function (id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  if (useBackend && currentUser && currentUser.id) {
    await apiFetch('tasks.php', { action: 'toggle', user_id: currentUser.id, task_id: id, completed: task.completed ? 1 : 0 });
  }
  saveLocal(); renderTasks(); updateProgress();
};

window.deleteTask = async function (e, id) {
  e.stopPropagation();
  if (useBackend && currentUser && currentUser.id) {
    await apiFetch('tasks.php', { action: 'delete', user_id: currentUser.id, task_id: id });
  }
  tasks = tasks.filter(t => t.id !== id);
  saveLocal(); renderTasks(); updateProgress();
};

function updateProgress() {
  const total     = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pct       = total === 0 ? 0 : Math.round((completed / total) * 100);
  const ringEl = document.getElementById('progressRing');
  if (ringEl) { ringEl.style.strokeDashoffset = 314 - (314 * pct / 100); ringEl.style.stroke = 'url(#progressGradient)'; }
  const g = id => document.getElementById(id);
  if (g('progressPct'))       g('progressPct').textContent       = pct + '%';
  if (g('progressBarFill'))   g('progressBarFill').style.width   = pct + '%';
  if (g('completedCount'))    g('completedCount').textContent    = completed;
  if (g('remainingCount'))    g('remainingCount').textContent    = total - completed;
  if (g('totalCount'))        g('totalCount').textContent        = total;
  if (g('taskProgressLabel')) g('taskProgressLabel').textContent = pct + '% complete';
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function formatDate(dateStr) {
  if (!dateStr) return '\u2014';
  return new Date(dateStr).toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' });
}
