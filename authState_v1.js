console.log("✅ authState.js loaded");
console.log("✅ authState_v1.js loaded");


(async function () {
  try {
    if (!window.supabaseClient) {
      console.log("❌ window.supabaseClient is missing (script order issue)");
      return;
    }

    const res = await window.supabaseClient.auth.getSession();
    console.log("✅ getSession() result:", res);

    const session = res?.data?.session;

    if (session) {
      console.log("✅ LOGGED IN");
      console.log("User id:", session.user.id);
      console.log("Email:", session.user.email);
    } else {
      console.log("🚪 LOGGED OUT (no session)");
    }

    window.supabaseClient.auth.onAuthStateChange((event, sessionNow) => {
      console.log("🔔 Auth event:", event);
      console.log("Session now:", sessionNow ? "✅ exists" : "🚪 null");
    });
  } catch (e) {
    console.log("❌ authState.js crashed with error:", e);
  }
})();
