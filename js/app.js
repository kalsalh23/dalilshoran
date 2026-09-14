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
const telHref = (p) => "tel:+963" + String(p).replace(/^0/, "");
const waHref = (p) => "https://wa.me/963" + String(p).replace(/^0/, "");

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
};
const icon = (n, cls = "") =>
  `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ICONS.info}</svg>`;

/* ================= الحالة العامة ================= */
const state = {
  map: null,
  oncallDay: todayIdx(),
  askCat: "الكل",
  askQuery: "",
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

function entityCard(e, { rank = false, callLabel = "اتصال" } = {}) {
  const t = TYPES[e.type];
  const avatar = e.type === "doctor"
    ? `<span class="entity-avatar" style="--tc:${t.color}">${esc(initials(e.name))}</span>`
    : `<span class="entity-avatar" style="--tc:${t.color}">${icon(t.icon)}</span>`;

  const badges = [];
  if (e.type === "pharmacy" && e.shift24) badges.push(`<span class="badge badge-open">${icon("clock")} 24 ساعة</span>`);
  if (e.type === "pharmacy" && isOnCallToday(e.id)) badges.push(`<span class="badge badge-amber">${icon("star")} مناوبة اليوم</span>`);
  if (e.type === "hospital" && /24/.test(e.hours || "")) badges.push(`<span class="badge badge-rose">${icon("activity")} طوارئ 24</span>`);

  const meta = [];
  meta.push(`<span>${icon("pin")} <b>${esc(e.area)}</b></span>`);
  if (e.type === "doctor") meta.push(`<span>${icon("briefcase")} خبرة ${fmtNum(e.exp)} سنة</span>`);
  if (e.owner) meta.push(`<span>${icon("user")} ${esc(e.owner)}</span>`);
  meta.push(`<span>${icon("clock")} ${esc(e.hours)}</span>`);

  const services = (e.services || []).slice(0, 3).map((s) => `<span class="mini-tag">${esc(s)}</span>`).join("");
  const extra = (e.services || []).length > 3 ? `<span class="mini-tag">+${fmtNum((e.services || []).length - 3)}</span>` : "";

  return `
  <article class="entity-card" style="--tc:${t.color}">
    ${rank && e.featured && e.rank ? `<span class="rank-ribbon">${fmtNum(e.rank)}</span>` : ""}
    <div class="entity-top">
      ${avatar}
      <div class="entity-id">
        <h3><a href="#/entity/${e.id}">${esc(e.name)}</a></h3>
        ${e.spec ? `<span class="spec">${esc(e.spec)} — ${esc(e.degree || "")}</span>` : `<span class="spec">${esc(t.label)}</span>`}
      </div>
    </div>
    ${badges.length ? `<div class="entity-badges">${badges.join("")}</div>` : ""}
    <div class="entity-meta">${meta.join("")}</div>
    ${services ? `<div class="entity-services">${services}${extra}</div>` : ""}
    <div class="entity-actions">
      <a class="btn btn-primary btn-sm" href="#/entity/${e.id}">${icon("doc")} التفاصيل</a>
      <a class="btn btn-ghost btn-sm" href="${telHref(e.phone)}">${icon("phone")} ${callLabel}</a>
      ${e.whatsapp ? `<a class="icon-call" href="${waHref(e.phone)}" target="_blank" rel="noopener" title="واتساب" aria-label="واتساب">${icon("chat")}</a>` : ""}
      <button class="icon-call" type="button" data-copy="${esc(e.phone)}" title="نسخ الرقم" aria-label="نسخ الرقم">${icon("copy")}</button>
    </div>
  </article>`;
}

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
  const doctors = entitiesByType("doctor").length;
  const pharmacies = entitiesByType("pharmacy").length;
  const centers = ENTITIES.filter((e) => ["hospital", "lab", "radiology", "health-center"].includes(e.type)).length;
  const todayName = DAYS[todayIdx()];
  const oncallToday = oncallPharmacies(todayName);

  const oncallMini = oncallToday.length
    ? oncallToday.map((p) => `
        <div class="oncall-mini-item">
          ${icon("pill")} <strong>${esc(p.name)}</strong>
          <span>${fmtPhone(p.phone)}</span>
        </div>`).join("")
    : `<p class="oncall-empty">لا توجد مناوبة مسجلة اليوم — راجع جدول الأسبوع.</p>`;

  const services = [
    { key: "doctor", href: "#/doctors", desc: "اختيار التخصص والاتصال" },
    { key: "pharmacy", href: "#/pharmacies", desc: "أقرب صيدلية إليك" },
    { key: "oncall", href: "#/oncall", desc: "جدول اليوم والليلة", label: "صيدليات مناوبة", color: "#E5484D", icon: "ambulance" },
    { key: "hospital", href: "#/hospitals", desc: "طوارئ واستقبال" },
    { key: "lab", href: "#/labs", desc: "تحاليل وفحوصات" },
    { key: "radiology", href: "#/radiology", desc: "أشعة وسونار" },
    { key: "health-center", href: "#/health-centers", desc: "تطعيمات ورعاية أولية" },
  ].map((s) => {
    if (s.key === "oncall") {
      return `<a class="service-tile" style="--tc:${s.color}" href="${s.href}">
        <span class="service-ic">${icon(s.icon)}</span><b>${s.label}</b><small>${s.desc}</small>
        <span class="service-count">${fmtNum(7)} أيام</span></a>`;
    }
    const t = TYPES[s.key];
    const count = entitiesByType(s.key).length;
    return `<a class="service-tile" style="--tc:${t.color}" href="${s.href}">
      <span class="service-ic">${icon(t.icon)}</span><b>${t.plural}</b><small>${s.desc}</small>
      <span class="service-count">${fmtNum(count)} ${count === 1 ? "جهة" : "جهات"}</span></a>`;
  }).join("");

  const featuredDoctors = featuredBy("doctor", 5).map((d) => entityCard(d, { rank: true })).join("");
  const featuredPharmacies = featuredBy("pharmacy", 5).map((p) => entityCard(p, { rank: true })).join("");

  const weekStrip = DAYS.map((d, i) => {
    const list = oncallPharmacies(d);
    return `<a class="oncall-day ${i === todayIdx() ? "today" : ""}" href="#/oncall?day=${i}">
      <b>${d}${i === todayIdx() ? " (اليوم)" : ""}</b>
      <small>${list.length ? list.map((p) => esc(p.name.replace("صيدلية ", ""))).join(" • ") : "—"}</small>
    </a>`;
  }).join("");

  const faqPreview = FAQ.slice(0, 3).map((f) => `
    <details class="acc-item">
      <summary><span class="acc-q">؟</span> ${esc(f.q)} <span class="acc-cat">${esc(f.cat)}</span>${icon("chevDown", "chev")}</summary>
      <div class="acc-body"><p>${esc(f.a)}</p></div>
    </details>`).join("");

  const legend = Object.entries(TYPES).map(([k, t]) =>
    `<span class="legend-item"><i style="--c:${t.color}"></i>${t.plural}</span>`).join("");

  return `
  <section class="hero">
    <div class="container hero-in">
      <div>
        <span class="hero-badge">${icon("pin")} الدليل الطبي الرسمي لمدينة صوران — نسخة تجريبية</span>
        <h1>صحتك في <em>صوران</em>… أقرب من أن تبحث عنها</h1>
        <p class="hero-sub">أطباء وعيادات، صيدليات ومناوبة، مشافي ومخابر ومراكز صحية — كلها في دليل واحد محلي، بأرقام صحيحة ومواقع على الخريطة.</p>
        <div class="hero-search">
          <div class="hero-search-box">
            ${icon("search")}
            <input type="search" id="heroSearch" placeholder="ابحث: تخصص، اسم طبيب، صيدلية، تحاليل…" autocomplete="off" aria-label="بحث في الدليل" />
            <a class="btn btn-amber btn-sm" href="#/doctors" id="heroSearchBtn">تصفّح</a>
          </div>
          <div class="hero-suggest" id="heroSuggest" hidden></div>
        </div>
        <div class="hero-chips">
          <a class="hero-chip is-amber" href="#/oncall">${icon("ambulance")} مناوبة اليوم</a>
          <a class="hero-chip" href="#/doctors?spec=${encodeURIComponent("أطفال")}">أطفال</a>
          <a class="hero-chip" href="#/doctors?spec=${encodeURIComponent("أسنان")}">أسنان</a>
          <a class="hero-chip" href="#/labs">تحاليل مخبرية</a>
          <a class="hero-chip" href="#/radiology">أشعة وسونار</a>
          <a class="hero-chip" href="#/ask">اسأل طبياً</a>
        </div>
      </div>
      <aside class="hero-side">
        <div class="side-card">
          <div class="side-card-head">${icon("ambulance")} صيدليات المناوبة <span class="today">${todayName}</span></div>
          <div class="oncall-mini">${oncallMini}</div>
          <div style="margin-top:12px"><a class="btn btn-ghost btn-sm btn-block" style="color:#fff;border-color:rgba(255,255,255,.3);background:rgba(255,255,255,.08)" href="#/oncall">جدول الأسبوع كاملاً</a></div>
        </div>
        <div class="side-card">
          <div class="side-card-head">${icon("alert")} أرقام الطوارئ</div>
          <div class="emergency-list">
            ${SITE.emergency.map((em) => `
              <a class="emergency-item" href="tel:${em.num}" title="${esc(em.label)}">
                ${icon(em.icon)}<b>${em.num}</b><small>${esc(em.label)}</small>
              </a>`).join("")}
          </div>
        </div>
        <div class="hero-stats">
          <div class="hero-stat"><b data-count="${doctors}">٠</b><span>طبيب وعيادة</span></div>
          <div class="hero-stat"><b data-count="${pharmacies}">٠</b><span>صيدلية</span></div>
          <div class="hero-stat"><b data-count="${centers}">٠</b><span>مشفى ومخبر ومركز</span></div>
          <div class="hero-stat"><b data-count="${FAQ.length}">٠</b><span>سؤال وإرشاد</span></div>
        </div>
      </aside>
    </div>
  </section>

  <section class="stats-band container">
    <div class="stats-card">
      ${[
        { icon: "stetho", color: "#2B4BC4", n: doctors, label: "طبيب وعيادة مسجلة" },
        { icon: "pill", color: "#D97706", n: pharmacies, label: "صيدلية داخل المدينة" },
        { icon: "hospital", color: "#E5484D", n: centers, label: "مشفى ومخبر ومركز صحي" },
        { icon: "clock", color: "#0FA981", n: 24, label: "مناوبة تغطي الساعة", suffix: "/7" },
      ].map((s) => `
        <div class="stat-cell">
          <span class="stat-ic" style="background:color-mix(in srgb, ${s.color} 12%, transparent);color:${s.color}">${icon(s.icon)}</span>
          <div><b data-count="${s.n}">٠</b><span>${s.label}</span></div>
        </div>`).join("")}
    </div>
  </section>

  <section class="section container">
    <div class="section-head">
      <div><h2>الخدمات الطبية في صوران</h2><p>اختر القسم الذي تحتاجه وتصفّح الجهات المسجلة داخل المدينة</p></div>
    </div>
    <div class="services-grid">${services}</div>
  </section>

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
      <div><h2>المناوبة خلال الأسبوع</h2><p>اضغط على أي يوم لعرض تفاصيل صيدلياته المناوبة</p></div>
      <a class="section-link" href="#/oncall">صفحة المناوبة ${icon("arrowLeft")}</a>
    </div>
    <div class="oncall-strip">${weekStrip}</div>
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

  <section class="container">
    <div class="cta-band cta-blue">
      <div>
        <h3>عندك سؤال صحي؟ اسأل أهل الاختصاص</h3>
        <p>مكتبة إرشادات طبية موثوقة باللغة العربية، وإن لم تجد إجابتك فأرسل سؤالك وسيراجعه فريق الدليل.</p>
      </div>
      <a class="btn btn-amber btn-lg" href="#/ask">${icon("chat")} اسأل الآن</a>
    </div>
  </section>

  <section class="section container">
    <div class="section-head">
      <div><h2>إرشادات وأسئلة شائعة</h2><p>معلومات توعوية عامة — لا تُغني عن استشارة الطبيب</p></div>
      <a class="section-link" href="#/ask">كل الأسئلة ${icon("arrowLeft")}</a>
    </div>
    <div class="accordion">${faqPreview}</div>
  </section>

  <section class="container" style="padding-bottom:52px">
    <div class="cta-band cta-amber">
      <div>
        <h3>هل تمارس مهنة طبية في صوران؟</h3>
        <p>سجّل عيادتك أو صيدليتك أو منشأتك مجاناً في دليل المدينة، ووصل أهالي صوران بخدماتك مباشرة.</p>
      </div>
      <a class="btn btn-ghost btn-lg" style="background:rgba(255,255,255,.92);border:0;color:#7A3E00" href="#/packages">أضف جهتك ${icon("plus")}</a>
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

  /* عدّادات متحركة */
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  $$("[data-count]").forEach((el) => {
    const target = Number(el.getAttribute("data-count")) || 0;
    if (reduce) { el.textContent = fmtNum(target); return; }
    const t0 = performance.now(), dur = 900;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      el.textContent = fmtNum(Math.round(target * eased));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });

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

  const specs = [...new Set(entitiesByType(type).map((e) => e.spec).filter(Boolean))].sort();
  const areas = [...new Set(entitiesByType(type).map((e) => e.area).filter(Boolean))].sort();

  const specSel = specs.length ? `
    <select id="fSpec" aria-label="تصفية حسب التخصص">
      <option value="">كل التخصصات</option>
      ${specs.map((s) => `<option value="${esc(s)}" ${f.spec === s ? "selected" : ""}>${esc(s)}</option>`).join("")}
    </select>` : "";

  const areaSel = areas.length ? `
    <select id="fArea" aria-label="تصفية حسب المنطقة">
      <option value="">كل المناطق</option>
      ${areas.map((a) => `<option value="${esc(a)}" ${f.area === a ? "selected" : ""}>${esc(a)}</option>`).join("")}
    </select>` : "";

  const expOpt = type === "doctor" ? `<option value="exp" ${f.sort === "exp" ? "selected" : ""}>الأعلى خبرة</option>` : "";

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
      <div class="search-field">${icon("search")}<input id="fQ" type="search" placeholder="ابحث بالاسم أو الخدمة…" value="${esc(f.q)}" /></div>
      ${specSel}${areaSel}
      <select id="fSort" aria-label="الترتيب">
        <option value="featured" ${f.sort === "featured" ? "selected" : ""}>الأولوية للمميزين</option>
        <option value="name" ${f.sort === "name" ? "selected" : ""}>الاسم أ – ي</option>
        ${expOpt}
      </select>
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

  const cards = list.length ? list.map((p) => `
    <article class="entity-card" style="--tc:${TYPES.pharmacy.color}">
      <div class="entity-top">
        <span class="entity-avatar" style="--tc:${TYPES.pharmacy.color}">${icon("pill")}</span>
        <div class="entity-id">
          <h3><a href="#/entity/${p.id}">${esc(p.name)}</a></h3>
          <span class="spec">${esc(p.area)} — ${esc(p.owner || "")}</span>
        </div>
        ${p.shift24 ? `<span class="badge badge-open" style="margin-inline-start:auto">${icon("clock")} 24 ساعة</span>` : ""}
      </div>
      <div class="entity-meta">
        <span>${icon("pin")} <b>${esc(p.address)}</b></span>
        <span>${icon("clock")} أوقات الدوام: ${esc(p.hours)}</span>
      </div>
      <div class="entity-actions">
        <a class="btn btn-primary btn-sm" href="${telHref(p.phone)}">${icon("phone")} ${fmtPhone(p.phone)}</a>
        ${p.whatsapp ? `<a class="icon-call" href="${waHref(p.phone)}" target="_blank" rel="noopener" title="واتساب">${icon("chat")}</a>` : ""}
        <button class="icon-call" type="button" data-copy="${esc(p.phone)}" title="نسخ الرقم">${icon("copy")}</button>
        <a class="btn btn-ghost btn-sm" href="#/entity/${p.id}">التفاصيل</a>
      </div>
    </article>`).join("")
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
        <div class="detail-main">
          <span class="detail-avatar" style="--tc:${t.color}">${icon(t.icon)}</span>
          <div class="detail-title">
            <h1>${esc(e.name)}</h1>
            <p class="sub">${e.spec ? esc(e.spec) + " — " : ""}${esc(e.degree || t.label)}${e.owner ? " · " + esc(e.owner) : ""}</p>
            <div class="entity-badges" style="margin-top:10px">${badges.join("")}</div>
          </div>
          <div class="detail-actions">
            <a class="btn btn-primary" href="${telHref(e.phone)}">${icon("phone")} اتصال مباشر</a>
            ${e.whatsapp ? `<a class="btn btn-ghost" href="${waHref(e.phone)}" target="_blank" rel="noopener">${icon("chat")} واتساب</a>` : ""}
            <button class="btn btn-ghost" type="button" data-copy="${esc(e.phone)}">${icon("copy")} نسخ الرقم</button>
            <button class="btn btn-ghost btn-icon" type="button" id="btnShare" title="مشاركة">${icon("share")}</button>
          </div>
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
        ${e.note ? `<div class="note-box" style="margin-top:16px">${icon("info")}<p>${esc(e.note)}</p></div>` : ""}
      </div>
    </div>
  </section>

  <div class="container page-wrap">
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

/* ================= العرض: نتائج البحث ================= */
function viewSearch(params) {
  const q = params.get("q") || "";
  const { entities, faqs } = searchAll(q);
  const total = entities.length + faqs.length;
  return `
  <section class="page-hero">
    <div class="container">
      <nav class="breadcrumb" aria-label="مسار التنقل">
        <a href="#/">الرئيسية</a> ${icon("chevLeft")} <span>نتائج البحث</span>
      </nav>
      <h1>${icon("search")} نتائج البحث عن: «${esc(q)}»</h1>
      <p>${total ? fmtNum(total) + " نتيجة مطابقة" : "لا توجد نتائج مطابقة — جرّب كلمات أعم مثل «أطفال» أو «تحاليل»."}</p>
    </div>
  </section>
  <div class="container page-wrap">
    ${entities.length ? `
      <div class="section-head"><div><h2>جهات مطابقة (${fmtNum(entities.length)})</h2></div></div>
      <div class="cards-grid" style="margin-bottom:36px">${entities.map((e) => entityCard(e)).join("")}</div>` : ""}
    ${faqs.length ? `
      <div class="section-head"><div><h2>إرشادات مطابقة (${fmtNum(faqs.length)})</h2></div></div>
      <div class="accordion">${faqs.map((f) => `
        <details class="acc-item">
          <summary><span class="acc-q">؟</span> ${esc(f.q)} <span class="acc-cat">${esc(f.cat)}</span>${icon("chevDown", "chev")}</summary>
          <div class="acc-body"><p>${esc(f.a)}</p></div>
        </details>`).join("")}</div>` : ""}
    ${!total ? `
      <div class="empty-state">${icon("search")}<h3>لم نجد ما تبحث عنه</h3>
        <p>تصفّح الأقسام من القائمة أعلاه أو <a href="#/ask">أرسل سؤالك</a> لفريق الدليل.</p></div>` : ""}
  </div>`;
}

/* ================= الصفحات الثابتة ================= */
function viewAbout() {
  return `
  <section class="page-hero">
    <div class="container">
      <nav class="breadcrumb"><a href="#/">الرئيسية</a> ${icon("chevLeft")} <span>عن المنصة</span></nav>
      <h1>${icon("heart")} عن دليل صوران الطبي</h1>
      <p>مشروع مجتمعي مجاني يهدف إلى تنظيم المعلومات الصحية في مدينة صوران وإتاحتها لكل أهالي المدينة بضغطة زر.</p>
    </div>
  </section>
  <div class="container page-wrap prose">
    <h2>لماذا هذا الدليل؟</h2>
    <p>
      في كل يوم يبحث أهالي مدينة صوران عن: أقرب عيادة أسنان، مخبر يعمل مساءً، صيدلية مناوبة للّيلة،
      أو رقم مشفى لطلب إسعاف. هذه المعلومات متفرقة بين المعارف والمنشورات، وقد تكون قديمة أو غير دقيقة.
      دليل صوران الطبي يجمعها في مكان واحد: منظّمة، محدّثة، ومجانية للجميع.
    </p>

    <h2>ماذا يقدّم الدليل؟</h2>
    <ul>
      <li><strong>قوائم محلية شاملة:</strong> أطباء وعيادات، صيدليات، مشافي، مخابر تحليلات، مراكز أشعة، ومراكز صحية.</li>
      <li><strong>صيدليات المناوبة:</strong> جدول أسبوعي يتحدّث يومياً ويعرض صيدليات المناوبة «اليوم» مباشرة في الصفحة الرئيسية.</li>
      <li><strong>خريطة صحية تفاعلية:</strong> مواقع كل الجهات على خريطة المدينة مع إمكانية الاتصال مباشرة.</li>
      <li><strong>تواصل فوري:</strong> كل جهة لها رقم اتصال وزر واتساب، ونسخ الرقم بضغطة واحدة.</li>
      <li><strong>اسأل طبياً:</strong> مكتبة إرشادات توعوية موثوقة بالعربية، وإمكانية إرسال سؤالك للفريق.</li>
    </ul>

    <h2>كيف يعمل الدليل؟</h2>
    <h3>1) نجمّع البيانات</h3>
    <p>يتم حصر الجهات الطبية في المدينة والتحقق من بياناتها (التخصص، العنوان، الهاتف، أوقات العمل) بالتواصل المباشر مع أصحابها.</p>
    <h3>2) ننظّمها ونحدّثها</h3>
    <p>تُدخل البيانات في الدليل بصيغة موحّدة، وتُراجع دورياً. صاحب الجهة يستطيع تعديل بياناته في أي وقت عبر «دخول الجهات».</p>
    <h3>3) تبقى مجانية للأهالي</h3>
    <p>تصفّح الدليل والاتصال بالجهات مجاني تماماً ولا يتطلب تسجيلاً. تموّل باقات الاشتراك الاختيارية للجهات تكاليف التشغيل فقط.</p>

    <div class="note-box">
      ${icon("info")}
      <p><strong>دقة البيانات:</strong> نبذل جهداً لتحديث المعلومات باستمرار، لكن قد تحدث تغييرات (إجازة، انتقال، تغيير رقم). ننصح دائماً بالاتصال قبل التوجه، ونرحّب بتنبيهاتكم عبر <a href="#/contact">صفحة التواصل</a>.</p>
    </div>

    <h2>من وراء المشروع؟</h2>
    <p>
      فريق متطوع من أبناء مدينة صوران يعتني بجمع البيانات وتحديثها والرد على الأسئلة الواردة عبر صفحة «اسأل طبياً»،
      بالتنسيق مع أصحاب الجهات الطبية في المدينة.
    </p>
  </div>`;
}

function viewPackages() {
  return `
  <section class="page-hero">
    <div class="container">
      <nav class="breadcrumb"><a href="#/">الرئيسية</a> ${icon("chevLeft")} <span>باقات الاشتراك</span></nav>
      <h1>${icon("star")} باقات الجهات الطبية</h1>
      <p>تصفّح الدليل مجاني دائماً للأهالي. أما باقات الاشتراك فهي للجهات الطبية الراغبة بتعزيز ظهورها ودعم استمرار المشروع.</p>
    </div>
  </section>
  <div class="container page-wrap">
    <div class="packages-grid">
      ${PACKAGES.map((p) => `
        <article class="package-card ${p.featured ? "is-featured" : ""}" style="--pc:${p.color}">
          ${p.featured ? `<span class="package-flag">الأكثر اختياراً</span>` : ""}
          <h3>${esc(p.name)}</h3>
          <p class="pkg-sub">${p.id === "free" ? "لكل جهة طبية في المدينة" : p.id === "plus" ? "للعيادات والصيدليات" : "للمشافي والمخابر والمنشآت"}</p>
          <div class="pkg-price"><b>${esc(p.price)}</b><span>${esc(p.period)}</span></div>
          <ul class="pkg-features">
            ${p.features.map((f) => `<li>${icon("check")} ${esc(f)}</li>`).join("")}
          </ul>
          <a class="btn ${p.featured ? "btn-primary" : "btn-ghost"} btn-block" href="#/contact">${esc(p.cta)}</a>
        </article>`).join("")}
    </div>
    <div class="note-box" style="margin-top:26px">
      ${icon("info")}
      <p>الاشتراك اختياري ولا يؤثر على صحة أو ترتيب بيانات الجهات غير المشتركة داخل القوائم. للتفاصيل والأسعار <a href="#/contact">تواصل معنا</a>.</p>
    </div>
  </div>`;
}

function viewLogin() {
  return `
  <section class="container page-wrap">
    <div class="login-wrap">
      <div class="login-card">
        <div class="login-head">
          <span class="l-icon">${icon("lock")}</span>
          <h1>دخول الجهات</h1>
          <p>مساحة خاصة لأصحاب العيادات والصيدليات والمنشآت لتحديث بياناتهم في الدليل.</p>
        </div>
        <form id="loginForm" class="form-grid" novalidate>
          <div class="field">
            <label for="lgUser">البريد الإلكتروني أو اسم المستخدم</label>
            <input id="lgUser" type="text" placeholder="you@example.com" autocomplete="username" />
          </div>
          <div class="field">
            <label for="lgPass">كلمة المرور</label>
            <input id="lgPass" type="password" placeholder="••••••••" autocomplete="current-password" />
          </div>
          <button class="btn btn-primary btn-block" type="submit">${icon("lock")} تسجيل الدخول</button>
        </form>
        <div class="note-box" style="margin-top:18px">
          ${icon("info")}
          <p style="font-size:13.5px">نظام الحسابات قيد التفعيل في النسخة التجريبية. لتعديل بيانات جهتك الآن، راسلنا مباشرة عبر <a href="#/contact">صفحة التواصل</a>.</p>
        </div>
      </div>
    </div>
  </section>`;
}

function viewContact() {
  return `
  <section class="page-hero">
    <div class="container">
      <nav class="breadcrumb"><a href="#/">الرئيسية</a> ${icon("chevLeft")} <span>تواصل معنا</span></nav>
      <h1>${icon("mail")} تواصل معنا</h1>
      <p>ملاحظة على بيانات جهة؟ طلب إضافة؟ استفسار عن الاشتراك؟ فريق الدليل يرحّب برسائلك.</p>
    </div>
  </section>
  <div class="container page-wrap">
    <div class="ask-layout">
      <div class="form-card">
        <h3>أرسل رسالتك</h3>
        <p>نجيب عادة خلال يوم عمل واحد. للحالات الطارئة لا تستخدم هذا النموذج — اتصل بالإسعاف.</p>
        <form id="contactForm" class="form-grid" novalidate>
          <div class="field">
            <label for="ctName">الاسم</label>
            <input id="ctName" type="text" placeholder="اسمك الكريم" required />
          </div>
          <div class="field">
            <label for="ctPhone">رقم الهاتف أو البريد</label>
            <input id="ctPhone" type="text" placeholder="كيف نصل إليك؟" required />
          </div>
          <div class="field">
            <label for="ctTopic">الموضوع</label>
            <select id="ctTopic">
              <option>تصحيح بيانات جهة</option>
              <option>إضافة جهة جديدة</option>
              <option>استفسار عن الباقات</option>
              <option>ملاحظة عامة</option>
            </select>
          </div>
          <div class="field">
            <label for="ctText">الرسالة</label>
            <textarea id="ctText" placeholder="اكتب رسالتك هنا…" required></textarea>
          </div>
          <button class="btn btn-primary btn-block" type="submit">${icon("send")} إرسال</button>
        </form>
      </div>
      <aside>
        <div class="info-box" style="--tc:var(--brand-600)">${icon("phone")}
          <div><h4>هاتف الاستعلامات</h4><p dir="ltr" style="text-align:end">${fmtPhone(SITE.infoPhone)}</p><small>${esc(SITE.workingHours)}</small></div>
        </div>
        <div class="info-box" style="--tc:var(--mint-500);margin-top:12px">${icon("mail")}
          <div><h4>البريد الإلكتروني</h4><p dir="ltr" style="text-align:end">${esc(SITE.email)}</p></div>
        </div>
        <div class="info-box" style="--tc:var(--accent-600);margin-top:12px">${icon("pin")}
          <div><h4>نطاق الخدمة</h4><p>مدينة صوران وضواحيها</p><small>${esc(SITE.region)}</small></div>
        </div>
        <div class="note-box" style="margin-top:12px">
          ${icon("info")}
          <p style="font-size:13.5px">أنت صاحب جهة طبية في صوران؟ <a href="#/packages">اطّلع على باقات الظهور</a> أو أرسل بياناتك لتضاف مجاناً إلى الباقة الأساسية.</p>
        </div>
      </aside>
    </div>
  </div>`;
}

function bindContact() {
  const form = $("#contactForm");
  if (!form) return;
  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const msg = $("#ctText").value.trim();
    if (msg.length < 10) { showToast("اكتب رسالة أوضح (10 أحرف على الأقل)", "warn"); return; }
    const topic = $("#ctTopic").value;
    const name = $("#ctName").value.trim();
    const contact = $("#ctPhone").value.trim();
    let arr = [];
    try { arr = JSON.parse(localStorage.getItem("ds-messages") || "[]"); } catch (_) {}
    arr.unshift({ topic, name, contact, msg, date: new Date().toLocaleDateString("ar-SY") });
    localStorage.setItem("ds-messages", JSON.stringify(arr.slice(0, 20)));
    const sent = await supabaseInsert("messages", { topic, name, contact, body: msg });
    form.reset();
    showToast(
      sent ? "تم إرسال رسالتك — شكراً لتواصلك" : "حُفظت رسالتك محلياً (تعذّر الاتصال بالخادم)",
      sent ? "ok" : "warn",
    );
  });
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
    <p>تُنشر بيانات الجهات (الاسم، التخصص، الهاتف، العنوان، أوقات العمل) بموافقة أصحابها ولأغراض الدليل فقط. صاحب الجهة يستطيع طلب تعديل أو حذف بياناته عبر <a href="#/contact">صفحة التواصل</a>.</p>
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
    <p>رصدتَ معلومة خاطئة أو إرشاداً مثيراً للشك؟ أبلغنا عبر <a href="#/contact">صفحة التواصل</a> وسيُراجع المحتوى خلال يومي عمل.</p>
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

/* تحميل الجهات والمناوبة والأسئلة من Supabase — عند الفشل تبقى بيانات data.js */
async function loadRemoteData() {
  const H = supabaseHeaders();
  if (!H) return false;
  const get = (path) =>
    fetch(window.SUPABASE_CONFIG.url + path, { headers: H })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);

  const [ent, onc, faq] = await Promise.all([
    get("/rest/v1/entities?select=*&order=sort_order.asc,id.asc"),
    get("/rest/v1/oncall?select=*"),
    get("/rest/v1/faq?select=*&order=sort_order.asc,id.asc"),
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
  return used;
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
  { re: /^\/search$/, key: "", title: "نتائج البحث", view: viewSearch },
  { re: /^\/about$/, key: "about", title: "عن المنصة", view: viewAbout },
  { re: /^\/contact$/, key: "contact", title: "تواصل معنا", view: viewContact, after: bindContact },
  { re: /^\/packages$/, key: "", title: "باقات الاشتراك", view: viewPackages },
  { re: /^\/login$/, key: "login", title: "دخول الجهات", view: viewLogin, after: () => {
      const f = $("#loginForm");
      if (f) f.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        const user = $("#lgUser").value.trim();
        const pass = $("#lgPass").value;
        if (!user || !pass) return showToast("أدخل البريد وكلمة المرور", "warn");
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
            try { sessionStorage.setItem("ds-session", JSON.stringify({ email: s.user && s.user.email || user })); } catch (_) {}
            showToast("تم تسجيل الدخول بنجاح — مرحباً بك");
          } else {
            showToast("بيانات الدخول غير صحيحة أو الحساب غير مُنشأ بعد", "err");
          }
        } catch (_) {
          showToast("تعذّر الاتصال بخدمة الدخول", "warn");
        }
      });
    } },
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
  window.scrollTo({ top: 0 });
  if (route.after) route.after(q, m || []);
  lastRendered = path;
}

function setActiveNav(key) {
  $$(".mainnav > a").forEach((a) =>
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

  /* وضع ليلي/نهاري */
  $("#btnTheme").addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("ds-theme", next);
  });

  /* إشعار المناوبة */
  $("#btnNotif").addEventListener("click", async () => {
    if (!("Notification" in window)) return showToast("متصفحك لا يدعم الإشعارات", "warn");
    let perm = Notification.permission;
    if (perm === "default") perm = await Notification.requestPermission();
    if (perm !== "granted") return showToast("لم يُسمح بالإشعارات — فعّلها من إعدادات المتصفح", "warn");
    const today = DAYS[todayIdx()];
    const names = oncallPharmacies(today).map((p) => p.name).join("، ") || "لا توجد مناوبة مسجلة";
    try {
      new Notification("دليل صوران الطبي — مناوبة اليوم", { body: `${today}: ${names}` });
      showToast("تم تفعيل إشعارات المناوبة");
    } catch (_) {
      showToast(`${today}: ${names}`);
    }
  });

  /* البحث الشامل */
  $("#btnSearch").addEventListener("click", openSearch);
  document.addEventListener("keydown", (ev) => {
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "k") { ev.preventDefault(); openSearch(); }
    if (ev.key === "Escape") closeSearch();
  });
  $$("#searchOverlay [data-close-search]").forEach((el) => el.addEventListener("click", closeSearch));

  const gInput = $("#globalSearch");
  gInput.addEventListener("input", () => renderGlobalResults(gInput.value));
  gInput.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") {
      const first = $("#searchResults [data-go]");
      if (first) { location.hash = first.getAttribute("data-go"); closeSearch(); }
      else if (gInput.value.trim().length >= 2) { location.hash = "#/search?q=" + encodeURIComponent(gInput.value.trim()); closeSearch(); }
    }
  });
  $("#searchResults").addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-go]");
    if (b) { location.hash = b.getAttribute("data-go"); closeSearch(); }
  });
}

function openSearch() {
  const ov = $("#searchOverlay");
  ov.hidden = false;
  const g = $("#globalSearch");
  g.value = "";
  renderGlobalResults("");
  setTimeout(() => g.focus(), 30);
  document.body.style.overflow = "hidden";
}
function closeSearch() {
  const ov = $("#searchOverlay");
  if (!ov.hidden) { ov.hidden = true; document.body.style.overflow = ""; }
}

function renderGlobalResults(qRaw) {
  const box = $("#searchResults");
  const q = String(qRaw || "").trim();
  if (q.length < 2) {
    box.innerHTML = `<p class="search-hint">اكتب حرفين على الأقل… مثال: «أطفال»، «صيدلية»، «تحاليل».<br>
      أو تصفّح: <a href="#/doctors">الأطباء</a> · <a href="#/pharmacies">الصيدليات</a> · <a href="#/oncall">المناوبة</a> · <a href="#/ask">اسأل طبياً</a></p>`;
    return;
  }
  const { entities, faqs } = searchAll(q);
  const parts = [];
  if (entities.length) {
    parts.push(`<div class="result-group-label">جهات (${fmtNum(entities.length)})</div>`);
    parts.push(entities.slice(0, 7).map((e) => `
      <button class="suggest-item" type="button" data-go="#/entity/${e.id}">
        <span class="s-icon" style="color:${TYPES[e.type].color}">${icon(TYPES[e.type].icon)}</span>
        <span><strong>${esc(e.name)}</strong><small>${esc(e.spec || TYPES[e.type].label)} — ${esc(e.area)}</small></span>
      </button>`).join(""));
  }
  if (faqs.length) {
    parts.push(`<div class="result-group-label">إرشادات (${fmtNum(faqs.length)})</div>`);
    parts.push(faqs.slice(0, 4).map((f) => `
      <button class="suggest-item" type="button" data-go="#/ask">
        <span class="s-icon">${icon("doc")}</span>
        <span><strong>${esc(f.q)}</strong><small>${esc(f.cat)}</small></span>
      </button>`).join(""));
  }
  box.innerHTML = parts.join("") ||
    `<p class="search-hint">لا نتائج لـ«${esc(q)}». <a href="#/search?q=${encodeURIComponent(q)}">عرض البحث الكامل ←</a></p>`
    + (q.length >= 2 ? `<div class="result-group-label">هل تقصد؟</div>
      <button class="suggest-item" type="button" data-go="#/search?q=${encodeURIComponent(q)}">
        <span class="s-icon">${icon("search")}</span>
        <span><strong>عرض كل نتائج «${esc(q)}» في صفحة مخصصة</strong></span>
      </button>` : "");
}

/* ================= الثيم ================= */
function applyTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
}

/* ================= الإقلاع ================= */
(async function boot() {
  const saved = localStorage.getItem("ds-theme") ||
    (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  applyTheme(saved);

  /* مزامنة رقم الاستعلامات من ملف البيانات */
  const infoLink = $("[data-tel-info]");
  if (infoLink) {
    infoLink.setAttribute("href", telHref(SITE.infoPhone));
    infoLink.querySelector("span").textContent = `استعلامات: ${fmtPhone(SITE.infoPhone)}`;
  }

  const year = $("#year");
  if (year) year.textContent = fmtNum(new Date().getFullYear());

  initHeader();
  window.addEventListener("hashchange", render);
  if (!location.hash) location.replace("#/");

  /* جلب البيانات الحية من Supabase — عند الفشل تُستخدم بيانات data.js */
  try { await loadRemoteData(); } catch (_) {}
  render();
})();
