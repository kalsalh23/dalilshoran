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

function entityCard(e, { rank = false, hours = false, image = false } = {}) {
  const t = TYPES[e.type];
  const addr = [e.area, e.address].filter(Boolean).join(" — ");

  return `
  <article class="entity-card entity-card--photo" data-go="#/entity/${e.id}" style="--tc:${t.color}" tabindex="0" role="link" aria-label="${esc(e.name)}">
    ${e.featured && rank !== false && e.rank ? `<span class="rank-ribbon">${icon("star")} ${fmtNum(e.rank)}</span>` : ""}
    <div class="ec-flex">
      <div class="ec-media-photo"><img src="${esc(placeholderFor(e))}" alt="${esc(e.name)}" loading="lazy" /></div>
      <div class="ec-body">
        <p class="ec-name">${esc(e.name)}</p>
        <p class="ec-spec"><span class="ec-dot"></span>${esc(e.spec || t.label)}</p>
        ${e.type === "doctor" && e.exp ? `<p class="ec-exp">خبرة ${fmtNum(e.exp)} سنوات</p>` : ""}
        ${addr ? `<p class="ec-addr">${icon("pin")} <span>${esc(addr)}</span></p>` : ""}
        ${hours ? `<p class="ec-hours">${icon("clock")} ${esc(e.hours)}</p>` : ""}
        <div class="ec-meta2">
          ${e.phone ? `<span class="ec-phone" dir="ltr">${icon("phone")} ${fmtPhone(e.phone)}</span>` : ""}
          ${e.type === "doctor" ? "" : `<a class="ec-map" data-stop href="${mapsLink(e.lat, e.lng, addr)}" target="_blank" rel="noopener">${icon("pin")} الموقع</a>`}
        </div>
      </div>
      <div class="ec-side">
        <span class="ec-arrow">${icon("arrowLeft")}</span>
        <span class="ec-view">عرض</span>
      </div>
    </div>
  </article>`;
}

/* Fleming: minimal horizontal card for home featured sections —
   carousel with dot indicators, reduced details: avatar + name + spec + call only.
   Area / phone text / map link removed from card; they live on the detail page. */
function entityCardMin(e, { rank = false } = {}) {
  const t = TYPES[e.type];
  const addr = [e.area, e.address].filter(Boolean).join(" — ");

  return `
  <article class="entity-card entity-card--min" data-go="#/entity/${e.id}" style="--tc:${t.color}" tabindex="0" role="link" aria-label="${esc(e.name)}">
    ${e.featured && rank !== false && e.rank ? `<span class="rank-ribbon">${icon("star")} ${fmtNum(e.rank)}</span>` : ""}
    <div class="ec-min">
      <div class="ec-media ec-media--lg"><img src="${esc(placeholderFor(e))}" alt="${esc(e.name)}" loading="lazy" /></div>
      <div class="ec-min-body">
        <p class="ec-name">${esc(e.name)}</p>
        <p class="ec-spec"><span class="ec-dot"></span>${esc(e.spec || t.label)}</p>
        ${e.type === "doctor" && e.exp ? `<p class="ec-exp">خبرة ${fmtNum(e.exp)} سنوات</p>` : ""}
      </div>
      <div class="ec-min-side">
        ${e.phone ? `
          <a class="ec-call" data-stop href="${telHref(e.phone)}" dir="ltr" aria-label="اتصال بـ ${esc(e.name)}">
            ${icon("phone")} اتصال
          </a>` : `<span class="ec-call ec-call--muted">${icon("pin")} Site</span>`}
      </div>
    </div>
  </article>`;
}

/* Fleming: rectangular on-call pharmacy card — image on the right,
   details on the left. Used on the home "on-call today" strip and the
   on-call schedule page. Falls back to the type glyph when no image. */
function featuredDoctorCarouselCard(d) {
  const t = TYPES[d.type] || TYPES.doctor;
  const addr = [d.area, d.address].filter(Boolean).join(" — ");
  const rank = d.rank ? `<span class="oc-badge featured-doc-badge">${icon("star")} مميز${Number(d.rank) ? " · " + fmtNum(d.rank) : ""}</span>` : `<span class="oc-badge featured-doc-badge">${icon("star")} مميز</span>`;
  return `
  <article class="oncall-card featured-doc-card" data-go="#/entity/${d.id}" tabindex="0" role="link" aria-label="${esc(d.name)}">
    <div class="oc-media featured-doc-media">
      <img src="${esc(placeholderFor(d))}" alt="${esc(d.name)}" loading="lazy" />
    </div>
    <div class="oc-body">
      <div class="oc-head">
        <p class="oc-name">${esc(d.name)}</p>
        ${rank}
      </div>
      <p class="oc-spec"><span class="ec-dot"></span>${esc(d.spec || t.label)}</p>
      ${d.exp ? `<p class="oc-hours">${icon("briefcase")} خبرة ${fmtNum(d.exp)} سنة</p>` : ""}
      ${addr ? `<p class="oc-addr">${icon("pin")} <span>${esc(addr)}</span></p>` : ""}
      ${d.hours ? `<p class="oc-hours">${icon("clock")} ${esc(d.hours)}</p>` : ""}
      <div class="oc-meta">
        <a class="oc-map featured-doc-open" data-stop href="#/entity/${d.id}">${icon("arrowLeft")} التفاصيل</a>
      </div>
    </div>
  </article>`;
}
function oncallCard(p) {
  const t = TYPES.pharmacy;
  const addr = [p.area, p.address].filter(Boolean).join(" — ");
  return `
  <article class="oncall-card" data-go="#/entity/${p.id}" tabindex="0" role="link" aria-label="${esc(p.name)}">
    <div class="oc-media">
      <img src="${esc(placeholderFor(p))}" alt="${esc(p.name)}" loading="lazy" />
    </div>
    <div class="oc-body">
      <div class="oc-head">
        <p class="oc-name">${esc(p.name)}</p>
        <span class="oc-badge">${icon("ambulance")} مناوبة</span>
      </div>
      <p class="oc-spec"><span class="ec-dot"></span>${esc(p.spec || t.label)}</p>
      ${addr ? `<p class="oc-addr">${icon("pin")} <span>${esc(addr)}</span></p>` : ""}
      ${p.hours ? `<p class="oc-hours">${icon("clock")} ${esc(p.hours)}</p>` : ""}
      <div class="oc-meta">
        ${p.phone ? `
          <a class="oc-call" data-stop href="${telHref(p.phone)}" dir="ltr" aria-label="اتصال بـ ${esc(p.name)}">
            ${icon("phone")} ${fmtPhone(p.phone)}
          </a>` : ""}
        <a class="oc-map" data-stop href="${mapsLink(p.lat, p.lng, addr)}" target="_blank" rel="noopener">
          ${icon("pin")} Site
        </a>
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

function placeholderFor(e) {
  if (!e) return "assets/placeholders/health-center.svg";
  if (e.image_url) return e.image_url;
  if (e.type === "doctor") {
    var n = String(e.name || "");
    var female = /دكتورة|طبيبة|أنثى|female/i.test(n) || /لينا|سمر|هدى|رنا|آية|سارة|ريم|نور|ميساء|هبة|ميس|غادة|رهف|سناء|منى|إيمان|أمل/i.test(n);
    if (/أحمد|محمد|سمير|خالد|رامي|باسل|عماد|فادي|حسن|عمر|يوسف|علي|محمود|إبراهيم|عبد/i.test(n.replace(/^د\.?\s*/,'').split(/\s+/)[0]||"")) female = false;
    return female ? "assets/placeholders/doctor-female.jpg" : "assets/placeholders/doctor-male.jpg";
  }
  var map={pharmacy:"assets/placeholders/pharmacy.jpg",hospital:"assets/placeholders/hospital.jpg",lab:"assets/placeholders/lab.jpg",radiology:"assets/placeholders/radiology.svg","health-center":"assets/placeholders/health-center.svg"}; return map[e.type] || ("assets/placeholders/" + (e.type || "health-center") + ".svg");
}

function routeSlug(type){return ({ doctor:'doctors', pharmacy:'pharmacies', hospital:'hospitals', lab:'labs', radiology:'radiology', 'health-center':'health-centers' }[type]);}
function entitiesByType(type){return (ENTITIES||[]).filter(function(e){return e&&e.type===type;});}
function featuredBy(type,limit){var l=entitiesByType(type).filter(function(e){return e&&e.featured;}).sort(function(a,b){return (a.rank||99)-(b.rank||99);}); return typeof limit==='number'?l.slice(0,limit):l;}
function isoDateLocal(d){ var dt=d?new Date(d):new Date(); var y=dt.getFullYear(),m=String(dt.getMonth()+1).padStart(2,"0"),da=String(dt.getDate()).padStart(2,"0"); return y+"-"+m+"-"+da; }
function oncallPharmaciesForDate(dateStr){ var s=window.ONCALL_SCHEDULE||[]; var ids=s.filter(function(r){return r && r.day===dateStr;}).map(function(r){return r.pharmacy_id;}); return ids.map(function(id){return (ENTITIES||[]).find(function(e){return e&&e.id===id;});}).filter(Boolean); }
function oncallPharmacies(dayName, dateStr){
  if(dateStr){ var byDate=oncallPharmaciesForDate(dateStr); if(byDate.length) return byDate; }
  var ids=(ONCALL&&ONCALL[dayName])?ONCALL[dayName]:[]; return ids.map(function(id){return (ENTITIES||[]).find(function(e){return e&&e.id===id;});}).filter(Boolean);
}


/* ================= البحث ================= */
function searchAll(qRaw) {
  const q = String(qRaw || "").trim();
  if (q.length < 2) return { entities: [], faqs: [] };
  const nq = q.toLowerCase();
  const entities = ENTITIES.filter((e) => {
    const hay = [e.name, e.spec, e.degree, e.area, e.address, e.owner, (e.services || []).join(" "), e.note]
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

  const useCluster = points.length > 20 && window.L.markerClusterGroup;
  const group = useCluster ? L.markerClusterGroup({ maxClusterRadius: 50, showCoverageOnHover: false, spiderLineDistance: 10 }) : L.featureGroup();

  points.forEach((p) => {
    L.marker([p.lat, p.lng], { icon: pinIcon(p.type), title: p.name })
      .bindPopup(popupHtml(p))
      .addTo(group);
  });

  group.addTo(map);
  try {
    if (useCluster && group.getBounds) map.fitBounds(group.getBounds().pad(0.3), { maxZoom: 15 });
    else if (!useCluster) map.fitBounds(group.getBounds().pad(0.3), { maxZoom: 15 });
    else map.setView(SITE.center, 13);
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
  const featuredDoctors = typeof featuredBy === "function" ? featuredBy("doctor", 8) : ENTITIES.filter((e)=>e && e.type==="doctor").slice(0,8);
  const featuredDoctorsHtml = featuredDoctors.length
    ? featuredDoctors.map((d) => featuredDoctorCarouselCard(d)).join("")
    : `<p class="oncall-empty">لا يوجد أطباء مميزون حالياً.</p>`;
  const featuredPharmacies = (typeof featuredBy === "function" ? featuredBy("pharmacy", 5) : ENTITIES.filter((e)=>e && e.type==="pharmacy").slice(0,5)).map((p) => entityCardMin(p, { rank: true })).join("");
  const todayOncall = typeof oncallPharmacies === "function" ? oncallPharmacies(todayName, isoDateLocal(new Date())) : [];
  const legend = Object.entries(TYPES).map(([k, t]) => `<span class="legend-item"><i style="--c:${t.color}"></i>${t.plural}</span>`).join("");

  return `
  <section class="container">
    <div class="hero">
      <span class="hero-badge">${icon("shield")} دليل صوران الطبي</span>
      <h1>كل الخدمات الطبية في صوران — في مكان واحد</h1>
      <p class="hero-sub">ابحث عن طبيب أو صيدلية، واتصل مباشرة.</p>
      <div class="hero-search">
        <div class="hero-search-box">
          ${icon("search")}
          <input type="search" id="heroSearch" placeholder="ابحث عن طبيب، اختصاص، صيدلية…" autocomplete="off" aria-label="بحث في الدليل" />
          <a class="btn btn-primary hero-search-btn" href="#/search" id="heroSearchBtn">بحث</a>
        </div>
        <div class="hero-suggest" id="heroSuggest" hidden></div>
      </div>
    </div>
  </section>

  <section class="container">
    <div class="quick-nav">
      <h3 class="quick-nav-title">${icon("sparkles")} اختصارات سريعة</h3>
      <div class="quick-nav-row">
        <a class="hero-chip" href="#/doctors">الأطباء</a>
        <a class="hero-chip" href="#/pharmacies">الصيدليات</a>
        <a class="hero-chip" href="#/hospitals">المشافي</a>
        <a class="hero-chip" href="#/health-centers">المراكز الطبية</a>
        <a class="hero-chip is-amber" href="#/oncall">الصيدليات المناوبة</a>
      </div>
    </div>
  </section>

  ${(typeof adsStrip === "function" && adsStrip("home")) ? `<section class="container" style="margin-top:14px">${adsStrip("home")}</section>` : ""}

  <section class="section container">
    <div class="section-head">
      <div><h2>الصيدليات المناوبة اليوم</h2><p>${todayName} — الصيدليات العاملة خارج أوقات الدوام، اتصل قبل التوجه</p></div>
      <a class="section-link" href="#/oncall">جدول المناوبة ${icon("arrowLeft")}</a>
    </div>
    <div class="oncall-today-card">
      <div class="oc-carousel" id="oncallCarousel" data-total="${todayOncall.length}">
        <div class="oc-track">
          ${todayOncall.length ? todayOncall.map((p) => oncallCard(p)).join("") : `<p class="oncall-empty">لا توجد صيدليات مناوبة مسجلة لهذا اليوم — راجع جدول بقية أيام الأسبوع.</p>`}
        </div>
        <div class="oc-dots" id="oncallDots"></div>
      </div>
    </div>
  </section>

  ${featuredDoctors.length ? `
  <section class="section container">
    <div class="section-head">
      <div><h2>الأطباء المميزون</h2><p>اسحب للتنقل بين الأطباء المميزين — اضغط للتفاصيل</p></div>
      <a class="section-link" href="#/doctors">كل الأطباء ${icon("arrowLeft")}</a>
    </div>
    <div class="oncall-today-card featured-doctors-shell">
      <div class="oc-carousel featured-docs-carousel" id="featuredDoctorsCarousel" data-total="${featuredDoctors.length}">
        <div class="oc-track">
          ${featuredDoctorsHtml}
        </div>
        <div class="oc-dots" id="featuredDoctorsDots"></div>
      </div>
    </div>
  </section>` : ""}

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
  if (typeof bindFeaturedDoctorsCarousel === "function") bindFeaturedDoctorsCarousel();

  bindOncallCarousel();
}

/* Fleming: on-call pharmacy carousel — shows 2 pharmacies at a time,
   prev/next arrows + dots, and auto-advances every 10 seconds.
   Pauses on user interaction. */
function bindFeaturedDoctorsCarousel() {
  const carousel = document.getElementById("featuredDoctorsCarousel");
  if (!carousel) return;
  const track = carousel.querySelector(".oc-track");
  const cards = track ? Array.from(track.querySelectorAll(":scope > article")) : [];
  const total = Number(carousel.getAttribute("data-total") || cards.length);
  const dotsEl = document.getElementById("featuredDoctorsDots");
  if (!track || total === 0 || !dotsEl) return;

  const getVisible = () => (window.matchMedia("(max-width: 640px)").matches ? 1 : 2);
  let index = 0;
  const maxIndex = () => Math.max(0, total - getVisible());
  const advance = () => {
    if (!cards[0]) return 0;
    const gap = 14;
    const v = getVisible();
    return cards[0].getBoundingClientRect().width * v + gap * (v - 1);
  };
  const renderDots = () => {
    const v = getVisible();
    const pages = Math.max(1, Math.ceil(total / v));
    dotsEl.innerHTML = Array.from({ length: pages }, (_, i) =>
      `<button class="scroll-dot ${i === 0 ? "active" : ""}" type="button" data-i="${i}" aria-label="صفحة ${i + 1}"></button>`).join("");
  };
  const setIndex = (i) => {
    index = Math.max(0, Math.min(maxIndex(), i));
    const cardW = cards[0] ? cards[0].getBoundingClientRect().width : 0;
    const dir = (document.dir || document.documentElement.dir || "rtl") === "rtl" ? 1 : -1;
    track.style.transform = cardW ? `translateX(${dir * index * (cardW + 14)}px)` : "none";
    const v = getVisible();
    const pages = Math.max(1, dotsEl.querySelectorAll(".scroll-dot").length);
    const activePage = Math.min(Math.floor(index / v), pages - 1);
    dotsEl.querySelectorAll(".scroll-dot").forEach((d, j) => d.classList.toggle("active", j === activePage));
  };
  renderDots(); setIndex(0);
  dotsEl.addEventListener("click", (e) => { const b = e.target.closest("[data-i]"); if (!b) return; setIndex(Number(b.dataset.i) * getVisible()); restart(); });
  let timer = null; const restart = () => { clearInterval(timer); if (maxIndex() > 0) timer = setInterval(() => setIndex(index >= maxIndex() ? 0 : index + getVisible()), 6000); };
  carousel.addEventListener("mouseenter", () => clearInterval(timer));
  carousel.addEventListener("mouseleave", restart);
  window.addEventListener("resize", () => { renderDots(); setIndex(Math.min(index, maxIndex())); restart(); }, { passive: true });
  restart();
}
function bindOncallCarousel() {
  const carousel = document.getElementById("oncallCarousel");
  if (!carousel) return;
  const track = carousel.querySelector(".oc-track");
  const cards = track ? Array.from(track.querySelectorAll(":scope > article")) : [];
  const total = Number(carousel.getAttribute("data-total") || cards.length);
  const dotsEl = document.getElementById("oncallDots");
  if (!track || total === 0) return;

  const getVisible = () => (window.matchMedia("(max-width: 640px)").matches ? 1 : 2);
  let index = 0;
  const gap = () => { try { return parseFloat(getComputedStyle(track).gap) || 14; } catch(_){ return 14; } };
  const maxIndex = () => Math.max(0, total - getVisible());
  const cardW = () => cards[0] ? cards[0].getBoundingClientRect().width : 0;
  const renderDots = () => {
    if (!dotsEl) return;
    const v = getVisible();
    const pages = Math.max(1, Math.ceil(total / v));
    dotsEl.innerHTML = Array.from({ length: pages }, (_, i) =>
      `<button class="scroll-dot ${i === 0 ? "active" : ""}" type="button" data-i="${i}" aria-label="صفحة ${i + 1}"></button>`).join("");
  };
  const setIndex = (i) => {
    index = Math.max(0, Math.min(maxIndex(), i));
    const w = cardW();
    const dir = (document.dir || document.documentElement.dir || "rtl") === "rtl" ? 1 : -1;
    track.style.transform = w ? `translateX(${dir * index * (w + gap())}px)` : "none";
    if (!dotsEl) return;
    const v = getVisible();
    const pages = Math.max(1, dotsEl.querySelectorAll(".scroll-dot").length);
    const activePage = Math.min(Math.floor(index / v), pages - 1);
    dotsEl.querySelectorAll(".scroll-dot").forEach((d, j) => d.classList.toggle("active", j === activePage));
  };
  renderDots(); setIndex(0);
  if (dotsEl) dotsEl.addEventListener("click", (e) => { const b = e.target.closest("[data-i]"); if (!b) return; setIndex(Number(b.dataset.i) * getVisible()); restart(); });
  const prevBtn = carousel.querySelector(".oc-arrow-prev");
  const nextBtn = carousel.querySelector(".oc-arrow-next");
  if (prevBtn) prevBtn.addEventListener("click", () => { setIndex(index - getVisible()); restart(); });
  if (nextBtn) nextBtn.addEventListener("click", () => { setIndex(index + getVisible()); restart(); });
  let timer = null;
  const restart = () => { clearInterval(timer); if (maxIndex() > 0) timer = setInterval(() => setIndex(index >= maxIndex() ? 0 : index + getVisible()), 6000); };
  carousel.addEventListener("mouseenter", () => clearInterval(timer));
  carousel.addEventListener("mouseleave", restart);
  window.addEventListener("resize", () => { renderDots(); setIndex(Math.min(index, maxIndex())); restart(); }, { passive: true });
  restart();
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

  /* Fleming: each type has its own filter set
   - doctors: search + specialization only
   - pharmacies: search + area only
   - labs (المخابر): area filter only
   - hospitals (المشافي): area filter only
   - health-centers (المراكز الصحية): area filter only
   - others: search + area + sort */
  const specs = [...new Set(entitiesByType(type).map((e) => e.spec).filter(Boolean))].sort();
  const areas = [...new Set(entitiesByType(type).map((e) => e.area).filter(Boolean))].sort();
  const showSpec = specs.length && type === "doctor";
  const showSearch = type !== "lab" && type !== "hospital" && type !== "health-center";
  const showArea = areas.length && (type === "pharmacy" || type === "lab" || type === "hospital" || type === "health-center" || type !== "doctor");
  const showSort = type !== "doctor" && type !== "pharmacy" && type !== "lab" && type !== "hospital" && type !== "health-center";
  const ph = type === "doctor" ? "ابحث باسم الطبيب أو التخصص…"
    : type === "pharmacy" ? "ابحث باسم الصيدلية…"
    : "ابحث بالاسم…";

  const searchField = showSearch ? `<div class="search-field">${icon("search")}<input id="fQ" type="search" placeholder="${ph}" value="${esc(f.q)}" /></div>` : "";

  const specSel = showSpec ? `
    <select id="fSpec" aria-label="تصفية حسب التخصص">
      <option value="">كل التخصصات</option>
      ${specs.map((s) => `<option value="${esc(s)}" ${f.spec === s ? "selected" : ""}>${esc(s)}</option>`).join("")}
    </select>` : "";

  const areaSel = showArea ? `
    <select id="fArea" aria-label="تصفية حسب المنطقة">
      <option value="">كل المناطق</option>
      ${areas.map((a) => `<option value="${esc(a)}" ${f.area === a ? "selected" : ""}>${esc(a)}</option>`).join("")}
    </select>` : "";

  const sortSel = showSort ? `
    <select id="fSort" aria-label="ترتيب النتائج">
      <option value="featured" ${f.sort === "featured" ? "selected" : ""}>المميزون أولاً</option>
      <option value="name" ${f.sort === "name" ? "selected" : ""}>الاسم (أ-ي)</option>
    </select>` : "";
  const clearBtn = (f.q || f.spec || f.area) ? `<button class="btn btn-ghost btn-sm" id="fClear" type="button">${icon("searchX")} مسح التصفية</button>` : "";

  return `
  <section class="page-hero">
    <div class="container">
      <nav class="breadcrumb" aria-label="مسار التنقل">
        <a href="#/">ال Principal</a> ${icon("chevLeft")} <span>${t.plural}</span>
      </nav>
      <h1>${icon(t.icon)} ${t.plural} في صوران</h1>
      <p>${TYPE_INTRO[type]}</p>
    </div>
  </section>
  <div class="container">
    <div class="toolbar">
      ${searchField}
      ${specSel}
      ${areaSel}
      ${sortSel}
      ${clearBtn}
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
  const q = $("#fQ"), spec = $("#fSpec"), area = $("#fArea"), sort = $("#fSort"), clear = $("#fClear");
  let deb;
  if (q) q.addEventListener("input", () => {
    clearTimeout(deb);
    deb = setTimeout(() => { f.q = q.value.trim(); applyList(type); }, 180);
  });
  if (spec) spec.addEventListener("change", () => { f.spec = spec.value; applyList(type); });
  if (area) area.addEventListener("change", () => { f.area = area.value; applyList(type); });
  if (sort) sort.addEventListener("change", () => { f.sort = sort.value; applyList(type); });
  if (clear) clear.addEventListener("click", () => {
    f.q = ""; f.spec = ""; f.area = ""; f.sort = "featured";
    render();
  });
  applyList(type);
}

/* ================= العرض: المناوبة ================= */
function viewOncall(params) {
  const raw = params.get("day");
  const parsed = raw === null || raw === "" ? NaN : parseInt(raw, 10);
  const today = todayIdx();
  const tomorrow = (today + 1) % 7;
  const todayDate = isoDateLocal(new Date());
  const tomorrowDate = isoDateLocal(new Date(Date.now() + 86400000));
  let day = Number.isNaN(parsed) ? today : Math.min(6, Math.max(0, parsed));
  if (raw === null || raw === "") day = today;
  if (day !== today && day !== tomorrow) day = today;
  state.oncallDay = day;
  const dayDate = day === today ? todayDate : tomorrowDate;
  const list = oncallPharmacies(DAYS[day], dayDate);
  const isToday = day === today;
  const note = isToday ? "صيدليات المناوبة اليوم — اتصل قبل التوجه للتأكد." : "صيدليات المناوبة ليوم غد — اتصل قبل التوجه للتأكد.";
  const tabs = [
    { i: today, label: DAYS[today], badge: "اليوم" },
    { i: tomorrow, label: DAYS[tomorrow], badge: "غداً" },
  ].map((d) => `
    <button class="day-tab ${d.i === day ? "active" : ""}" type="button" data-day="${d.i}">
      <span>${esc(d.label)}</span><span class="t-badge${d.i === tomorrow ? " t-badge-tomorrow" : ""}">${d.badge}</span>
    </button>`).join("");

  const cards = list.length ? list.map((p) => oncallCard(p)).join("")
    : `<div class="empty-state">${icon("pill")}<h3>لا توجد صيدليات مناوبة مسجلة</h3><p>جرّب التبديل بين اليوم وغداً أو تواصل مع الاستعلامات.</p></div>`;

return `
  <section class="page-hero">
    <div class="container">
      <nav class="breadcrumb" aria-label="مسار التنقل">
        <a href="#/">الرئيسية</a> ${icon("chevLeft")} <a href="#/pharmacies">الصيدليات</a> ${icon("chevLeft")} <span>المناوبة</span>
      </nav>
      <h1>${icon("ambulance")} الصيدليات المناوبة</h1>
      <p>جدول مناوبة الصيدليات في صوران — اختر اليوم أو غداً.</p>
    </div>
  </section>
  <div class="container oncall-page" style="padding:26px 0 56px">
    <div class="day-tabs day-tabs-compact" role="tablist" aria-label="اليوم وغداً">${tabs}</div>
    <div id="oncallDayNote" class="guides-note" style="margin:14px 0 0">${icon("info")} ${esc(DAYS[day])}${isToday ? " (اليوم)" : " (غداً)"} — ${esc(note)}</div>
    <div class="cards-grid" style="margin-top:18px">${cards}</div>
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
  /* related: same area first, then same type, excluding self */
  const sameArea = entitiesByType(e.type).filter((x) => x.id !== e.id && x.area === e.area);
  const otherArea = entitiesByType(e.type).filter((x) => x.id !== e.id && x.area !== e.area);
  const related = [...sameArea, ...otherArea].slice(0, 4);

  const badges = [];
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
          <span class="detail-avatar" style="--tc:${t.color}"><img src="${esc(placeholderFor(e))}" alt="${esc(e.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" /></span>
          <div class="detail-title">
            <h1>${esc(e.name)}</h1>
            <p class="sub">${e.spec ? esc(e.spec) + " — " : ""}${esc(e.degree || t.label)}${e.owner ? " · " + esc(e.owner) : ""}</p>
            <div class="entity-badges">${badges.join("")}</div>
          </div>
        </div>
        <div class="detail-actions">
          <a class="btn btn-primary" href="${telHref(e.phone)}">${icon("phone")} اتصال</a>
          ${e.whatsapp ? `<a class="btn btn-ghost" href="${waHref(e.phone)}" target="_blank" rel="noopener">${icon("chat")} واتساب</a>` : ""}
          ${(e.type !== "pharmacy" && e.type !== "doctor") ? `<a class="btn btn-outline" href="${mapsLink(e.lat, e.lng, e.address)}" target="_blank" rel="noopener">${icon("pin")} الموقع</a>` : ""}
          ${e.type !== "pharmacy" ? `<button class="btn btn-ghost" type="button" data-copy="${esc(e.phone)}">${icon("copy")} نسخ الرقم</button>` : ""}
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
    ${e.type === "doctor" ? "" : `
    <div class="detail-section">
      <div class="section-head"><div><h2>الموقع على الخريطة</h2><p>${esc(e.area)} — ${esc(e.address)}</p></div></div>
      <div class="map-wrap"><div id="entityMap"></div></div>
      <p class="map-note">${icon("info")} الموقع تقريبي — استخدم تطبيق الخرائط على هاتفك للوصول الدقيق.</p>
    </div>`}

  </div>`;
}

function afterEntity(id) {
  const e = entityById(id);
  if (!e) return;
  if (e.type !== "doctor" && document.getElementById("entityMap")) mountMap("entityMap", [e]);
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
  const cats = ["الكل", ...new Set((FAQ || []).map((f) => f.cat).filter(Boolean))];
  const chips = cats.map((c) => `<button class="guide-cat-chip${c === (state.askCat || "الكل") ? " is-active" : ""}" type="button" data-ask-cat="${esc(c)}">${esc(c)}</button>`).join("");
  return `
  <section class="page-hero">
    <div class="container">
      <nav class="breadcrumb" aria-label="مسار التنقل">
        <a href="#/">الرئيسية</a> ${icon("chevLeft")} <span>إرشادات طبية</span>
      </nav>
      <h1>${icon("shield")} إرشادات طبية</h1>
      <p>نصائح وإجابات موثوقة لأكثر الأسئلة الصحية شيوعاً. للحالات الطارئة اتصل بالإسعاف فوراً.</p>
    </div>
  </section>
  <div class="container page-wrap">
    <div class="guides-panel">
      <div class="guides-search-wrap">
        <label class="guides-search" for="askQ">
          <span class="guides-search-ic" aria-hidden="true">${icon("search")}</span>
          <input id="askQ" type="search" placeholder="ابحث عن سؤال أو عرض صحي…" value="${esc(state.askQuery || "")}" aria-label="بحث في الإرشادات الطبية" autocomplete="off" />
        </label>
        <div class="guides-cats" id="askCats" aria-label="تصنيفات الإرشادات">${chips}</div>
      </div>
      <div class="faq-list" id="faqList"></div>
      <div class="guides-note">${icon("info")} هذه الإرشادات للتوعية العامة ولا تغني عن مراجعة الطبيب أو الصيدلي.</div>
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
        <summary><span class="acc-q">؟</span> <span class="acc-q-text">${esc(f.q)}</span>${icon("chevDown", "chev")}</summary>
        <div class="acc-body"><p>${esc(f.a)}</p></div>
      </details>`).join("")
    : `<div class="empty-state">${icon("search")}<h3>لا توجد إرشادات مطابقة</h3><p>جرّب كلمات أخرى أو اختر تصنيفاً مختلفاً.</p></div>`;
}

function myQuestionsHtml(){return "";}

function bindAsk() {
  const q = document.getElementById("askQ");
  if (q) q.addEventListener("input", function(){ state.askQuery = q.value; applyFaq(); });
  const cats = document.getElementById("askCats");
  if (cats) cats.addEventListener("click", function(ev){
    var b = ev.target.closest("[data-ask-cat]"); if (!b) return;
    state.askCat = b.getAttribute("data-ask-cat") || "الكل";
    bindAskRenderCats();
    applyFaq();
  });
  bindAskRenderCats();
  applyFaq();
}
function bindAskRenderCats(){
  var cats = document.getElementById("askCats"); if (!cats) return;
  var all = ["الكل"].concat(Array.from(new Set((FAQ||[]).map(function(f){return f.cat;}).filter(Boolean))));
  cats.innerHTML = all.map(function(c){ return '<button class="guide-cat-chip'+(c === (state.askCat||"الكل") ? ' is-active' : '')+'" type="button" data-ask-cat="'+esc(c)+'">'+esc(c)+'</button>'; }).join("");
}

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
        <p class="login-forgot"><a href="https://cfcsnhuozufqaejkgrje.supabase.co/auth/v1/resetpassword" target="_blank" rel="noopener">${icon("key")} نسيت كلمة السر؟</a></p>
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

  const now = new Date();
  const y = now.getFullYear(), mo = now.getMonth();
  const from = new Date(y, mo, 1).toISOString().slice(0,10);
  const to = new Date(y, mo + 2, 0).toISOString().slice(0,10);
  const [ent, onc, faq, ads, ocSched, settings] = await Promise.all([
    get("/rest/v1/entities?select=*&order=sort_order.asc,id.asc"),
    get("/rest/v1/oncall?select=*"),
    get("/rest/v1/faq?select=*&order=sort_order.asc,id.asc"),
    get("/rest/v1/ads?select=*&active=eq.true&order=sort_order.asc,created_at.asc"),
    get("/rest/v1/oncall_schedule?select=*&day=gte." + from + "&day=lte." + to),
    get("/rest/v1/app_settings?select=*"),
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
  window.ONCALL_SCHEDULE = Array.isArray(ocSched) ? ocSched : [];
  if (Array.isArray(faq) && faq.length) {
    FAQ.length = 0;
    FAQ.push(...faq);
    used = true;
  }
  if (Array.isArray(ads)) {
    ADS.length = 0;
    ADS.push(...ads);
  }
  if (Array.isArray(settings)) {
    window.APP_SETTINGS = window.APP_SETTINGS || {};
    settings.forEach(function(r){ if(r && r.key) window.APP_SETTINGS[r.key] = r.value; });
    try { if (window.APP_SETTINGS.site && typeof window.APP_SETTINGS.site === "object") Object.assign(SITE, window.APP_SETTINGS.site); } catch(_){}
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
    /* include privacy-friendly fingerprint for spam detection (not stored raw) */
    const enriched = Object.assign({}, payload);
    if (!enriched.ip_hash) {
      try {
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const ipJson = await ipRes.json();
        if (ipJson && ipJson.ip) {
          const buf = new TextEncoder().encode(ipJson.ip + (navigator.userAgent || ""));
          const hashBuf = await crypto.subtle.digest("SHA-256", buf);
          const hashArr = Array.from(new Uint8Array(hashBuf));
          enriched.ip_hash = hashArr.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
        }
      } catch (_) {}
    }
    if (!enriched.user_agent) enriched.user_agent = (navigator.userAgent || "").slice(0, 200);

    const r = await fetch(window.SUPABASE_CONFIG.url + "/rest/v1/" + table, {
      method: "POST",
      headers: { ...H, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(enriched),
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
      <label class="ef-full">صورة الجهة (URL رابط الصورة)<input id="owImage" dir="ltr" value="${esc(e.image_url || "")}" placeholder="https://..." /></label>
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
      image_url: $("#owImage").value.trim() || null,
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


function featuredDoctorBigCard(d){
  const t=TYPES[d.type]||TYPES.doctor; const addr=[d.area,d.address].filter(Boolean).join(" — ");
  return `<article class="fdoc-card" data-go="#/entity/${d.id}" tabindex="0" role="link" aria-label="${esc(d.name)}">
    <div class="fdoc-media"><img src="${esc(placeholderFor(d))}" alt="${esc(d.name)}" loading="lazy" />${d.rank?`<span class="rank-ribbon">${icon("star")} ${fmtNum(d.rank)}</span>`:""}</div>
    <div class="fdoc-body">
      <p class="fdoc-name">${esc(d.name)}</p>
      <p class="fdoc-spec">${icon(t.icon)} ${esc(d.spec||t.label)}</p>
      ${d.exp?`<p class="fdoc-meta">${icon("briefcase")} خبرة ${fmtNum(d.exp)} سنة</p>`:""}
      ${addr?`<p class="fdoc-meta">${icon("pin")} ${esc(addr)}</p>`:""}
      ${d.hours?`<p class="fdoc-meta">${icon("clock")} ${esc(d.hours)}</p>`:""}
      <div class="fdoc-actions">
        ${d.phone?`<a class="btn btn-primary fdoc-call" data-stop href="${telHref(d.phone)}" dir="ltr">${icon("phone")} ${fmtPhone(d.phone)}</a>`:""}
        <a class="btn btn-ghost fdoc-open" data-stop href="#/entity/${d.id}">التفاصيل</a>
      </div>
    </div>
  </article>`;
}
function viewFeatured() {
  const doctors = featuredBy("doctor");
  const pharmacies = featuredBy("pharmacy");
  return `
  <section class="featured-page">
    <div class="container">
      <div class="featured-head">
        <a class="featured-back" href="#/" aria-label="الرئيسية">${icon("chevRight")}</a>
        <div><h1>${icon("star")} المميزون</h1><p>أفضل الأطباء والصيدليات في صوران</p></div>
      </div>
    </div>
    <section class="section container" style="padding-top:8px">
      <div class="section-head"><div><h2>${icon("steth")} الأطباء المميزون</h2><p>${fmtNum(doctors.length)} طبيب — اضغط للتفاصيل</p></div><a class="section-link" href="#/doctors">الكل ${icon("arrowLeft")}</a></div>
      ${doctors.length ? `<div class="fdoc-grid">${doctors.map(featuredDoctorBigCard).join("")}</div>` : `<div class="empty-state" style="margin:0">${icon("search")}<h3>لا يوجد أطباء مميزون حالياً</h3></div>`}
    </section>
    <section class="section container" style="padding-bottom:calc(28px + env(safe-area-inset-bottom,0px))">
      <div class="section-head"><div><h2>${icon("pill")} الصيدليات المميزة</h2><p>${fmtNum(pharmacies.length)} صيدلية</p></div><a class="section-link" href="#/pharmacies">الكل ${icon("arrowLeft")}</a></div>
      ${pharmacies.length ? `<div class="cards-grid featured-pharm-grid">${pharmacies.map(function(p){ return entityCard(p,{image:true,hours:true}); }).join("")}</div>` : `<div class="empty-state">${icon("search")}<h3>لا توجد صيدليات مميزة حالياً</h3></div>`}
    </section>
  </section>`;
}
function afterFeatured(){}
/* ================= التوجيه ================= */
const ROUTES = [
  { re: /^\/featured$/, key: "featured", title: "المميزون", view: viewFeatured, after: afterFeatured },
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
  try {
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
  try { if (route.after) route.after(q, m || []); } catch (ae) { console.error(ae); }
  lastRendered = path;
  } catch (err) { showBootError(err); }
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

function showBootError(err) {
  var view = document.getElementById("view");
  if (!view) return;
  var msg = (err && (err.stack || err.message)) ? String(err.stack || err.message) : String(err || "Unknown error");
  var safe = msg.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  view.innerHTML = '<section class="container" style="padding:24px 0 40px"><div class="empty-state" style="display:block;text-align:right"><h2 style="margin:0 0 8px">حدث خطأ أثناء تحميل الصفحة</h2><p style="margin:0 0 10px;color:#666">حدّث الصفحة (Ctrl+F5). إذا استمر الخطأ أرسِل هذه التفاصيل:</p><pre dir="ltr" style="text-align:left;white-space:pre-wrap;word-break:break-word;margin:0;font-size:12px;line-height:1.45;background:#f8f9fa;border:1px solid #e5e7eb;border-radius:10px;padding:12px;max-height:45vh;overflow:auto">' + safe + '</pre></div></section>';
}
window.addEventListener("error", function(e){ try{ showBootError(e && (e.error || e.message)); }catch(_){} });
window.addEventListener("unhandledrejection", function(e){ try{ showBootError(e && e.reason); }catch(_){} });
function hideSplash() {
  if (!el || el.__hidden) return;
  el.__hidden = true;
  el.classList.add("is-hidden");
  setTimeout(function(){ if (el && el.parentNode) el.parentNode.removeChild(el); }, 500);
}
function scheduleSplash() { if (window.__hideSplash) return; setTimeout(hideSplash, 4000); } window.__appHideSplash = hideSplash;
/* ================= الإشعارات: التهيئة وزر الجرس ================= */
async function initNotificationsUI() {
  if (!window.DSNotifications) return;
  await window.DSNotifications.init();
  const btn = $("#btnNotify");
  const dot = $("#notifyDot");
  if (!btn) return;
  if (window.DSNotifications.state.enabled && dot) dot.hidden = false;
  btn.addEventListener("click", async () => {
    const res = await window.DSNotifications.toggle();
    if (res.ok) {
      if (res.activated) {
        if (dot) dot.hidden = false;
        showToast("تم تفعيل الإشعارات — ستصلك تنبيهات المناوبة والإعلانات", "ok");
      } else if (res.deactivated) {
        if (dot) dot.hidden = true;
        showToast("تم إلغاء تفعيل الإشعارات", "ok");
      } else {
        showToast("تم تحديث إعدادات الإشعارات", "ok");
      }
    } else {
      showToast(res.error || "تعذر تحديث الإشعارات", "warn");
    }
  });
}

/* ================= الإقلاع ================= */
(async function boot() {
  try {
    const year = $('#year');
    if (year) year.textContent = fmtNum(new Date().getFullYear());

    initHeader();
    await initNotificationsUI();
    window.addEventListener("hashchange", render);
    if (!location.hash) location.replace("#/");

    /* جلب البيانات الحية من Supabase — عند الفشل تُستخدم بيانات data.js */
    try { await loadRemoteData(); } catch (_) {}
    render();
    } catch (err) { showBootError(err); }
})();
