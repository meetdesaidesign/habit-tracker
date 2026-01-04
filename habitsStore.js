// habitsStore.js
console.log("✅ habitsStore.js loaded");

// This will hold the habits currently used by the UI
window.habitsFromCloud = [];

// Call this after login to set habits + trigger render
window.setHabitsFromCloud = async function setHabitsFromCloud(habitsFromSupabase) {
  window.habitsFromCloud = habitsFromSupabase || [];
  console.log("✅ setHabitsFromCloud count:", window.habitsFromCloud.length);

  // Ensure icons are loaded before rendering (in case initApp hasn't finished)
  if (typeof window.ensureIconsLoaded === "function") {
    await window.ensureIconsLoaded();
  }

  // Update the global habits variable if the function exists
  if (typeof window.setHabits === "function") {
    window.setHabits(window.habitsFromCloud);
  }

  // Hide loading skeleton
  const loadingSkeleton = document.getElementById("loadingSkeletonScreen");
  if (loadingSkeleton) {
    loadingSkeleton.classList.add("hidden");
  }

  // Try calling the render function
  if (typeof window.renderAppState === "function") {
    window.renderAppState();
  }
};
