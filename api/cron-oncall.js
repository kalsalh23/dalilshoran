/* ============================================================
   دليل صوران الطبي — API: Cron إشعارات المناوبة كل 4 ساعات
   Vercel Cron — GET /api/cron-oncall
   يتم استدعاؤه تلقائياً بواسطة فيرسيل كل 4 ساعات
   ============================================================ */

const webpush = require("web-push");
const { createClient } = require("@supabase/supabase-js");

const VAPID_PUBLIC_KEY = "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEFLadp29wAw5jYiOMC2ttw3-M48n5hisr-sa_teQfIvHKL_ERY6dRiM-O7GT9ns-96Y6McQB5JyEuF2FUMrRyPw";
const VAPID_PRIVATE_KEY = "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgUsYb8cM_KbPPq0Ppd2BPbnShKc8WDtXQqlrg-jYDfOihRANCAAQUtp2nb3ADDmNiI4wLa23Df4zjyfmGKyv6xr-15B8i8cov8RFjp1GIz47sZP2ez73pjoxxAHknIS4XYVQytHI_";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://cfcsnhuozufqaejkgrje.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmY3NuaHVvenVmcWFlamtncmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MTg2NTAsImV4cCI6MjEwNDk5NDY1MH0.TfKyPDWJgGeTssq0CQusnA4Uv6NpQtnp4tUUq3uOdg8";

webpush.setVapidDetails(
  "mailto:admin@dalilshoran.app",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const DAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

function isoDateLocal() {
  const dt = new Date();
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + d;
}

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const today = isoDateLocal();
    const dayName = DAYS_AR[new Date().getDay()];

    const [entities, schedule] = await Promise.all([
      supabase.from("entities").select("id, name, phone, address, area").eq("type", "pharmacy").eq("active", true),
      supabase.from("oncall_schedule").select("pharmacy_id").eq("day", today),
    ]);

    if (schedule.error) throw schedule.error;

    const ids = (schedule.data || []).map((x) => x.pharmacy_id);
    const pharmacies = (entities.data || []).filter((p) => ids.includes(p.id));

    if (pharmacies.length === 0) {
      return res.status(200).json({ ok: true, sent: 0, message: "No on-call pharmacies today" });
    }

    const names = pharmacies.map((p) => p.name).join("، ");
    const body = `الصيدليات المناوبة اليوم (${dayName}): ${names}`;

    const { data: subs, error: subError } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth");

    if (subError) throw subError;

    if (!subs || subs.length === 0) {
      return res.status(200).json({ ok: true, sent: 0, message: "No subscribers" });
    }

    const payload = JSON.stringify({
      title: "دليل صوران الطبي — صيدليات المناوبة",
      body,
      icon: "./assets/favicon.svg",
      badge: "./assets/favicon.svg",
      tag: "ds-oncall",
      url: "#/oncall",
      requireInteraction: false,
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
              return supabase.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
            }
            return { ok: false, error: err.message };
          })
      )
    );

    const sent = results.filter((r) => r.status === "fulfilled" && r.value.ok).length;
    return res.status(200).json({ ok: true, sent, total: subs.length, pharmacies: pharmacies.length });
  } catch (err) {
    console.error("cron-oncall error:", err);
    return res.status(500).json({ error: err.message || "Cron failed" });
  }
};
