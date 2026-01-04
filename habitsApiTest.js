// habitsApiTest.js
console.log("✅ habitsApiTest.js loaded");

window.insertHabitTest = async function insertHabitTest() {
  const { data: sessionData } = await window.supabaseClient.auth.getSession();
  const session = sessionData.session;

  if (!session) {
    console.log("❌ Not logged in. Sign in first.");
    return;
  }

  const userId = session.user.id;

  const payload = {
    user_id: userId,
    title: "Test Habit",
    description: "Inserted from console",
    icon: "🔥",
    color: "#f9736f",
    sort_order: 1,
    data: { dots: [] },
  };

  const { data, error } = await window.supabaseClient
    .from("habits")
    .insert([payload])
    .select();

  console.log("insertHabitTest → data:", data);
  console.log("insertHabitTest → error:", error);

  return { data, error };
};

window.fetchHabitsTest = async function fetchHabitsTest() {
  const { data, error } = await window.supabaseClient
    .from("habits")
    .select("*")
    .order("sort_order", { ascending: true });

  console.log("fetchHabitsTest → data:", data);
  console.log("fetchHabitsTest → error:", error);

  return { data, error };
};
