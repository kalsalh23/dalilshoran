/* ============================================================
   دليل صوران الطبي — إدارة الإشعارات (Push API / VAPID)
   مجاني 100% — يتولاه المتصفح مباشرة
   ============================================================ */

const VAPID_PUBLIC_KEY = "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEFLadp29wAw5jYiOMC2ttw3-M48n5hisr-sa_teQfIvHKL_ERY6dRiM-O7GT9ns-96Y6McQB5JyEuF2FUMrRyPw";

const pushState = {
  supported: false,
  permission: "default",
  subscription: null,
  enabled: false,
};

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

async function initNotifications() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    pushState.supported = false;
    return;
  }
  pushState.supported = true;
  pushState.permission = Notification.permission;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    pushState.subscription = sub;
    pushState.enabled = !!sub;
  } catch (_) {
    pushState.subscription = null;
    pushState.enabled = false;
  }
}

async function toggle() {
  if (!pushState.supported) return { ok: false, error: "الإشعارات غير مدعومة في هذا المتصفح" };
  if (!pushState.enabled) {
    if (pushState.permission === "denied") return { ok: false, error: "الإشعارات محظورة في هذا المتصفح — فعّلها من إعدادات الموقع" };
    const perm = await Notification.requestPermission();
    pushState.permission = perm;
    if (perm !== "granted") return { ok: false, error: "لم يتم منح إذن الإشعارات" };
    const res = await subscribe();
    if (res.ok) return { ok: true, activated: true };
    return { ok: false, error: res.error || "فشل التفعيل" };
  }
  const res = await unsubscribe();
  if (res.ok) return { ok: true, deactivated: true };
  return { ok: false, error: res.error || "فشل الإلغاء" };
}

async function subscribe() {
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
    /* احفظ على السيرفر أولاً، وبعد النجاح فقط سويّن الحالة محلياً كمفعل */
    const saved = await saveSubscriptionToServer(sub);
    if (!saved) {
      /* فشل الحفظ على السيرفر — نفك الاشتراك المحلي ونعيد الحالة معطلة */
      try { await sub.unsubscribe(); } catch (_) {}
      pushState.subscription = null;
      pushState.enabled = false;
      return { ok: false, error: "فشل حفظ الاشتراك على الخادم" };
    }
    pushState.subscription = sub;
    pushState.enabled = true;
    return { ok: true, subscription: sub };
  } catch (e) {
    pushState.subscription = null;
    pushState.enabled = false;
    return { ok: false, error: e && e.message ? e.message : "فشل الاشتراك في الإشعارات" };
  }
}

async function saveSubscriptionToServer(sub) {
  try {
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: sub.endpoint,
        p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(sub.getKey("p256dh")))),
        auth: btoa(String.fromCharCode.apply(null, new Uint8Array(sub.getKey("auth")))),
        updated_at: new Date().toISOString(),
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "فشل حفظ الاشتراك");
    }
    return true;
  } catch (_) { return false; }
}

async function unsubscribe() {
  if (!pushState.subscription) return { ok: false };
  try {
    await pushState.subscription.unsubscribe();
    pushState.enabled = false;
    pushState.subscription = null;
    return { ok: true };
  } catch (e) { return { ok: false, error: e && e.message ? e.message : "فشل إلغاء الاشتراك" }; }
}

function showLocalNotification(title, options = {}) {
  if (!pushState.enabled) return;
  navigator.serviceWorker.ready.then((registration) => {
    registration.showNotification(title, {
      icon: options.icon || "./assets/favicon.svg",
      badge: options.icon || "./assets/favicon.svg",
      tag: options.tag || "ds-local",
      data: { url: options.url || "./" },
      body: options.body || "",
      requireInteraction: options.requireInteraction || false,
      ...options,
    });
  });
}

window.DSNotifications = {
  init: initNotifications,
  subscribe,
  unsubscribe,
  toggle,
  showLocal: showLocalNotification,
  get state() { return pushState; },
};
