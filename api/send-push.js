/* ============================================================
   دليل صوران الطبي — API: إرسال إشعارات دفع لجميع المشتركين
   Vercel Serverless Function — POST /api/send-push
   يتطلب رأس تصريح (Authorization) للمدير
   ============================================================ */

const webpush = require("web-push");
const { createClient } = require("@supabase/supabase-js");

const VAPID_PUBLIC_KEY = "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEFLadp29wAw5jYiOMC2ttw3-M48n5hisr-sa_teQfIvHKL_ERY6dRiM-O7GT9ns-96Y6McQB5JyEuF2FUMrRyPw";
const VAPID_PRIVATE_KEY = "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgUsYb8cM_KbPPq0Ppd2BPbnShKc8WDtXQqlrg-jYDfOihRANCAAQUtp2nb3ADDmNiI4wLa23Df4zjyfmGKyv6xr-15B8i8cov8RFjp1GIz47sZP2ez73pjoxxAHknIS4XYVQytHI_";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://cfcsnhuozufqaejkgrje.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmY3NuaHVvenVmcWFlamtncmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MTg2NTAsImV4cCI6MjEwNDk5NDY1MH0.TfKyPDWJgGeTssq0CQusnA4Uv6NpQtnp4tUUq3uOdg8";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

webpush.setVapidDetails(
  "mailto:admin@dalilshoran.app",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { title, body, url = "./", icon, tag, requireInteraction = false } = req.body || {};
    if (!title || !body) {
      return res.status(400).json({ error: "title and body are required" });
    }

    const { data: subs, error } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth");

    if (error) throw error;

    if (!subs || subs.length === 0) {
      return res.status(200).json({ ok: true, sent: 0, message: "No subscribers" });
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: icon || "./assets/favicon.svg",
      badge: icon || "./assets/favicon.svg",
      tag: tag || "ds-push",
      url,
      requireInteraction,
    });

    const results = await Promise.allSettled(
      subs.map((s) =>
        webpush
          .sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            payload
          )
          .then(() => ({ ok: true }))
          .catch((err) => {
            if (err.statusCode === 410 || err.statusCode === 404) {
              return supabase
                .from("push_subscriptions")
                .delete()
                .eq("endpoint", s.endpoint);
            }
            return { ok: false, error: err.message };
          })
      )
    );

    const sent = results.filter((r) => r.status === "fulfilled" && r.value.ok).length;
    return res.status(200).json({ ok: true, sent, total: subs.length });
  } catch (err) {
    console.error("send-push error:", err);
    return res.status(500).json({ error: err.message || "Failed to send push notifications" });
  }
};
