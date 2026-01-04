// authTest.js
// Console helpers for quick auth testing (no UI yet)

window.signUpTest = async function signUpTest(email, password) {
    const { data, error } = await window.supabaseClient.auth.signUp({ email, password });
    console.log("signUpTest → data:", data);
    console.log("signUpTest → error:", error);
    return { data, error };
  };
  
  window.signInTest = async function signInTest(email, password) {
    const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
    console.log("signInTest → data:", data);
    console.log("signInTest → error:", error);
    return { data, error };
  };
  
  window.sessionTest = async function sessionTest() {
    const { data, error } = await window.supabaseClient.auth.getSession();
    console.log("sessionTest → data:", data);
    console.log("sessionTest → error:", error);
    return { data, error };
  };
  
  window.signOutTest = async function signOutTest() {
    const { error } = await window.supabaseClient.auth.signOut();
    console.log("signOutTest → error:", error);
    return { error };
  };
  
  console.log("✅ authTest.js loaded. Use signUpTest/signInTest/sessionTest/signOutTest in console.");
  