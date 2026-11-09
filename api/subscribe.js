/* ============================================================
   دليل صوران الطبي — API: حفظ اشتراك الإشعارات (Push Subscription)
   Vercel Serverless Function — POST /api/subscribe
   ============================================================ */

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL || "https://cfcsnhuozufqaejkgrje.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmY3NuaHVvenVmcWFlamtncmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MTg2NTAsImV4cCI6MjEwNDk5NDY1MH0.TfKyPDWJgGeTssq0CQusnA4Uv6NpQtnp4tUUq3uOdg8";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { endpoint, p256dh, auth } = req.body || {};
    if (!endpoint || !p256dh || !auth) {
      return res.status(400).json({ error: "Missing subscription fields" });
    }

    const { error } = await supabase
      .from("push_subscriptions")
      .upsert(
        { endpoint, p256dh, auth, updated_at: new Date().toISOString() },
        { onConflict: "endpoint" }
      );

    if (error) throw error;

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("subscribe error:", err);
    return res.status(500).json({ error: err.message || "Failed to save subscription" });
  }
};
