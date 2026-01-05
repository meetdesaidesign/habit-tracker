// habitsApi.js
console.log("✅ habitsApi.js loaded");

window.fetchHabits = async function fetchHabits() {
    // Check if we're in guest mode
    if (window.isGuestMode && window.isGuestMode()) {
      console.log("🚫 fetchHabits: Guest mode, skipping Supabase fetch");
      return [];
    }
    
    // Check if Supabase client is available
    if (!window.supabaseClient) {
      console.log("🚫 fetchHabits: No Supabase client available");
      return [];
    }
    
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
  