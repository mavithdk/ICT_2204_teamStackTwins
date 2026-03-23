document.addEventListener("DOMContentLoaded", () => {

  const isLoggedIn = localStorage.getItem("loggedIn");

  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const getStartedBtn = document.getElementById("getStartedBtn");

  const smartButtons = document.querySelectorAll(".smart-btn");

  smartButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      const isLoggedIn = localStorage.getItem("loggedIn");

      if (isLoggedIn === "true") {
        window.location.href = "planner.html";
      } else {
        window.location.href = "login.html";
      }
    });
  });

  // Show / Hide buttons
  if (isLoggedIn === "true") {
    if (loginBtn) loginBtn.style.display = "none";
    if (signupBtn) signupBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("loggedIn");
      window.location.href = "index.html";
    });
  }

  // Get Started behavior
  if (getStartedBtn) {
    getStartedBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (isLoggedIn === "true") {
        window.location.href = "planner.html";
      } else {
        window.location.href = "login.html";
      }
    });
  }
});