/* ============================================================
   دليل صوران الطبي — Service Worker مع دعم إشعارات الدفع (Push)
   ============================================================ */
const CACHE_NAME = "ds-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/config.js",
  "./js/data.js",
  "./js/app.js",
  "./js/notifications.js",
  "./manifest.webmanifest",
  "./assets/favicon.svg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request))
  );
});

/* معالجة إشعارات الدفع الواردة */
self.addEventListener("push", (e) => {
  let data = { title: "دليل صوران الطبي", body: "إشعار جديد", icon: "./assets/favicon.svg", tag: "ds-push", url: "./" };
  try { data = e.data ? e.data.json() : data; } catch (_) {}
  const options = {
    body: data.body || "",
    icon: data.icon || "./assets/favicon.svg",
    badge: data.icon || "./assets/favicon.svg",
    tag: data.tag || "ds-push",
    data: { url: data.url || "./" },
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
    renotify: data.renotify || false,
  };
  e.waitUntil(self.registration.showNotification(data.title || "دليل صوران الطبي", options));
});

/* ضغط على الإشعار يفتح التطبيق/الرابط */
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "./";
  const action = e.action;
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          if (action) client.navigate(url + "?push_action=" + encodeURIComponent(action));
          else client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
