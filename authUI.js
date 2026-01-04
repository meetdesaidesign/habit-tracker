// authUI.js
console.log("✅ authUI.js loaded");

const authView = document.getElementById("authView");
const appView = document.getElementById("appView");
const authMsg = document.getElementById("authMsg");

function setMsg(msg) {
  if (authMsg) authMsg.textContent = msg || "";
}

function showAuth() {
  if (authView) authView.style.display = "block";
  if (appView) appView.style.display = "none";
}

function showApp() {
  if (authView) authView.style.display = "none";
  if (appView) appView.style.display = "block";
  
  // Show loading skeleton before fetching habits
  const loadingSkeleton = document.getElementById("loadingSkeletonScreen");
  if (loadingSkeleton) {
    loadingSkeleton.classList.remove("hidden");
  }
  
  // Hide empty state and habit stack initially
  const emptyState = document.querySelector(".empty-state");
  const habitStackScreen = document.querySelector(".habit-stack-screen");
  if (emptyState) emptyState.classList.add("hidden");
  if (habitStackScreen) habitStackScreen.classList.add("hidden");
  
  // Fetch habits from Supabase
  if (window.fetchHabits) {
    window.fetchHabits();
  }
}

async function refreshUIFromSession() {
  const { data, error } = await window.supabaseClient.auth.getSession();
  if (error) {
    console.log("❌ getSession error:", error);
    setMsg(error.message || "Session error");
    showAuth();
    return;
  }
  const session = data.session;
  if (session) showApp();
  else showAuth();
}

// --- Button handlers ---
const btnLogin = document.getElementById("btnLogin");
const btnLogout = document.getElementById("btnLogout");

if (btnLogin) {
  btnLogin.addEventListener("click", async () => {
    console.log("✅ Login clicked");
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    if (!email || !password) return setMsg("Email and password required.");

    setMsg("Signing in...");
    const { data, error } = await window.supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    console.log("signIn data:", data);
    console.log("signIn error:", error);

    if (error) return setMsg(error.message);

    setMsg("Signed in!");
    await refreshUIFromSession();
  });
}

if (btnLogout) {
  btnLogout.addEventListener("click", async () => {
    setMsg("");
    await window.supabaseClient.auth.signOut();
    await refreshUIFromSession();
  });
}

// Keep UI updated if auth changes
window.supabaseClient.auth.onAuthStateChange(() => {
  refreshUIFromSession();
});

// Initial render
refreshUIFromSession();
