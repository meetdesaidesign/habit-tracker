// habitsSave.js
console.log("✅ habitsSave.js loaded");

window.saveHabitsSmart = async function saveHabitsSmart(habits) {
  const { data: sessionData } = await window.supabaseClient.auth.getSession();
  const session = sessionData.session;

  // 🔹 If NOT logged in → fallback to localStorage
  if (!session) {
    console.log("💾 Saving to localStorage (logged out)");
    if (typeof window.saveHabitsToStorage === "function") {
      window.saveHabitsToStorage(habits);
    } else if (typeof saveHabitsToStorage === "function") {
      saveHabitsToStorage(habits);
    }
    return;
  }

  // 🔹 Logged in → save to Supabase
  console.log("☁️ Saving habits to Supabase");

  const userId = session.user.id;

  // Strategy: delete + reinsert (simple + safe for now)
  await window.supabaseClient
    .from("habits")
    .delete()
    .eq("user_id", userId);

  const payload = habits.map((h, index) => ({
    user_id: userId,
    title: h.title,
    description: h.description,
    icon: h.iconId || h.icon || null,
    color: h.color,
    sort_order: index,
    data: {
      completedDates: h.completedDates || [],
      createdAt: h.createdAt || new Date().toISOString()
    }
  }));

  const { error } = await window.supabaseClient
    .from("habits")
    .insert(payload);

  if (error) {
    console.log("❌ Supabase save error:", error);
  } else {
    console.log("✅ Saved habits to Supabase");
  }
};
