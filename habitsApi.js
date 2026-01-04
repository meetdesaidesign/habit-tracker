// habitsApi.js
console.log("✅ habitsApi.js loaded");

window.fetchHabits = async function fetchHabits() {
    const { data, error } = await window.supabaseClient
      .from("habits")
      .select("*")
      .order("sort_order", { ascending: true });
  
    if (error) {
      console.log("❌ fetchHabits error:", error);
      return [];
    }
  
    const habits = data || [];
    console.log("✅ fetched habits:", habits);
  
    if (typeof window.setHabitsFromCloud === "function") {
      window.setHabitsFromCloud(habits);
    }
  
    return habits;
  };
  