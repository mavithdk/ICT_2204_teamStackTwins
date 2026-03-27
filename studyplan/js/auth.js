document.addEventListener("DOMContentLoaded", () => {

  // ── Read current login state ──
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "null");

  const loginBtn  = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const getStartedBtn = document.getElementById("getStartedBtn");

  // ── Smart buttons (hero CTA) ──
  document.querySelectorAll(".smart-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      window.location.href = isLoggedIn ? "planner.html" : "login.html";
    });
  });

  // ── Show / Hide nav buttons ──
  if (isLoggedIn) {
    if (loginBtn)  loginBtn.style.display  = "none";
    if (signupBtn) signupBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";
  } else {
    if (loginBtn)  loginBtn.style.display  = "inline-block";
    if (signupBtn) signupBtn.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "none";
  }

  // ── Logout from navbar ──
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("loggedInUser");
      window.location.href = "index.html";
    });
  }

  // ── Get Started button ──
  if (getStartedBtn) {
    getStartedBtn.addEventListener("click", e => {
      e.preventDefault();
      window.location.href = isLoggedIn ? "planner.html" : "login.html";
    });
  }

  // ── Render user profile dropdown in navbar ──
  renderUserProfile(isLoggedIn, user);
});


//  Profile Dropdown 

function renderUserProfile(isLoggedIn, user) {
  const authArea = document.getElementById("authArea");
  if (!authArea) return;

  if (!isLoggedIn || !user) return; // Not logged in — keep default buttons

  // Replace the login/signup/logout buttons with the profile dropdown
  authArea.innerHTML = `
    <div class="user-profile-wrap" id="profileWrap">
      <button class="user-profile-btn" id="profileBtn" onclick="toggleProfileMenu()">
        <div class="user-avatar">${(user.username || "U")[0].toUpperCase()}</div>
        <span class="user-greeting">Hi, ${escHtml(user.username)}</span>
        <span class="profile-arrow" id="profileArrow">▾</span>
      </button>
      <div class="profile-dropdown" id="profileDropdown">
        <div class="profile-dropdown-header">
          <div class="profile-dropdown-avatar">${(user.username || "U")[0].toUpperCase()}</div>
          <div>
            <div class="profile-dropdown-name">${escHtml(user.name || user.username)}</div>
            <div class="profile-dropdown-username">@${escHtml(user.username)}</div>
          </div>
        </div>
        <div class="profile-dropdown-divider"></div>
        <div class="profile-dropdown-item">${escHtml(user.edu || "—")}</div>
        <div class="profile-dropdown-item">Age: ${escHtml(user.age || "—")}</div>
        <div class="profile-dropdown-divider"></div>
        <button class="profile-dropdown-logout" onclick="logoutUser()">Logout</button>
      </div>
    </div>
  `;

  // Close dropdown when clicking outside
  document.addEventListener("click", e => {
    const wrap = document.getElementById("profileWrap");
    if (wrap && !wrap.contains(e.target)) {
      closeProfileMenu();
    }
  });
}

window.toggleProfileMenu = function () {
  const dropdown = document.getElementById("profileDropdown");
  const arrow    = document.getElementById("profileArrow");
  if (!dropdown) return;
  const isOpen = dropdown.classList.contains("open");
  dropdown.classList.toggle("open", !isOpen);
  if (arrow) arrow.style.transform = isOpen ? "rotate(0deg)" : "rotate(180deg)";
};

function closeProfileMenu() {
  const dropdown = document.getElementById("profileDropdown");
  const arrow    = document.getElementById("profileArrow");
  if (dropdown) dropdown.classList.remove("open");
  if (arrow)    arrow.style.transform = "rotate(0deg)";
}

window.logoutUser = function () {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
};

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
