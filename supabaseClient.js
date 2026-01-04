// supabaseClient.js
const SUPABASE_URL = "https://waqxtwcyzmhkmumieyhw.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_H3D7XFM6-xz8wKmE8X0I5w_kIlp0h0V";

// Supabase is loaded from CDN in index.html (next step)
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("✅ Supabase client initialized:", window.supabaseClient);
