/* ============================================================
   دليل صوران الطبي — منطق التطبيق (بدون أي مكتبات خارجية)
   توجيه هاش | بحث شامل | خريطة Leaflet | وضع ليلي | مناوبة
   ============================================================ */

"use strict";

/* ================= أدوات عامة ================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const fmtNum = (n) => Number(n).toLocaleString("ar-EG");
const fmtPhone = (p) => String(p).replace(/^(\d{4})(\d{3})(\d{3})$/, "$1 $2 $3");
  const telHref = (p) => "tel:+963" + String(p).replace(/^\+?963/, "").replace(/^0/, "");
  const waHref = (p, text) => "https://wa.me/963" + String(p).replace(/^\+?963/, "").replace(/^0/, "") + (text ? "?text=" + encodeURIComponent(text) : "");
const mapsLink = (lat, lng, address) =>
  lat && lng
    ? "https://www.google.com/maps?q=" + lat + "," + lng
    : "https://www.google.com/maps?q=" + encodeURIComponent(address || "صوران");

const todayIdx = () => new Date().getDay();
const initials = (name) =>
  String(name).replace(/^د\.\s*/, "").split(/\s+/).slice(0, 2).map((w) => w[0]).join("");

/* ================= الأيقونات ================= */
const ICONS = {
  search: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  chat: '<path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.5L3 21l2-5.6A8.5 8.5 0 1 1 21 11.5z"/>',
  pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>',
  bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  share: '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>',
  send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  shieldPlus: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 9v6M9 12h6"/>',
  stetho: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  pill: '<rect x="3.2" y="9" width="17.6" height="6" rx="3" transform="rotate(-45 12 12)"/><path d="M9.2 9.2l5.6 5.6"/>',
  hospital: '<path d="M3 21h18M5 21V7.5L12 3l7 4.5V21"/><path d="M12 9.5v5M9.5 12h5"/>',
  flask: '<path d="M10 2v6.3L4.6 17.6A2.4 2.4 0 0 0 6.7 21h10.6a2.4 2.4 0 0 0 2.1-3.4L14 8.3V2"/><path d="M8.5 2h7M7.2 14.5h9.6"/>',
  scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3.2"/>',
  activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 13h6M9 17h6"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/>',
  chevDown: '<path d="M6 9l6 6 6-6"/>',
  chevLeft: '<path d="M15 18l-6-6 6-6"/>',
  arrowLeft: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>',
  alert: '<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  flame: '<path d="M12 22c4.4 0 8-3.4 8-7.7 0-3.1-1.6-5.3-3.1-7.2-.6-.8-1.9-.4-1.9.6V9c0 .6-.5 1-1 .9-1.9-.4-2.6-2.4-2.2-4.9.2-1-.9-1.7-1.7-1C7.3 6 4 9.8 4 14.3 4 18.6 7.6 22 12 22z"/>',
  ambulance: '<path d="M2 17h1.5M8.5 17h7M20 17h2v-4.2L19.3 9H15v8"/><rect x="2" y="7" width="13" height="10" rx="2"/><circle cx="6.5" cy="17.5" r="2"/><circle cx="17.5" cy="17.5" r="2"/><path d="M6.5 10h4M8.5 8v4"/>',
  building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  map: '<polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><path d="M9 3v15M15 6v15"/>',
  key: '<path d="M2.6 17.4A2 2 0 0 0 2 18.8V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.2a2 2 0 0 0 1.4-.6l.8-.8a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>',
  crown: '<path d="M11.6 3.3a.5.5 0 0 1 .9 0l2.9 5.6a1 1 0 0 0 1.5.3l4.3-3.7a.5.5 0 0 1 .8.5l-2.8 10.2a1 1 0 0 1-1 .8H5.8a1 1 0 0 1-1-.8L2 6a.5.5 0 0 1 .8-.5L7 9.2a1 1 0 0 0 1.5-.3z"/><path d="M5 21h14"/>',
  sparkles: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>',
  shieldCheck: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  code: '<path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/>',
  badgeCheck: '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
  instagram: '<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>',
  facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  arrowUpRight: '<line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>',
  searchX: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="m8 8 6 6"/><path d="m14 8-6 6"/>',
};
const icon = (n, cls = "") =>
  `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ICONS.info}</svg>`;

/* ================= الحالة العامة ================= */
const state = {
  map: null,
  oncallDay: todayIdx(),
  askCat: "الكل",
  askQuery: "",
  dashTab: "entities",
  filters: {},
};
["doctor", "pharmacy", "hospital", "lab", "radiology", "health-center"].forEach((t) => {
  state.filters[t] = { q: "", spec: "", area: "", sort: "featured" };
});

/* ================= مكوّنات مشتركة ================= */
function typeBadge(e) {
  const t = TYPES[e.type];
  return `<a class="badge badge-blue" href="#/${routeSlug(e.type)}" style="--tc:${t.color}">${icon(t.icon)} ${t.label}</a>`;
}

function entityCard(e, { rank = false, hours = false } = {}) {
  const t = TYPES[e.type];
  const addr = [e.area, e.address].filter(Boolean).join(" — ");

  return `
  <article class="entity-card" data-go="#/entity/${e.id}" style="--tc:${t.color}" tabindex="0" role="link" aria-label="${esc(e.name)}">
    ${e.featured && rank !== false && e.rank ? `<span class="rank-ribbon">${icon("star")} ${fmtNum(e.rank)}</span>` : ""}
    <div class="ec-flex">
      <div class="ec-media">${icon(t.icon)}</div>
      <div class="ec-body">
        <p class="ec-name">${esc(e.name)}</p>
        <p class="ec-spec"><span class="ec-dot"></span>${esc(e.spec || t.label)}</p>
        ${e.type === "doctor" && e.exp ? `<p class="ec-exp">خبرة ${fmtNum(e.exp)} سنوات</p>` : ""}
        ${addr ? `<p class="ec-addr">${icon("pin")} <span>${esc(addr)}</span></p>` : ""}
        ${hours ? `<p class="ec-hours">${icon("clock")} ${esc(e.hours)}</p>` : ""}
        <div class="ec-meta2">
          ${e.phone ? `<span class="ec-phone" dir="ltr">${icon("phone")} ${fmtPhone(e.phone)}</span>` : ""}
          <a class="ec-map" data-stop href="${mapsLink(e.lat, e.lng, addr)}" target="_blank" rel="noopener">${icon("pin")} الموقع</a>
        </div>
      </div>
      <div class="ec-side">
        <span class="ec-arrow">${icon("arrowLeft")}</span>
        <span class="ec-view">عرض</span>
      </div>
    </div>
  </article>`;
}

/* الضغط على البطاقة كاملة يفتح التفاصيل — عدا الروابط الداخلية الموسومة data-stop */
document.addEventListener("click", (ev) => {
  const go = ev.target.closest("[data-go]");
  if (!go || ev.target.closest("[data-stop]")) return;
  location.hash = go.getAttribute("data-go");
});
document.addEventListener("keydown", (ev) => {
  if (ev.key !== "Enter") return;
  const go = ev.target.closest("[data-go][role='link']");
  if (go && !ev.target.closest("[data-stop]")) location.hash = go.getAttribute("data-go");
});

function isOnCallToday(id) {
  return (ONCALL[DAYS[todayIdx()]] || []).includes(id);
}

const routeSlug = (type) =>
  ({ doctor: "doctors", pharmacy: "pharmacies", hospital: "hospitals", lab: "labs", radiology: "radiology", "health-center": "health-centers" }[type]);

/* ================= البحث ================= */
function searchAll(qRaw) {
  const q = String(qRaw || "").trim();
  if (q.length < 2) return { entities: [], faqs: [] };
  const nq = q.toLowerCase();
  const entities = ENTITIES.filter((e) => {
    const hay = [e.name, e.spec, e.area, e.address, e.owner, e.degree, (e.services || []).join(" "), e.note]
      .filter(Boolean).join(" ").toLowerCase();
    return hay.includes(nq);
  });
  const faqs = FAQ.filter((f) => (f.q + " " + f.a + " " + f.cat).toLowerCase().includes(nq));
  return { entities, faqs };
}

/* ================= الخريطة ================= */
function destroyMap() {
  if (state.map) { state.map.remove(); state.map = null; }
}

function pinIcon(type) {
  const t = TYPES[type];
  return L.divIcon({
    className: "",
    html: `<div class="map-pin" style="--pin:${t.color}">${icon(t.icon)}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 28],
    popupAnchor: [0, -26],
  });
}

function popupHtml(e) {
  return `<b>${esc(e.name)}</b><small>${esc(TYPES[e.type].label)} — ${esc(e.area)}</small><br>
    <a href="${telHref(e.phone)}" dir="ltr">${fmtPhone(e.phone)}</a><br>
    <a href="#/entity/${e.id}">عرض التفاصيل ←</a>`;
}

function mountMap(id, points) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!window.L) {
    el.innerHTML = `<div class="map-fallback">${icon("map")} تعذّر تحميل الخريطة — تحقق من اتصالك بالإنترنت.<br>
      <a href="https://www.openstreetmap.org/#map=15/${SITE.center[0]}/${SITE.center[1]}" target="_blank" rel="noopener">فتح موقع صوران في OpenStreetMap ↗</a></div>`;
    return;
  }
  destroyMap();
  const map = L.map(id, { scrollWheelZoom: false });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  const group = L.featureGroup();
  points.forEach((p) => {
    L.marker([p.lat, p.lng], { icon: pinIcon(p.type), title: p.name })
      .bindPopup(popupHtml(p))
      .addTo(group);
  });
  group.addTo(map);
  try {
    map.fitBounds(group.getBounds().pad(0.3), { maxZoom: 15 });
  } catch (_) {
    map.setView(SITE.center, 14);
  }
  state.map = map;
}

/* ================= التوست والنسخ ================= */
function showToast(msg, kind = "ok") {
  const wrap = $("#toastWrap");
  const el = document.createElement("div");
  el.className = `toast ${kind}`;
  el.innerHTML = `${icon(kind === "ok" ? "check" : "alert")} <span>${esc(msg)}</span>`;
  wrap.appendChild(el);
  setTimeout(() => {
    el.classList.add("hide");
    setTimeout(() => el.remove(), 320);
  }, 3000);
}

document.addEventListener("click", (ev) => {
  const btn = ev.target.closest("[data-copy]");
  if (!btn) return;
  const text = btn.getAttribute("data-copy");
  const done = () => showToast(`تم نسخ الرقم: ${fmtPhone(text)}`);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else fallbackCopy(text, done);
});

function fallbackCopy(text, done) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); done(); } catch (_) { showToast("تعذّر النسخ", "warn"); }
  ta.remove();
}

/* ================= العرض: الرئيسية ================= */
function viewHome() {
  const todayName = DAYS[todayIdx()];

  const featuredDoctors = featuredBy("doctor", 5).map((d) => entityCard(d, { rank: true })).join("");
  const featuredPharmacies = featuredBy("pharmacy", 5).map((p) => entityCard(p, { rank: true })).join("");

  const todayOncall = oncallPharmacies(todayName);

  const legend = Object.entries(TYPES).map(([k, t]) =>
    `<span class="legend-item"><i style="--c:${t.color}"></i>${t.plural}</span>`).join("");

  return `
  <section class="container">
    <div class="hero">
      <h1>كل ما تحتاجه من خدمات طبية في مدينة صوران — في مكان واحد</h1>
      <div class="hero-search">
        <div class="hero-search-box">
          ${icon("search")}
          <input type="search" id="heroSearch" placeholder="ابحث عن طبيب، اختصاص، صيدلية أو خدمة طبية…" autocomplete="off" aria-label="بحث في الدليل" />
          <a class="btn btn-primary hero-search-btn" href="#/search" id="heroSearchBtn">بحث</a>
        </div>
        <div class="hero-suggest" id="heroSuggest" hidden></div>
      </div>
      <div class="hero-chips">
        <a class="hero-chip" href="#/doctors">الأطباء</a>
        <a class="hero-chip" href="#/pharmacies">الصيدليات</a>
        <a class="hero-chip" href="#/hospitals">المشافي</a>
        <a class="hero-chip" href="#/health-centers">المراكز الطبية</a>
        <a class="hero-chip" href="#/oncall">الصيدليات المناوبة</a>
      </div>
    </div>
  </section>

  ${adsStrip("home") ? `<section class="container" style="margin-top:14px">${adsStrip("home")}</section>` : ""}

  <section class="section container">
    <div class="section-head">
      <div><h2>أطباء مميزون</h2><p>عيادات مختارة حسب تفاعل الأهالي وتحديث البيانات</p></div>
      <a class="section-link" href="#/doctors">كل الأطباء ${icon("arrowLeft")}</a>
    </div>
    <div class="cards-scroll">${featuredDoctors}</div>
  </section>

  <section class="section container">
    <div class="section-head">
      <div><h2>صيدليات مميزة</h2><p>مع شارة المناوبة للصيدليات المناوبة اليوم</p></div>
      <a class="section-link" href="#/pharmacies">كل الصيدليات ${icon("arrowLeft")}</a>
    </div>
    <div class="cards-scroll">${featuredPharmacies}</div>
  </section>

  <section class="section container">
    <div class="section-head">
      <div><h2>صيدليات المناوبة اليوم</h2><p>${todayName} — الصيدليات العاملة خارج أوقات الدوام، اتصل قبل التوجه</p></div>
      <a class="section-link" href="#/oncall">جدول المناوبة ${icon("arrowLeft")}</a>
    </div>
    <div class="card oncall-today-card">
      <div class="oncall-mini">
        ${todayOncall.length ? todayOncall.map((p) => `
          <a class="oncall-mini-item" href="${telHref(p.phone)}">
            ${icon("pill")}
            <strong>${esc(p.name)}</strong>
            <span dir="ltr">${fmtPhone(p.phone)}</span>
          </a>`).join("") : `<p class="oncall-empty">لا توجد صيدليات مناوبة مسجلة لهذا اليوم — راجع جدول بقية الأيام.</p>`}
      </div>
    </div>
  </section>

  <section class="section container">
    <div class="section-head">
      <div><h2>الخريطة الطبية للمدينة</h2><p>مواقع تقريبية لكل الجهات المسجلة — اضغط العلامة للتفاصيل</p></div>
    </div>
    <div class="map-wrap">
      <div class="map-head">
        <h3>${icon("map")} خريطة صوران الصحية</h3>
        <div class="map-legend">${legend}</div>
      </div>
      <div id="homeMap"></div>
    </div>
    <p class="map-note">${icon("info")} المواقع تقريبية لأغراض التوجيه، والعنوان الدقيق مذكور في صفحة كل جهة.</p>
  </section>

  <section class="container" style="padding-bottom:40px">
    <div class="cta-band cta-blue">
      <div>
        <h3>عندك سؤال صحي؟ اسأل أهل الاختصاص</h3>
        <p>مكتبة إرشادات طبية موثوقة باللغة العربية، وإن لم تجد إجابتك فأرسل سؤالك وسيراجعه فريق الدليل.</p>
      </div>
      <a class="btn btn-gold btn-lg" href="#/ask">${icon("chat")} اسأل الآن</a>
    </div>
  </section>`;
}

function afterHome() {
  /* اقتراحات البحث في الهيرو */
  const input = $("#heroSearch");
  const box = $("#heroSuggest");
  if (input && box) {
    const renderSuggest = () => {
      const q = input.value.trim();
      if (q.length < 2) { box.hidden = true; box.innerHTML = ""; return; }
      const { entities, faqs } = searchAll(q);
      const items = [
        ...entities.slice(0, 6).map((e) => `
          <button class="suggest-item" type="button" data-go="#/entity/${e.id}">
            <span class="s-icon" style="--tc:${TYPES[e.type].color}">${icon(TYPES[e.type].icon)}</span>
            <span><strong>${esc(e.name)}</strong><small>${esc(e.spec || TYPES[e.type].label)} — ${esc(e.area)}</small></span>
          </button>`),
        ...faqs.slice(0, 2).map((f) => `
          <button class="suggest-item" type="button" data-go="#/ask">
            <span class="s-icon">${icon("doc")}</span>
            <span><strong>${esc(f.q)}</strong><small>سؤال شائع — ${esc(f.cat)}</small></span>
          </button>`),
      ].join("");
      box.innerHTML = items || `<p class="search-hint">لا نتائج مطابقة لكلمة «${esc(q)}» — جرّب كلمة أخرى.</p>`;
      box.hidden = false;
    };
    input.addEventListener("input", renderSuggest);
    input.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        const first = box.querySelector("[data-go]");
        if (first) { location.hash = first.getAttribute("data-go"); box.hidden = true; }
        else location.hash = "#/search?q=" + encodeURIComponent(input.value.trim());
      }
      if (ev.key === "Escape") box.hidden = true;
    });
    input.addEventListener("blur", () => setTimeout(() => { box.hidden = true; }, 180));
    box.addEventListener("click", (ev) => {
      const b = ev.target.closest("[data-go]");
      if (b) { box.hidden = true; location.hash = b.getAttribute("data-go"); }
    });
  }

  mountMap("homeMap", ENTITIES);
}

/* ================= العرض: قوائم الجهات ================= */
const TYPE_INTRO = {
  doctor: "عيادات وأطباء داخل مدينة صوران مع التخصصات وأوقات العمل وأرقام الاتصال المباشر.",
  pharmacy: "صيدليات المدينة مع أوقات العمل وشارة «مناوبة اليوم» للصيدليات المناوبة حالياً.",
  hospital: "المشافي والمستوصفات في صوران: خدماتها وأرقامها وأوقات العيادات والطوارئ.",
  lab: "مخابر التحاليل الطبية داخل المدينة مع الخدمات المتوفرة وأوقات السحب.",
  radiology: "مراكز الأشعة والسونار: أجهزتها وخدماتها ومواعيد عملها.",
  "health-center": "المراكز الصحية الحكومية والأهلية: تطعيمات، رعاية أولية، وتثقيف صحي.",
};

function viewList(type, params) {
  const t = TYPES[type];
  const f = state.filters[type];
  const specParam = params.get("spec");
  if (specParam) f.spec = specParam;

  /* الفلترة المبسطة: الأطباء = بحث + اختصاص، وبقية الأقسام = بحث بالاسم فقط */
  const specs = [...new Set(entitiesByType(type).map((e) => e.spec).filter(Boolean))].sort();
  const showSpec = type === "doctor" && specs.length;
  const ph = type === "doctor" ? "ابحث باسم الطبيب أو الاختصاص…"
    : type === "pharmacy" ? "ابحث باسم الصيدلية…"
    : "ابحث بالاسم…";

  const specSel = showSpec ? `
    <select id="fSpec" aria-label="تصفية حسب التخصص">
      <option value="">كل التخصصات</option>
      ${specs.map((s) => `<option value="${esc(s)}" ${f.spec === s ? "selected" : ""}>${esc(s)}</option>`).join("")}
    </select>` : "";

  return `
  <section class="page-hero">
    <div class="container">
      <nav class="breadcrumb" aria-label="مسار التنقل">
        <a href="#/">الرئيسية</a> ${icon("chevLeft")} <span>${t.plural}</span>
      </nav>
      <h1>${icon(t.icon)} ${t.plural} في صوران</h1>
      <p>${TYPE_INTRO[type]}</p>
    </div>
  </section>
  <div class="container">
    <div class="toolbar">
      <div class="search-field">${icon("search")}<input id="fQ" type="search" placeholder="${ph}" value="${esc(f.q)}" /></div>
      ${specSel}
      <span class="toolbar-count" id="fCount"></span>
    </div>
    <div id="listBody"></div>
  </div>`;
}

function applyList(type) {
  const f = state.filters[type];
  let list = entitiesByType(type).slice();

  if (f.q) {
    const nq = f.q.toLowerCase();
    list = list.filter((e) =>
      [e.name, e.spec, e.area, e.address, e.owner, (e.services || []).join(" ")]
        .filter(Boolean).join(" ").toLowerCase().includes(nq));
  }
  if (f.spec) list = list.filter((e) => e.spec === f.spec);
  if (f.area) list = list.filter((e) => e.area === f.area);

  if (f.sort === "name") list.sort((a, b) => a.name.localeCompare(b.name, "ar"));
  else if (f.sort === "exp") list.sort((a, b) => (b.exp || 0) - (a.exp || 0));
  else list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || (a.rank || 99) - (b.rank || 99));

  const body = $("#listBody");
  const count = $("#fCount");
  if (count) count.innerHTML = `<b>${fmtNum(list.length)}</b> نتيجة`;
  if (!body) return;
  body.innerHTML = list.length
    ? `<div class="cards-grid" style="padding-bottom:52px">${list.map((e) => entityCard(e)).join("")}</div>`
    : `<div class="empty-state" style="margin-bottom:52px">
        ${icon("search")}<h3>لا توجد نتائج مطابقة</h3>
        <p>جرّب تعديل كلمة البحث أو إزالة عوامل التصفية.</p>
       </div>`;
}

function bindList(type) {
  const f = state.filters[type];
  const q = $("#fQ"), spec = $("#fSpec"), area = $("#fArea"), sort = $("#fSort");
  let deb;
  if (q) q.addEventListener("input", () => {
    clearTimeout(deb);
    deb = setTimeout(() => { f.q = q.value.trim(); applyList(type); }, 180);
  });
  if (spec) spec.addEventListener("change", () => { f.spec = spec.value; applyList(type); });
  if (area) area.addEventListener("change", () => { f.area = area.value; applyList(type); });
  if (sort) sort.addEventListener("change", () => { f.sort = sort.value; applyList(type); });
  applyList(type);
}

/* ================= العرض: المناوبة ================= */
function viewOncall(params) {
  const raw = params.get("day");
  const parsed = raw === null || raw === "" ? NaN : parseInt(raw, 10);
  const day = Number.isNaN(parsed) ? state.oncallDay : Math.min(6, Math.max(0, parsed));
  state.oncallDay = day;
  const today = todayIdx();
  const list = oncallPharmacies(DAYS[day]);
  const note = day === today
    ? "هذه صيدليات المناوبة اليوم — اتصل قبل التوجه للتأكد من توفر الدواء المطلوب."
    : "هذه صيدليات المناوبة لليوم المحدد — قد تتغير الجدولة، تابع تحديثات الدليل.";

  const tabs = DAYS.map((d, i) => `
    <button class="day-tab ${i === day ? "active" : ""}" type="button" data-day="${i}">
      ${d}${i === today ? '<span class="t-badge">اليوم</span>' : ""}
    </button>`).join("");

  const cards = list.length ? list.map((p) => entityCard(p, { hours: true })).join("")
    : `<div class="empty-state">${icon("pill")}<h3>لا توجد صيدليات مناوبة مسجلة</h3><p>راجع جدول بقية الأيام أو تواصل مع الاستعلامات.</p></div>`;

  return `
  <section class="page-hero">
    <div class="container">
      <nav class="breadcrumb" aria-label="مسار التنقل">
        <a href="#/">الرئيسية</a> ${icon("chevLeft")} <a href="#/pharmacies">الصيدليات</a> ${icon("chevLeft")} <span>المناوبة</span>
      </nav>
      <h1>${icon("ambulance")} صيدليات المناوبة</h1>
      <p>جدول المناوبة الأسبوعي لصيدليات مدينة صوران. اختر اليوم لعرض الصيدليات التي تعمل خارج أوقات الدوام.</p>
    </div>
  </section>
  <div class="container" style="padding:26px 0 56px">
    <div class="day-tabs" role="tablist" aria-label="أيام الأسبوع">${tabs}</div>
    <div class="note-box">${icon("info")}<p>${note}</p></div>
    <div class="emg-strip">
      ${SITE.emergency.map((em) => `<a class="emg-pill" href="tel:${em.num}">${icon(em.icon)} ${esc(em.label)} <b>${em.num}</b></a>`).join("")}
    </div>
    <div class="cards-grid" style="margin-top:20px">${cards}</div>
  </div>`;
}

function bindOncall() {
  $$(".day-tab").forEach((b) =>
    b.addEventListener("click", () => {
      state.oncallDay = Number(b.getAttribute("data-day"));
      render();
    }));
}

/* ================= العرض: تفاصيل الجهة ================= */
function viewEntity(id) {
  const e = entityById(id);
  if (!e) return view404();
  const t = TYPES[e.type];
  const related = entitiesByType(e.type).filter((x) => x.id !== e.id).slice(0, 3);

  const badges = [];
  if (e.featured) badges.push(`<span class="badge badge-amber">${icon("star")} جهة مميزة</span>`);
  if (e.shift24) badges.push(`<span class="badge badge-open">${icon("clock")} تعمل 24 ساعة</span>`);
  if (e.type === "pharmacy" && isOnCallToday(e.id)) badges.push(`<span class="badge badge-rose">${icon("ambulance")} مناوبة اليوم</span>`);
  if (e.type === "doctor") badges.push(`<span class="badge badge-blue">${icon("briefcase")} خبرة ${fmtNum(e.exp)} سنة</span>`);

  const services = (e.services || []).map((s) => `<span class="mini-tag">${esc(s)}</span>`).join("");

  return `
  <section class="page-hero detail-hero">
    <div class="container">
      <nav class="breadcrumb" aria-label="مسار التنقل">
        <a href="#/">الرئيسية</a> ${icon("chevLeft")} <a href="#/${routeSlug(e.type)}">${t.plural}</a> ${icon("chevLeft")} <span>${esc(e.name)}</span>
      </nav>
      <div class="detail-card" style="--tc:${t.color}">
        <div class="detail-banner"></div>
        <div class="detail-main">
          <span class="detail-avatar" style="--tc:${t.color}">${icon(t.icon)}</span>
          <div class="detail-title">
            <h1>${esc(e.name)}</h1>
            <p class="sub">${e.spec ? esc(e.spec) + " — " : ""}${esc(e.degree || t.label)}${e.owner ? " · " + esc(e.owner) : ""}</p>
            <div class="entity-badges">${badges.join("")}</div>
          </div>
        </div>
        <div class="detail-actions">
          <a class="btn btn-primary" href="${telHref(e.phone)}">${icon("phone")} اتصال</a>
          ${e.whatsapp ? `<a class="btn btn-ghost" href="${waHref(e.phone)}" target="_blank" rel="noopener">${icon("chat")} واتساب</a>` : ""}
          <a class="btn btn-outline" href="${mapsLink(e.lat, e.lng, e.address)}" target="_blank" rel="noopener">${icon("pin")} الموقع</a>
          <button class="btn btn-ghost" type="button" data-copy="${esc(e.phone)}">${icon("copy")} نسخ الرقم</button>
          <button class="btn btn-ghost btn-icon" type="button" id="btnShare" title="مشاركة" aria-label="مشاركة">${icon("share")}</button>
        </div>
        <div class="detail-info">
          <div class="info-box">${icon("pin")}
            <div><h4>العنوان</h4><p>${esc(e.area)}</p><small>${esc(e.address)}</small></div>
          </div>
          <div class="info-box">${icon("clock")}
            <div><h4>أوقات العمل</h4><p>${esc(e.hours)}</p></div>
          </div>
          <div class="info-box">${icon("phone")}
            <div><h4>الهاتف</h4><p class="phone-line"><span dir="ltr">${fmtPhone(e.phone)}</span></p>
            <small>اضغط زر الاتصال أعلاه للاتصال مباشرة</small></div>
          </div>
          ${e.type === "doctor" ? `
          <div class="info-box">${icon("user")}
            <div><h4>الصفة</h4><p>${esc(e.degree)}</p><small>${esc(e.spec)}</small></div>
          </div>` : ""}
        </div>
        ${e.note ? `<div style="padding:0 22px 20px"><div class="note-box">${icon("info")}<p>${esc(e.note)}</p></div></div>` : ""}
      </div>
    </div>
  </section>

  <div class="container page-wrap">
    ${adsStrip("detail") ? `<div style="margin-bottom:20px">${adsStrip("detail")}</div>` : ""}
    ${services ? `
    <div class="detail-section">
      <div class="section-head"><div><h2>${e.type === "doctor" ? "التخصصات والخدمات" : "الخدمات المتوفرة"}</h2></div></div>
      <div class="chips-lg">${services}</div>
    </div>` : ""}

    <div class="detail-section">
      <div class="section-head"><div><h2>الموقع على الخريطة</h2><p>${esc(e.area)} — ${esc(e.address)}</p></div></div>
      <div class="map-wrap"><div id="entityMap"></div></div>
      <p class="map-note">${icon("info")} الموقع تقريبي — استخدم تطبيق الخرائط على هاتفك للوصول الدقيق.</p>
    </div>

    ${related.length ? `
    <div class="detail-section">
      <div class="section-head">
        <div><h2>جهات ذات صلة</h2><p>${esc(t.plural)} أخرى في صوران</p></div>
        <a class="section-link" href="#/${routeSlug(e.type)}">القسم كاملاً ${icon("arrowLeft")}</a>
      </div>
      <div class="cards-grid">${related.map((r) => entityCard(r)).join("")}</div>
    </div>` : ""}
  </div>`;
}

function afterEntity(id) {
  const e = entityById(id);
  if (!e) return;
  mountMap("entityMap", [e]);
  const share = $("#btnShare");
  if (share) share.addEventListener("click", async () => {
    const url = location.href;
    if (navigator.share) {
      try { await navigator.share({ title: e.name + " — دليل صوران الطبي", url }); } catch (_) {}
    } else {
      navigator.clipboard && navigator.clipboard.writeText(url);
      showToast("تم نسخ رابط الصفحة");
    }
  });
}

/* ================= العرض: اسأل طبياً ================= */
function viewAsk() {
  const cats = ["الكل", ...new Set(FAQ.map((f) => f.cat))];
  return `
  <section class="page-hero">
    <div class="container">
      <nav class="breadcrumb" aria-label="مسار التنقل">
        <a href="#/">الرئيسية</a> ${icon("chevLeft")} <span>اسأل طبياً</span>
      </nav>
      <h1>${icon("chat")} اسأل طبياً</h1>
      <p>مكتبة إرشادات توعوية يجيب عنها فريق الدليل، وأجوبة على الأسئلة الصحية الأكثر شيوعاً بين أهالي المدينة.</p>
    </div>
  </section>
  <div class="container page-wrap">
    <div class="ask-layout">
      <div>
        <div class="toolbar" style="margin-top:0;margin-bottom:18px">
          <div class="search-field">${icon("search")}<input id="askQ" type="search" placeholder="ابحث في الأسئلة والإرشادات…" value="${esc(state.askQuery)}" /></div>
        </div>
        <div class="chip-row" style="margin-bottom:18px">
          ${cats.map((c) => `<button class="chip ${state.askCat === c ? "active" : ""}" type="button" data-cat="${esc(c)}">${esc(c)}</button>`).join("")}
        </div>
        <div class="accordion" id="faqList"></div>
      </div>
      <aside>
        <div class="form-card">
          <h3>${icon("send")} لم تجد إجابتك؟</h3>
          <p>أرسل سؤالك وسيراجعه فريق الدليل ويتواصل معك. لا تُنشر أسئلتك ولا تُشارك بياناتك.</p>
          <form id="askForm" class="form-grid" novalidate>
            <div class="field">
              <label for="aqName">الاسم <small>(اختياري)</small></label>
              <input id="aqName" type="text" placeholder="اسمك الكريم" />
            </div>
            <div class="field">
              <label for="aqPhone">رقم الهاتف <small>(اختياري — للرد المباشر)</small></label>
              <input id="aqPhone" type="tel" inputmode="tel" placeholder="09XX XXX XXX" dir="ltr" style="text-align:end" />
            </div>
            <div class="field">
              <label for="aqText">سؤالك الصحي</label>
              <textarea id="aqText" placeholder="اكتب سؤالك بوضوح: الأعراض، العمر، مدة الشكوى…" required></textarea>
            </div>
            <button class="btn btn-primary btn-block" type="submit">${icon("send")} إرسال السؤال</button>
          </form>
          <div class="note-box" style="margin-top:16px;background:rgba(245,158,11,.1);border-color:rgba(245,158,11,.3)">
            ${icon("alert")}<p style="font-size:13px">للحالات الطارئة اتصل بالإسعاف مباشرة — هذه الصفحة للحالات غير العاجلة فقط.</p>
          </div>
        </div>
        <div class="my-questions" id="myQuestions"></div>
      </aside>
    </div>
  </div>`;
}

function applyFaq() {
  const list = $("#faqList");
  if (!list) return;
  const nq = state.askQuery.trim().toLowerCase();
  const items = FAQ.filter((f) =>
    (state.askCat === "الكل" || f.cat === state.askCat) &&
    (!nq || (f.q + " " + f.a + " " + f.cat).toLowerCase().includes(nq)));
  list.innerHTML = items.length
    ? items.map((f) => `
      <details class="acc-item">
        <summary><span class="acc-q">؟</span> ${esc(f.q)} <span class="acc-cat">${esc(f.cat)}</span>${icon("chevDown", "chev")}</summary>
        <div class="acc-body"><p>${esc(f.a)}</p></div>
      </details>`).join("")
    : `<div class="empty-state">${icon("search")}<h3>لا توجد إجابة مطابقة</h3><p>جرّب كلمات أخرى أو أرسل سؤالك من النموذج المجاور.</p></div>`;
}

function myQuestionsHtml() {
  let arr = [];
  try { arr = JSON.parse(localStorage.getItem("ds-questions") || "[]"); } catch (_) {}
  if (!arr.length) return "";
  return `
    <h3 style="font-size:16px">${icon("doc")} أسئلتي المرسلة</h3>
    ${arr.map((q, i) => `
      <div class="my-q-item">
        <p>${esc(q.text)}
          <span class="my-q-meta">${esc(q.date)} · <strong style="color:var(--accent-600)">قيد المراجعة</strong></span>
        </p>
        <button class="my-q-del" type="button" data-del-q="${i}" title="حذف السؤال" aria-label="حذف السؤال">${icon("x")}</button>
      </div>`).join("")}`;
}

function bindAsk() {
  const q = $("#askQ");
  if (q) q.addEventListener("input", () => { state.askQuery = q.value; applyFaq(); });
  $$(".chip[data-cat]").forEach((c) =>
    c.addEventListener("click", () => {
      state.askCat = c.getAttribute("data-cat");
      $$(".chip[data-cat]").forEach((x) => x.classList.toggle("active", x === c));
      applyFaq();
    }));
  applyFaq();

  const form = $("#askForm");
  if (form) form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const text = $("#aqText").value.trim();
    if (text.length < 10) { showToast("اكتب سؤالاً أوضح (10 أحرف على الأقل)", "warn"); return; }
    const nameVal = $("#aqName").value.trim();
    const phoneVal = $("#aqPhone").value.trim();
    let arr = [];
    try { arr = JSON.parse(localStorage.getItem("ds-questions") || "[]"); } catch (_) {}
    arr.unshift({
      text,
      name: nameVal,
      phone: phoneVal,
      date: new Date().toLocaleDateString("ar-SY"),
    });
    localStorage.setItem("ds-questions", JSON.stringify(arr.slice(0, 20)));
    form.reset();
    $("#myQuestions").innerHTML = myQuestionsHtml();
    const sent = await supabaseInsert("questions", { name: nameVal, phone: phoneVal, question: text });
    showToast(
      sent ? "تم استلام سؤالك — سيُراجع قريباً" : "حُفظ سؤالك محلياً (تعذّر الاتصال بالخادم)",
      sent ? "ok" : "warn",
    );
  });

  const mq = $("#myQuestions");
  if (mq) {
    mq.innerHTML = myQuestionsHtml();
    mq.addEventListener("click", (ev) => {
      const del = ev.target.closest("[data-del-q]");
      if (!del) return;
      let arr = [];
      try { arr = JSON.parse(localStorage.getItem("ds-questions") || "[]"); } catch (_) {}
      arr.splice(Number(del.getAttribute("data-del-q")), 1);
      localStorage.setItem("ds-questions", JSON.stringify(arr));
      mq.innerHTML = myQuestionsHtml();
      showToast("تم حذف السؤال");
    });
  }
}

/* ================= العرض: نتائج البحث (نمط SearchPage) ================= */
function viewSearch(params) {
  const q = params.get("q") || "";
  const { entities, faqs } = searchAll(q);
  const total = entities.length + faqs.length;

  const groups = {};
  entities.forEach((e) => { (groups[e.type] = groups[e.type] || []).push(e); });

  const groupSections = Object.entries(groups).map(([type, items]) => {
    const t = TYPES[type];
    return `
    <section class="s-group">
      <h2 class="group-title"><span class="g-sq" style="--tc:${t.color}"></span>${t.plural} <span class="g-count">(${fmtNum(items.length)})</span></h2>
      <div class="s-rows">
        ${items.map((e) => `
          <a class="result-row" href="#/entity/${e.id}">
            <span class="r-icon" style="--tc:${t.color}">${icon(t.icon)}</span>
            <span class="r-body">
              <b>${esc(e.name)}</b>
              <small>${esc(e.spec || t.label)}${e.area ? " — " + esc(e.area) : ""}</small>
            </span>
          </a>`).join("")}
      </div>
    </section>`;
  }).join("");

  const faqSection = faqs.length ? `
    <section class="s-group">
      <h2 class="group-title"><span class="g-sq" style="--tc:var(--gold-dark)"></span>أسئلة وأجوبة <span class="g-count">(${fmtNum(faqs.length)})</span></h2>
      <div class="s-rows">
        ${faqs.map((f) => `
          <a class="result-row" href="#/ask">
            <span class="r-icon" style="--tc:var(--gold-dark)">${icon("doc")}</span>
            <span class="r-body"><b>${esc(f.q)}</b><small>${esc(f.cat)}</small></span>
          </a>`).join("")}
      </div>
    </section>` : "";

  return `
  <div class="container page-wrap search-page">
    <h1 class="page-title">البحث في دليل صوران الطبي</h1>
    <form class="search-big" id="searchBigForm">
      ${icon("search")}
      <input id="searchBigInput" type="search" placeholder="ابحث عن طبيب، اختصاص، عيادة، صيدلية أو خدمة طبية..." value="${esc(q)}" autocomplete="off" />
      <button class="btn btn-primary" type="submit">بحث</button>
    </form>

    <div class="s-groups">
      ${!q.trim() ? `<p class="s-hint">اكتب كلمة بحث للبدء.</p>` : total ? groupSections + faqSection : `
      <div class="empty-state s-empty">
        ${icon("searchX")}
        <h3>لا توجد نتائج لـ «${esc(q)}»</h3>
        <p>جرّب كلمات بحث أخرى أو تصفح الأقسام الرئيسية.</p>
        <div class="chip-row" style="justify-content:center;margin-top:12px">
          <a class="chip" href="#/doctors">الأطباء</a>
          <a class="chip" href="#/pharmacies">الصيدليات</a>
          <a class="chip" href="#/oncall">الصيدليات المناوبة</a>
          <a class="chip" href="#/ask">اسأل</a>
        </div>
      </div>`}
    </div>
  </div>`;
}

function bindSearch() {
  const form = $("#searchBigForm");
  if (form) form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const v = $("#searchBigInput").value.trim();
    location.hash = "#/search?q=" + encodeURIComponent(v);
  });
}

/* ================= الصفحات الثابتة ================= */
function viewAbout() {
  const features = [
    { ic: "stetho", t: "الأطباء والعيادات", d: "دليل كامل للأطباء مع التخصصات وسنوات الخبرة وأرقام التواصل المباشر." },
    { ic: "pill", t: "الصيدليات", d: "صيدليات المدينة مع أوقات الدوام وشارة «تعمل 24 ساعة»." },
    { ic: "moon", t: "صيدليات المناوبة", d: "جدول المناوبة الأسبوعي — اعرف الصيدلية المفتوحة اليوم فوراً." },
    { ic: "hospital", t: "المشافي والمراكز", d: "المشافي والمراكز الصحية والمخابر ومراكز الأشعة في مكان واحد." },
    { ic: "map", t: "خريطة تفاعلية", d: "مواقع كل الجهات على خريطة المدينة مع أقصر طريق للوصول." },
    { ic: "chat", t: "اسأل طبياً", d: "إرشادات صحية موثوقة ومبسطة، وإرسال أسئلتك لفريق الدليل مباشرة." },
  ];
  const stats = [
    { n: fmtNum(ENTITIES.length), l: "جهة طبية" },
    { n: fmtNum(entitiesByType("doctor").length), l: "طبيب وعيادة" },
    { n: fmtNum(entitiesByType("pharmacy").length), l: "صيدلية" },
    { n: "6", l: "أقسام طبية" },
  ];
  return `
  <div class="container page-wrap">
    <nav class="breadcrumb on-page" aria-label="مسار التنقل">
      <a href="#/">الرئيسية</a> ${icon("chevLeft")} <span>عن المنصة</span>
    </nav>

    <div class="about-hero">
      <span class="pill-badge">${icon("sparkles")} عن المنصة</span>
      <h1>دليل صوران الطبي</h1>
      <p>منصة مجتمعية مجانية تجمع كل الخدمات الصحية في مدينة صوران — أطباء، صيدليات، مشافي، مخابر، أشعة ومراكز صحية — في مكان واحد، ببيانات محدّثة وخريطة تفاعلية وجدول مناوبة أسبوعي.</p>
    </div>

    <div class="about-stats">
      ${stats.map((s) => `
      <div class="about-stat">
        <b>${s.n}</b>
        <span>${s.l}</span>
      </div>`).join("")}
    </div>

    <div class="card about-card">
      <div class="about-card-head">
        <span class="a-icon">${icon("heart")}</span>
        <h2>ما هي دليل صوران الطبي؟</h2>
      </div>
      <p class="about-text">
        في كل يوم يبحث أهالي مدينة صوران عن أقرب عيادة أسنان، أو مخبر يعمل مساءً، أو صيدلية مناوبة للّيلة،
        أو رقم مشفى لطلب الإسعاف. دليل صوران الطبي يجمع هذه المعلومات المتفرقة في مكان واحد:
        منظّمة، محدّثة، ومجانية للجميع — من أبناء المدينة ولأهلها.
      </p>
    </div>

    <div class="features-grid">
      ${features.map((f) => `
        <div class="feature-card">
          <span class="f-icon">${icon(f.ic)}</span>
          <div><p>${f.t}</p><small>${f.d}</small></div>
        </div>`).join("")}
    </div>

    <div class="dev-feature">
      <div class="dev-inner">
        <span class="dev-blob b1"></span>
        <span class="dev-blob b2"></span>
        <div class="dev-head">
          <span class="dev-ic">${icon("code")}</span>
          <div>
            <p class="dev-tag">بطاقة المطوّر</p>
            <h3>مطوّر وتقني دليل صوران الطبي</h3>
          </div>
        </div>
        <div class="dev-body">
          <div class="dev-avatar">
            <span>${esc((SITE.developer.name || "م").trim().slice(0, 1))}</span>
            <span class="dev-badge">${icon("badgeCheck")}</span>
          </div>
          <div class="dev-info">
            <p class="dev-name">${esc(SITE.developer.name)}</p>
            <p class="dev-role">${esc(SITE.developer.title || "مطوّر المنصة")}</p>
            <p class="dev-desc">تطوير وإشراف فني كامل على المنصة — للإبلاغ عن خطأ في البيانات أو إضافة جهة جديدة أو الاستفسارات التقنية، تواصل مباشرة عبر القنوات التالية.</p>
            <div class="dev-actions">
              <a class="dev-btn dev-btn-phone" href="tel:${esc(SITE.developer.phone)}">${icon("phone")} <span dir="ltr">${fmtPhone(SITE.developer.phone)}</span></a>
              ${SITE.developer.instagram ? `<a class="dev-btn dev-btn-ig" href="${esc(SITE.developer.instagram)}" target="_blank" rel="noopener">${icon("instagram")} إنستغرام</a>` : ""}
              ${SITE.developer.facebook ? `<a class="dev-btn dev-btn-fb" href="${esc(SITE.developer.facebook)}" target="_blank" rel="noopener">${icon("facebook")} فيسبوك</a>` : ""}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card support-card">
      <div class="support-row">
        <div>
          <p class="support-title">إضافة جهة أو تعديل بيانات</p>
          <p class="support-sub">لإضافة جهة طبية جديدة للدليل أو تصحيح أي بيانات، تواصل مباشرة مع مطوّر المنصة عبر بطاقة المطوّر أعلاه أو الهاتف المجاور.</p>
        </div>
        <a class="support-btn" href="tel:${esc(SITE.developer.phone)}">${icon("phone")} <span dir="ltr">${fmtPhone(SITE.developer.phone)}</span></a>
      </div>
    </div>
  </div>`;
}

function viewPackages() {
  return `
  <div class="container page-wrap plans-page">
    <div class="plans-head">
      <h1>باقات الاشتراك</h1>
      <p>ارتقِ بظهور صفحتك في دليل صوران الطبي — يُفعّل الاشتراك لمدة شهر كامل من تاريخ الموافقة.</p>
      <p class="plans-login">لديك اشتراك فعّال؟ <a href="#/login">تسجيل دخول الجهة ←</a></p>
    </div>
    <div class="plans-grid">
      ${PACKAGES.map((p) => {
        const waMsg = waHref(SITE.developer.phone, "مرحباً، أرغب بالاشتراك في «" + p.name + "» في دليل صوران الطبي");
        const inner = `
          <span class="plan-ic ${p.id}">${icon(p.id === "free" ? "lock" : p.id === "pro" ? "sparkles" : "crown")}</span>
          <h3>${esc(p.name)}</h3>
          <p class="plan-desc">${esc(p.description)}</p>
          <ul class="plan-features">
            ${p.features.map((f) => `<li>${icon("check")} ${esc(f)}</li>`).join("")}
          </ul>
          <span class="plan-cta ${p.id === "free" ? "is-free" : ""}">${p.id === "free" ? "الباقة الأساسية لكل الجهات" : icon("chat") + " اطلب الاشتراك عبر واتساب"}</span>`;
        return p.id === "free"
          ? `<article class="plan-card">${inner}</article>`
          : `<a class="plan-card ${p.featured ? "is-gold" : ""}" href="${waMsg}" target="_blank" rel="noopener">${inner}</a>`;
      }).join("")}
    </div>
    <p class="plans-note">لم تجد جهتك في الدليل؟ <a href="${waHref(SITE.developer.phone, "مرحباً، أرغب بإضافة جهتي إلى دليل صوران الطبي")}" target="_blank" rel="noopener">تواصل مع الإدارة</a> لإضافتها أولاً، ثم قدّم طلب الترقية.</p>
  </div>`;
}

function viewLogin() {
  return `
  <section class="container page-wrap">
    <div class="login-wrap">
      <div class="login-card">
        <div class="login-head">
          <span class="l-icon">${icon("key")}</span>
          <h1>دخول الجهة</h1>
          <p>أدخل البريد وكلمة السر الخاصين بك للوصول إلى لوحة تحكم صفحتك.</p>
        </div>
        <form id="loginForm" class="form-grid" novalidate>
          <div class="field">
            <label for="lgUser">البريد الإلكتروني</label>
            <input id="lgUser" type="text" dir="ltr" placeholder="admin-...@gmail.com" autocomplete="username" />
          </div>
          <div class="field">
            <label for="lgPass">كلمة السر</label>
            <input id="lgPass" type="password" dir="ltr" placeholder="كلمة السر المرسلة لك" autocomplete="current-password" />
          </div>
          <p class="login-error" id="loginError" hidden>بيانات الدخول غير صحيحة</p>
          <button class="btn btn-primary btn-block" type="submit">${icon("key")} دخول</button>
        </form>
        <p class="login-note">بيانات الدخول تُسلَّم لك عند تفعيل اشتراكك من قبل إدارة المنصة.</p>
      </div>
    </div>
  </section>`;
}

function view404() {
  return `
  <div class="container page-wrap">
    <div class="empty-state" style="padding:80px 20px">
      <h3 style="font-size:26px">404 — الصفحة غير موجودة</h3>
      <p>يبدو أن الرابط الذي تبحث عنه تغيّر أو حُذف.</p>
      <div style="margin-top:18px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <a class="btn btn-primary" href="#/">العودة للرئيسية</a>
        <a class="btn btn-ghost" href="#/doctors">تصفّح الأطباء</a>
      </div>
    </div>
  </div>`;
}

/* ---------- الصفحات القانونية ---------- */
function viewPrivacy() {
  return pageShell("سياسة الخصوصية", "shield", `
    <h2>مقدمة</h2>
    <p>دليل صوران الطبي مشروع مجتمعي يحترم خصوصية زوّاره. توضح هذه السياسة ما نجمعه وكيف نتعامل معه.</p>
    <h2>ما لا نجمعه</h2>
    <ul>
      <li>لا نطلب إنشاء حساب للاستفادة من الدليل، ولا نتتبع موقعك الجغرافي.</li>
      <li>لا نستخدم ملفات تتبع إعلانية ولا نشارك أي بيانات مع جهات تسويقية.</li>
    </ul>
    <h2>ما قد يُحفظ على جهازك فقط</h2>
    <ul>
      <li><strong>الأسئلة والرسائل المرسلة من النماذج</strong> تُحفظ مؤقتاً في متصفحك (localStorage) لعرضها لك في «أسئلتي»، ولا تُرسل إلى أي خادم في النسخة التجريبية.</li>
      <li><strong>تفضيل الوضع الليلي</strong> يُحفظ على جهازك فقط.</li>
    </ul>
    <h2>بيانات الجهات الطبية</h2>
    <p>تُنشر بيانات الجهات (الاسم، التخصص، الهاتف، العنوان، أوقات العمل) بموافقة أصحابها ولأغراض الدليل فقط. صاحب الجهة يستطيع طلب تعديل أو حذف بياناته عبر <a href="#/about">صفحة عن المنصة</a>.</p>
    <h2>حقوقك</h2>
    <p>يمكنك في أي وقت حذف أسئلتك المحفوظة محلياً من زر الحذف المرفق بكل سؤال، أو مسح بيانات الموقع من إعدادات المتصفح.</p>
  `);
}

function viewTerms() {
  return pageShell("شروط الاستخدام", "doc", `
    <h2>قبول الشروط</h2>
    <p>باستخدامك دليل صوران الطبي فإنك توافق على هذه الشروط. إن لم توافق عليها فالرجاء التوقف عن استخدام الموقع.</p>
    <h2>طبيعة الخدمة</h2>
    <p>الدليل منصة معلوماتية توجيهية تعرض بيانات جهات طبية في مدينة صوران. نحن وسيط معلوماتي فقط ولا نقدّم خدمة طبية ولا نضمن نتائج التعامل مع الجهات المدرجة.</p>
    <h2>استخدامات مقبولة</h2>
    <ul>
      <li>يُمنع استخدام الدليل لأي غرض مخالف للقانون أو للإضرار بالجهات المدرجة.</li>
      <li>يُمنع محاولة تعطيل الموقع أو استخراج البيانات بشكل آلي لإعادة نشرها دون إذن.</li>
      <li>أرقام الجهات للاستخدام الشخصي — يُرجى عدم الإزعاج الهاتفي للجهات.</li>
    </ul>
    <h2>حدود المسؤولية</h2>
    <p>نبذل جهدنا معقولاً لدقة البيانات وتحديثها، لكن لا نضمن خلوّها من الأخطاء أو التغييرات المفاجئة (إجازات، تغيير أرقام). لا يتحمل الدليل أي مسؤولية عن أضرار ناتجة عن الاعتماد على المعلومات المنشورة.</p>
    <h2>الملكية الفكرية</h2>
    <p>اسم الدليل وشعاره وتنظيم محتواه ملك لفريق المشروع. بيانات الجهات ملك أصحابها وتُنشر بموافقتهم.</p>
    <h2>تعديل الشروط</h2>
    <p>قد نحدّث هذه الشروط عند الحاجة، ويُعد نشرها على هذه الصفحة إشعاراً كافياً بالتغيير.</p>
  `);
}

function viewDisclaimer() {
  return pageShell("إخلاء المسؤولية الطبية", "alert", `
    <div class="note-box">${icon("alert")}<p><strong>المعلومات في هذا الموقع توعوية عامة وليست استشارة طبية.</strong></p></div>
    <h2>المحتوى التوعوي</h2>
    <p>الإجابات والإرشادات المنشورة في «اسأل طبياً» وبقية الصفحات مُعدّة بلغة مبسطة لأغراض التثقيف الصحي العام، وهي لا تشكّل تشخيصاً ولا خطة علاج ولا بديلاً عن الفحص السريري المباشر.</p>
    <h2>لا تعتمد عليها في الحالات الحرجة</h2>
    <ul>
      <li>عند ألم صدر شديد، ضيق تنفس مفاجئ، فقدان وعي، نزيف غزير، أو إصابة رضحية — اتصل بالإسعاف فوراً وتوجه لأقرب مشفى.</li>
      <li>لا تبدأ أو توقف أي دواء بناءً على ما تقرأه هنا دون استشارة طبيبك.</li>
    </ul>
    <h2>الأطفال والحوامل</h2>
    <p>أي حالة تخص رضيعاً أو طفلاً أو حاملاً أو مرضعاً تتطلب استشارة مباشرة مع الطبيب المختص قبل أي إجراء.</p>
    <h2>المصادر</h2>
    <p>تُصاغ الإرشادات استناداً إلى مبادئ عامة شائعة في ممارسات الطب الأولي، مع تبسيطها لغير المختصين. في حال الخلاف بين ما تقرأه هنا وما يقوله طبيبك — كلام طبيبك هو المرجع.</p>
  `);
}

function viewContentPolicy() {
  return pageShell("سياسة المحتوى الطبي", "shieldPlus", `
    <h2>مبدأنا</h2>
    <p>المحتوى الصحي في دليل صوران الطبي يخضع لمعايير تحرير واضحة لضمان ألا يصل لأهالي المدينة أي معلومة مضللة أو إعلانية مضلِّبة.</p>
    <h2>معايير نشر الإرشادات</h2>
    <ul>
      <li><strong>علمية ومبسطة:</strong> معلومات مستندة إلى مبادئ طب أولي متعارف عليها، بصيغة يفهمها غير المختص.</li>
      <li><strong>محايدة:</strong> لا ننشر إرشادات تروّج لدواء أو منتج أو عيادة بعينها مقابل مقابل مادي.</li>
      <li><strong>متواضعة في الادعاء:</strong> نتجنب العبارات الحاسمة فيما لا يحتمل اليقين، ونحيل على الطبيب دائماً.</li>
      <li><strong>واضحة الحدود:</strong> كل صفحة إرشادية تذكّر القارئ بأن المحتوى لا يغني عن الاستشارة.</li>
    </ul>
    <h2>بيانات الجهات</h2>
    <ul>
      <li>تُنشر بيانات الجهة فقط بعد تأكيدها مع صاحبها أو مصدر موثوق.</li>
      <li>شارة «مميز» تعبّر عن باقة ظهور مدفوعة أو تفاعل مجتمعي موثق — ولا تعني توصية طبية.</li>
      <li>أي جهة تُثبت معلومات مضللة عن مؤهلاتها تُوقف بياناتها حتى التحقق.</li>
    </ul>
    <h2>الإبلاغ عن محتوى</h2>
    <p>رصدتَ معلومة خاطئة أو إرشاداً مثيراً للشك؟ أبلغنا عبر <a href="#/about">صفحة عن المنصة</a> وسيُراجع المحتوى خلال يومي عمل.</p>
  `);
}

function pageShell(title, ic, body) {
  return `
  <section class="page-hero">
    <div class="container">
      <nav class="breadcrumb"><a href="#/">الرئيسية</a> ${icon("chevLeft")} <span>${title}</span></nav>
      <h1>${icon(ic)} ${title}</h1>
      <p>آخر تحديث: ${new Date().toLocaleDateString("ar-SY", { year: "numeric", month: "long", day: "numeric" })}</p>
    </div>
  </section>
  <div class="container page-wrap"><div class="prose">${body}</div></div>`;
}

/* ================= تكامل Supabase (اختياري مع fallback محلي) ================= */
function supabaseHeaders() {
  const cfg = window.SUPABASE_CONFIG;
  if (!cfg || !cfg.url || !cfg.anonKey) return null;
  return { apikey: cfg.anonKey, Authorization: "Bearer " + cfg.anonKey };
}

/* تحميل الجهات والمناوبة والأسئلة والإعلانات من Supabase — عند الفشل تبقى بيانات data.js */
async function loadRemoteData() {
  const H = supabaseHeaders();
  if (!H) return false;
  const get = (path) =>
    fetch(window.SUPABASE_CONFIG.url + path, { headers: H })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);

  const [ent, onc, faq, ads] = await Promise.all([
    get("/rest/v1/entities?select=*&order=sort_order.asc,id.asc"),
    get("/rest/v1/oncall?select=*"),
    get("/rest/v1/faq?select=*&order=sort_order.asc,id.asc"),
    get("/rest/v1/ads?select=*&active=eq.true&order=sort_order.asc,created_at.asc"),
  ]);

  let used = false;
  if (Array.isArray(ent) && ent.length) {
    ENTITIES.length = 0;
    ENTITIES.push(...ent.map((e) => ({
      ...e,
      services: Array.isArray(e.services) ? e.services : [],
    })));
    used = true;
  }
  if (Array.isArray(onc)) {
    const next = {};
    DAYS.forEach((d) => (next[d] = []));
    onc.forEach((r) => { if (next[r.day]) next[r.day].push(r.pharmacy_id); });
    Object.keys(ONCALL).forEach((k) => delete ONCALL[k]);
    Object.assign(ONCALL, next);
  }
  if (Array.isArray(faq) && faq.length) {
    FAQ.length = 0;
    FAQ.push(...faq);
    used = true;
  }
  if (Array.isArray(ads)) {
    ADS.length = 0;
    ADS.push(...ads);
  }
  return used;
}

/* شريط الإعلانات — يُستخدم في الرئيسية وصفحات التفاصيل */
function adBanner(a) {
  return `
  <a class="ad-banner" href="${esc(a.link_url || "#")}" ${a.link_url ? 'target="_blank" rel="noopener"' : ""}>
    ${a.image_url ? `<img src="${esc(a.image_url)}" alt="" loading="lazy" />` : ""}
    <span class="ad-body">
      <span class="ad-tag">${icon("sparkles")} إعلان</span>
      <b>${esc(a.title)}</b>
      ${a.body ? `<small>${esc(a.body)}</small>` : ""}
    </span>
    ${a.link_url ? `<span class="ad-go">${icon("arrowLeft")}</span>` : ""}
  </a>`;
}
function adsStrip(placement) {
  const list = (window.ADS || ADS).filter((a) => a.placement === placement || a.placement === "all");
  return list.length ? `<div class="ads-strip">${list.map(adBanner).join("")}</div>` : "";
}

/* إدخال سجل (سؤال/رسالة) في Supabase — أفضل جهد، يعود false عند الفشل */
async function supabaseInsert(table, payload) {
  const H = supabaseHeaders();
  if (!H) return false;
  try {
    const r = await fetch(window.SUPABASE_CONFIG.url + "/rest/v1/" + table, {
      method: "POST",
      headers: { ...H, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(payload),
    });
    return r.ok;
  } catch (_) {
    return false;
  }
}

/* ================= لوحة التحكم (جلسة الجهة/الإدارة) ================= */
function getSession() {
  try { return JSON.parse(sessionStorage.getItem("ds-session") || "null"); } catch (_) { return null; }
}

async function dashApi(path, method = "GET", body = null) {
  const H = supabaseHeaders();
  let s = getSession();
  if (!s || !H) return null;
  const cfg = window.SUPABASE_CONFIG;
  const call = (tok) => fetch(cfg.url + path, {
    method,
    headers: { ...H, Authorization: "Bearer " + tok, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  try {
    let r = await call(s.access_token);
    /* انتهت صلاحية الجلسة — تجديد صامت عبر refresh_token ثم إعادة المحاولة مرة */
    if (r.status === 401 && s.refresh_token) {
      const rr = await fetch(cfg.url + "/auth/v1/token?grant_type=refresh_token", {
        method: "POST",
        headers: { apikey: cfg.anonKey, "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: s.refresh_token }),
      });
      if (rr.ok) {
        const ns = await rr.json();
        s = { ...s, access_token: ns.access_token, refresh_token: ns.refresh_token, expires_at: ns.expires_at };
        try { sessionStorage.setItem("ds-session", JSON.stringify(s)); } catch (_) {}
        r = await call(s.access_token);
      }
    }
    if (r.status === 401 || r.status === 403) {
      sessionStorage.removeItem("ds-session");
      showToast("انتهت الجلسة — سجّل الدخول مجدداً", "warn");
      location.hash = "#/login";
      return null;
    }
    if (r.status === 204) return true;
    const txt = await r.text();
    if (!r.ok) return null;
    return txt ? JSON.parse(txt) : true;
  } catch (_) {
    return null;
  }
}

/* ---------- لوحة الجهة (داخل الموقع) — كل جهة تدير ملفها فقط ---------- */
function viewDashboard() {
  const s = getSession();
  if (!s) return viewLogin();
  /* مدير النظام — لوحته المستقلة خارج موقع الزوار */
  if (s.role === "admin") {
    return `
    <section class="container page-wrap">
      <div class="login-wrap">
        <div class="login-card" style="text-align:center">
          <span class="l-icon">${icon("shieldCheck")}</span>
          <h1>أنت مدير النظام</h1>
          <p>اللوحة الشاملة (الجهات، الإعلانات، الأسئلة، الرسائل، حسابات الجهات) في رابط مستقل لا يُعرض داخل موقع الزوار.</p>
          <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:16px">
            <a class="btn btn-primary" href="/admin.html" target="_blank" rel="noopener">${icon("key")} فتح لوحة إدارة النظام</a>
            <button class="btn btn-ghost" type="button" id="dashLogout">${icon("x")} خروج</button>
          </div>
        </div>
      </div>
    </section>`;
  }
  return `
  <div class="container page-wrap dash-page">
    <div class="card dash-head">
      <span class="dash-av">${icon("user")}</span>
      <div class="dash-head-info">
        <h1>لوحة الجهة</h1>
        <p dir="ltr">${esc(s.email || "")}</p>
      </div>
      <div class="dash-head-actions">
        <button class="btn btn-outline btn-sm" id="dashLogout" type="button">${icon("x")} خروج</button>
        <a class="btn btn-primary btn-sm" href="#/">${icon("home")} عرض الموقع</a>
      </div>
    </div>
    <div id="entityPanel"><p class="s-hint">جارٍ التحميل…</p></div>
  </div>`;
}

const entPanelErr = (msg) => `
  <div class="empty-state">${icon("alert")}<h3>${esc(msg)}</h3><p>سجّل الدخول من جديد أو تواصل مع إدارة المنصة.</p></div>`;

async function bindDashboard() {
  const s = getSession();
  if (!s) return;
  const out = $("#dashLogout");
  if (out) out.addEventListener("click", () => {
    sessionStorage.removeItem("ds-session");
    showToast("تم تسجيل الخروج");
    location.hash = "#/login";
  });

  const panel = $("#entityPanel");
  if (!panel) return;

  /* مدير النظام: لا شيء لإدارته هنا */
  if (s.role === "admin") return;

  /* جلب ربط الجهة بحسابها */
  const accs = await dashApi("/rest/v1/entity_accounts?select=entity_id");
  if (!Array.isArray(accs)) { panel.innerHTML = entPanelErr("تعذر التحقق من حسابك"); return; }
  if (!accs.length) {
    const wa = waHref(SITE.developer.phone, "مرحباً، حساب جهتي غير مرتبط بصفحتي في دليل صوران — بريدي: " + (s.email || ""));
    panel.innerHTML = `
    <div class="empty-state">
      ${icon("info")}<h3>حسابك غير مرتبط بجهة بعد</h3>
      <p>ترتبط الحسابات بالجهات من قبل إدارة المنصة عند تفعيل الاشتراك.</p>
      <a class="btn btn-primary" style="margin-top:12px" href="${wa}" target="_blank" rel="noopener">${icon("chat")} تواصل مع الإدارة لربط حسابك</a>
    </div>`;
    return;
  }
  const eid = accs[0].entity_id;
  const rows = await dashApi("/rest/v1/entities?id=eq." + encodeURIComponent(eid));
  const e = Array.isArray(rows) ? rows[0] : null;
  if (!e) { panel.innerHTML = entPanelErr("تعذر جلب بيانات جهتك"); return; }

  let days = [];
  if (e.type === "pharmacy") {
    const oc = await dashApi("/rest/v1/oncall?pharmacy_id=eq." + encodeURIComponent(eid) + "&select=day");
    if (Array.isArray(oc)) days = oc.map((r) => r.day);
  }

  panel.innerHTML = `
  <div class="note-box" style="margin-bottom:14px">${icon("info")}<p>هذه لوحة جهتك — عدّل بيانات صفحتك وتظهر في الموقع فور الحفظ. حقول التمييز والإدارة يديرها فريق المنصة.</p></div>
  <div class="card">
    <h3 style="margin-bottom:14px">${icon("doc")} ملف: ${esc(e.name)}</h3>
    <form id="ownForm" class="ef-grid" novalidate>
      <label>الاسم
        <input id="owName" value="${esc(e.name || "")}" required />
      </label>
      <label>${e.type === "doctor" ? "التخصص" : "الوصف المختصر"}
        <input id="owSpec" value="${esc(e.spec || "")}" />
      </label>
      ${e.type === "doctor" ? `
      <label>الصفة / الدرجة<input id="owDegree" value="${esc(e.degree || "")}" /></label>
      <label>سنوات الخبرة<input id="owExp" type="number" min="0" value="${e.exp ?? ""}" /></label>` : ""}
      <label>المنطقة<input id="owArea" value="${esc(e.area || "")}" /></label>
      <label>العنوان<input id="owAddress" value="${esc(e.address || "")}" /></label>
      <label>الهاتف<input id="owPhone" dir="ltr" value="${esc(e.phone || "")}" /></label>
      <label>أوقات العمل<input id="owHours" value="${esc(e.hours || "")}" /></label>
      <div class="ef-full ef-checks">
        <label><input type="checkbox" id="owWa" ${e.whatsapp ? "checked" : ""}/> متاحون على واتساب</label>
      </div>
      <label class="ef-full">الخدمات (افصل بفاصلة)<input id="owServices" value="${esc((e.services || []).join("، "))}" /></label>
      <label class="ef-full">نبذة عنك / عن جهتك<textarea id="owNote" rows="3">${esc(e.note || "")}</textarea></label>
      <label>خط العرض lat<input id="owLat" dir="ltr" value="${e.lat ?? ""}" /></label>
      <label>خط الطول lng<input id="owLng" dir="ltr" value="${e.lng ?? ""}" /></label>
      ${e.type === "pharmacy" ? `
      <div class="ef-full">
        <p class="ef-oncall-title">أيام صيدلية المناوبة</p>
        <div class="ef-days">
          ${DAYS.map((d) => `<label class="ef-day"><input type="checkbox" value="${esc(d)}" data-day ${days.includes(d) ? "checked" : ""}/> ${esc(d)}</label>`).join("")}
        </div>
      </div>` : ""}
      <div class="ef-full ef-actions">
        <button class="btn btn-primary" type="submit">${icon("check")} حفظ التعديلات</button>
      </div>
    </form>
  </div>`;

  $("#ownForm").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const name = $("#owName").value.trim();
    if (!name) return showToast("الاسم مطلوب", "err");
    const num = (sel) => ($(sel).value.trim() === "" ? null : Number($(sel).value));
    const payload = {
      name,
      spec: $("#owSpec").value.trim() || null,
      area: $("#owArea").value.trim() || null,
      address: $("#owAddress").value.trim() || null,
      phone: $("#owPhone").value.trim() || null,
      whatsapp: $("#owWa").checked,
      hours: $("#owHours").value.trim() || null,
      services: $("#owServices").value.split(/[,،]/).map((x) => x.trim()).filter(Boolean),
      note: $("#owNote").value.trim() || null,
      lat: num("#owLat"),
      lng: num("#owLng"),
    };
    if (e.type === "doctor") {
      payload.degree = $("#owDegree").value.trim() || null;
      payload.exp = num("#owExp");
    }
    const ok = await dashApi("/rest/v1/entities?id=eq." + encodeURIComponent(eid), "PATCH", payload);
    if (ok === null) return showToast("تعذر الحفظ — أعد تسجيل الدخول", "err");
    if (e.type === "pharmacy") {
      const ds = $$("#ownForm [data-day]:checked").map((c) => c.value);
      await dashApi("/rest/v1/oncall?pharmacy_id=eq." + encodeURIComponent(eid), "DELETE");
      if (ds.length) await dashApi("/rest/v1/oncall", "POST", ds.map((d) => ({ day: d, pharmacy_id: eid })));
    }
    showToast("تم حفظ تعديلاتك — ظاهرة في الموقع الآن", "ok");
    loadRemoteData();
  });
}

/* ربط نموذج الدخول — يُستخدم في صفحة الدخول ولوحة التحكم عند انتهاء الجلسة */
function bindLoginForm() {
  const f = $("#loginForm");
  if (!f) return;
  f.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const user = $("#lgUser").value.trim();
    const pass = $("#lgPass").value;
    const errEl = $("#loginError");
    if (errEl) errEl.hidden = true;
    if (!user || !pass) return showToast("أدخل البريد وكلمة السر", "warn");
    const cfg = window.SUPABASE_CONFIG;
    if (!cfg || !cfg.url || !cfg.anonKey) return showToast("نظام الدخول غير مهيأ بعد", "warn");
    try {
      const r = await fetch(cfg.url + "/auth/v1/token?grant_type=password", {
        method: "POST",
        headers: { apikey: cfg.anonKey, "Content-Type": "application/json" },
        body: JSON.stringify({ email: user, password: pass }),
      });
      if (r.ok) {
        const s = await r.json();
        try {
          sessionStorage.setItem("ds-session", JSON.stringify({
            access_token: s.access_token,
            refresh_token: s.refresh_token,
            expires_at: s.expires_at,
            email: (s.user && s.user.email) || user,
            role: (s.user && s.user.user_metadata && s.user.user_metadata.role) || "entity",
          }));
        } catch (_) {}
        showToast("تم تسجيل الدخول بنجاح — مرحباً بك");
        location.hash = "#/dashboard";
      } else {
        if (errEl) errEl.hidden = false;
        showToast("بيانات الدخول غير صحيحة أو الحساب غير مُنشأ بعد", "err");
      }
    } catch (_) {
      showToast("تعذّر الاتصال بخدمة الدخول", "warn");
    }
  });
}

/* زر «دخول الجهة / لوحة التحكم» في الترويسة حسب الجلسة */
function updateEntityBtn() {
  const btn = $("#entityBtn");
  if (!btn) return;
  const label = btn.querySelector("span");
  if (getSession()) {
    btn.setAttribute("href", "#/dashboard");
    if (label) label.textContent = "لوحة الجهة";
  } else {
    btn.setAttribute("href", "#/login");
    if (label) label.textContent = "دخول الجهة";
  }
}

/* ================= التوجيه ================= */
const ROUTES = [
  { re: /^\/$/, key: "home", title: "الرئيسية", view: () => viewHome(), after: afterHome },
  { re: /^\/doctors$/, key: "doctors", title: "الأطباء", view: (q) => viewList("doctor", q), after: () => bindList("doctor") },
  { re: /^\/pharmacies$/, key: "pharmacies", title: "الصيدليات", view: (q) => viewList("pharmacy", q), after: () => bindList("pharmacy") },
  { re: /^\/oncall$/, key: "oncall", title: "الصيدليات المناوبة", view: viewOncall, after: bindOncall },
  { re: /^\/hospitals$/, key: "hospitals", title: "المشافي", view: (q) => viewList("hospital", q), after: () => bindList("hospital") },
  { re: /^\/labs$/, key: "labs", title: "المخابر", view: (q) => viewList("lab", q), after: () => bindList("lab") },
  { re: /^\/radiology$/, key: "radiology", title: "مراكز الأشعة", view: (q) => viewList("radiology", q), after: () => bindList("radiology") },
  { re: /^\/health-centers$/, key: "health-centers", title: "المراكز الصحية", view: (q) => viewList("health-center", q), after: () => bindList("health-center") },
  { re: /^\/entity\/([A-Za-z0-9-]+)$/, key: "", title: "تفاصيل الجهة", view: (q, m) => viewEntity(m[1]), after: (q, m) => afterEntity(m[1]) },
  { re: /^\/ask$/, key: "ask", title: "اسأل طبياً", view: viewAsk, after: bindAsk },
  { re: /^\/search$/, key: "", title: "البحث", view: viewSearch, after: () => bindSearch() },
  { re: /^\/about$/, key: "about", title: "عن المنصة", view: viewAbout },
  { re: /^\/packages$/, key: "", title: "باقات الاشتراك", view: viewPackages },
  { re: /^\/dashboard$/, key: "dashboard", title: "لوحة الجهة", view: viewDashboard, after: () => { getSession() ? bindDashboard() : bindLoginForm(); } },
  { re: /^\/login$/, key: "login", title: "دخول الجهة", view: viewLogin, after: () => bindLoginForm() },
  { re: /^\/privacy$/, key: "", title: "سياسة الخصوصية", view: viewPrivacy },
  { re: /^\/terms$/, key: "", title: "شروط الاستخدام", view: viewTerms },
  { re: /^\/disclaimer$/, key: "", title: "إخلاء المسؤولية الطبية", view: viewDisclaimer },
  { re: /^\/content-policy$/, key: "", title: "سياسة المحتوى الطبي", view: viewContentPolicy },
];

function parseHash() {
  const raw = location.hash.replace(/^#/, "") || "/";
  const [path, query] = raw.split("?");
  return { path: path || "/", q: new URLSearchParams(query || "") };
}

function navKeyFor(path) {
  const direct = ROUTES.find((r) => "/" + r.key === path && r.key);
  if (direct) return direct.key;
  const em = path.match(/^\/entity\/([A-Za-z0-9-]+)$/);
  if (em) {
    const e = entityById(em[1]);
    if (e) return routeSlug(e.type);
  }
  return "";
}

let lastRendered = "";
function render() {
  const { path, q } = parseHash();
  destroyMap();
  const route = ROUTES.find((r) => r.re.test(path));
  const view = $("#view");
  closeMenu();

  if (!route) {
    view.innerHTML = view404();
    document.title = "الصفحة غير موجودة — دليل صوران الطبي";
    window.scrollTo({ top: 0 });
    setActiveNav("");
    return;
  }

  const m = path.match(route.re);
  view.innerHTML = route.view(q, m || []);
  document.title = `${route.title} — ${SITE.name}`;
  setActiveNav(route.key || navKeyFor(path));
  updateEntityBtn();
  window.scrollTo({ top: 0 });
  if (route.after) route.after(q, m || []);
  lastRendered = path;
}

function setActiveNav(key) {
  $$(".mainnav > a").forEach((a) =>
    a.classList.toggle("active", a.getAttribute("data-route") === key));
  $$(".bottom-nav a").forEach((a) =>
    a.classList.toggle("active", a.getAttribute("data-route") === key));
}

/* ================= الترويسة: قائمة، ثيم، بحث، إشعارات ================= */
function closeMenu() {
  const nav = $("#mainNav");
  const btn = $("#btnMenu");
  if (nav) nav.classList.remove("open");
  if (btn) btn.setAttribute("aria-expanded", "false");
}

function initHeader() {
  const btnMenu = $("#btnMenu");
  btnMenu.addEventListener("click", () => {
    const open = $("#mainNav").classList.toggle("open");
    btnMenu.setAttribute("aria-expanded", String(open));
  });
  $("#mainNav").addEventListener("click", (ev) => {
    if (ev.target.closest("a")) closeMenu();
  });

  /* اختصار لوحة المفاتيح: فتح صفحة البحث */
  document.addEventListener("keydown", (ev) => {
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "k") {
      ev.preventDefault();
      location.hash = "#/search";
    }
  });
}

/* ================= الإقلاع ================= */
(async function boot() {
  const year = $("#year");
  if (year) year.textContent = fmtNum(new Date().getFullYear());

  initHeader();
  window.addEventListener("hashchange", render);
  if (!location.hash) location.replace("#/");

  /* جلب البيانات الحية من Supabase — عند الفشل تُستخدم بيانات data.js */
  try { await loadRemoteData(); } catch (_) {}
  render();
})();
