/* ============================================================
   Ø¯Ù„ÙŠÙ„ ØµÙˆØ±Ø§Ù† Ø§Ù„Ø·Ø¨ÙŠ â€” Ù…Ù†Ø·Ù‚ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚ (Ø¨Ø¯ÙˆÙ† Ø£ÙŠ Ù…ÙƒØªØ¨Ø§Øª Ø®Ø§Ø±Ø¬ÙŠØ©)
   ØªÙˆØ¬ÙŠÙ‡ Ù‡Ø§Ø´ | Ø¨Ø­Ø« Ø´Ø§Ù…Ù„ | Ø®Ø±ÙŠØ·Ø© Leaflet | ÙˆØ¶Ø¹ Ù„ÙŠÙ„ÙŠ | Ù…Ù†Ø§ÙˆØ¨Ø©
   ============================================================ */

"use strict";

/* ================= Ø£Ø¯ÙˆØ§Øª Ø¹Ø§Ù…Ø© ================= */
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
    : "https://www.google.com/maps?q=" + encodeURIComponent(address || "ØµÙˆØ±Ø§Ù†");

const todayIdx = () => new Date().getDay();
const initials = (name) =>
  String(name).replace(/^Ø¯\.\s*/, "").split(/\s+/).slice(0, 2).map((w) => w[0]).join("");

/* ================= Ø§Ù„Ø£ÙŠÙ‚ÙˆÙ†Ø§Øª ================= */
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

/* ================= Ø§Ù„Ø­Ø§Ù„Ø© Ø§Ù„Ø¹Ø§Ù…Ø© ================= */
const state = {
  map: null,
  oncallDay: todayIdx(),
  askCat: "Ø§Ù„ÙƒÙ„",
  askQuery: "",
  dashTab: "entities",
  filters: {},
};
["doctor", "pharmacy", "hospital", "lab", "radiology", "health-center"].forEach((t) => {
  state.filters[t] = { q: "", spec: "", area: "", sort: "featured" };
});

/* ================= Ù…ÙƒÙˆÙ‘Ù†Ø§Øª Ù…Ø´ØªØ±ÙƒØ© ================= */
function typeBadge(e) {
  const t = TYPES[e.type];
  return `<a class="badge badge-blue" href="#/${routeSlug(e.type)}" style="--tc:${t.color}">${icon(t.icon)} ${t.label}</a>`;
}

function entityCard(e, { rank = false, hours = false, image = false } = {}) {
  const t = TYPES[e.type];
  const addr = [e.area, e.address].filter(Boolean).join(" â€” ");

  return `
  <article class="entity-card" data-go="#/entity/${e.id}" style="--tc:${t.color}" tabindex="0" role="link" aria-label="${esc(e.name)}">
    ${e.featured && rank !== false && e.rank ? `<span class="rank-ribbon">${icon("star")} ${fmtNum(e.rank)}</span>` : ""}
    <div class="ec-flex">
      <div class="ec-media">${e.image_url ? `<img src="${esc(e.image_url)}" alt="${esc(e.name)}" loading="lazy" />` : icon(t.icon)}</div>
      <div class="ec-body">
        <p class="ec-name">${esc(e.name)}</p>
        <p class="ec-spec"><span class="ec-dot"></span>${esc(e.spec || t.label)}</p>
        ${e.type === "doctor" && e.exp ? `<p class="ec-exp">Ø®Ø¨Ø±Ø© ${fmtNum(e.exp)} Ø³Ù†ÙˆØ§Øª</p>` : ""}
        ${addr ? `<p class="ec-addr">${icon("pin")} <span>${esc(addr)}</span></p>` : ""}
        ${hours ? `<p class="ec-hours">${icon("clock")} ${esc(e.hours)}</p>` : ""}
        <div class="ec-meta2">
          ${e.phone ? `<span class="ec-phone" dir="ltr">${icon("phone")} ${fmtPhone(e.phone)}</span>` : ""}
          <a class="ec-map" data-stop href="${mapsLink(e.lat, e.lng, addr)}" target="_blank" rel="noopener">${icon("pin")} Ø§Ù„Ù…ÙˆÙ‚Ø¹</a>
        </div>
      </div>
      <div class="ec-side">
        <span class="ec-arrow">${icon("arrowLeft")}</span>
        <span class="ec-view">Ø¹Ø±Ø¶</span>
      </div>
    </div>
  </article>`;
}

/* Fleming: rectangular featured doctor card â€” image on the right,
   details on the left. Swipe carousel on home. */
function doctorFeatureCard(d) {
  const t = TYPES.doctor;
  const addr = [d.area, d.address].filter(Boolean).join(" â€” ");
  return `
  <article class="oncall-card doctor-feature-card" data-go="#/entity/${d.id}" tabindex="0" role="link" aria-label="${esc(d.name)}">
    <div class="oc-media">
      ${d.image_url
        ? `<img src="${esc(d.image_url)}" alt="${esc(d.name)}" loading="lazy" />`
        : `<div class="oc-media-fallback">${icon("steth")}</div>`}
    </div>
    <div class="oc-body">
      <div class="oc-head">
        <p class="oc-name">${esc(d.name)}</p>
        ${d.featured ? `<span class="oc-badge">${icon("star")} Ù…Ù…ÙŠØ²</span>` : ""}
      </div>
      <p class="oc-spec"><span class="ec-dot"></span>${esc(d.spec || t.label)}</p>
      ${d.degree ? `<p class="oc-hours">${icon("doc")} ${esc(d.degree)}${d.exp ? ` Â· Ø®Ø¨Ø±Ø© ${fmtNum(d.exp)} Ø³Ù†ÙˆØ§Øª` : ""}</p>` : (d.exp ? `<p class="oc-hours">${icon("doc")} Ø®Ø¨Ø±Ø© ${fmtNum(d.exp)} Ø³Ù†ÙˆØ§Øª</p>` : "")}
      ${addr ? `<p class="oc-addr">${icon("pin")} <span>${esc(addr)}</span></p>` : ""}
      ${d.hours ? `<p class="oc-hours">${icon("clock")} ${esc(d.hours)}</p>` : ""}
      <div class="oc-meta">
        ${d.phone ? `
          <a class="oc-call" data-stop href="${telHref(d.phone)}" dir="ltr" aria-label="Ø§ØªØµØ§Ù„ Ø¨Ù€ ${esc(d.name)}">
            ${icon("phone")} ${fmtPhone(d.phone)}
          </a>` : ""}
        <a class="oc-map" data-stop href="#/entity/${d.id}">
          ${icon("arrowLeft")} Ø§Ù„ØªÙØ§ØµÙŠÙ„
        </a>
      </div>
    </div>
  </article>`;
}

function entityCardMin(e, { rank = false } = {}) {
  const t = TYPES[e.type];
  const addr = [e.area, e.address].filter(Boolean).join(" â€” ");

  return `
  <article class="entity-card entity-card--min" data-go="#/entity/${e.id}" style="--tc:${t.color}" tabindex="0" role="link" aria-label="${esc(e.name)}">
    ${e.featured && rank !== false && e.rank ? `<span class="rank-ribbon">${icon("star")} ${fmtNum(e.rank)}</span>` : ""}
    <div class="ec-min">
      <div class="ec-media ec-media--lg">${e.image_url ? `<img src="${esc(e.image_url)}" alt="${esc(e.name)}" loading="lazy" />` : icon(t.icon)}</div>
      <div class="ec-min-body">
        <p class="ec-name">${esc(e.name)}</p>
        <p class="ec-spec"><span class="ec-dot"></span>${esc(e.spec || t.label)}</p>
        ${e.type === "doctor" && e.exp ? `<p class="ec-exp">Ø®Ø¨Ø±Ø© ${fmtNum(e.exp)} Ø³Ù†ÙˆØ§Øª</p>` : ""}
      </div>
      <div class="ec-min-side">
        ${e.phone ? `
          <a class="ec-call" data-stop href="${telHref(e.phone)}" dir="ltr" aria-label="Ø§ØªØµØ§Ù„ Ø¨Ù€ ${esc(e.name)}">
            ${icon("phone")} Ø§ØªØµØ§Ù„
          </a>` : `<span class="ec-call ec-call--muted">${icon("pin")} Site</span>`}
      </div>
    </div>
  </article>`;
}

/* Fleming: rectangular on-call pharmacy card â€” image on the right,
   details on the left. Used on the home "on-call today" strip and the
   on-call schedule page. Falls back to the type glyph when no image. */
function oncallCard(p) {
  const t = TYPES.pharmacy;
  const addr = [p.area, p.address].filter(Boolean).join(" â€” ");
  return `
  <article class="oncall-card" data-go="#/entity/${p.id}" tabindex="0" role="link" aria-label="${esc(p.name)}">
    <div class="oc-media">
      ${p.image_url
        ? `<img src="${esc(p.image_url)}" alt="${esc(p.name)}" loading="lazy" />`
        : `<div class="oc-media-fallback">${icon("pill")}</div>`}
    </div>
    <div class="oc-body">
      <div class="oc-head">
        <p class="oc-name">${esc(p.name)}</p>
        <span class="oc-badge">${icon("ambulance")} Ù…Ù†Ø§ÙˆØ¨Ø©</span>
      </div>
      <p class="oc-spec"><span class="ec-dot"></span>${esc(p.spec || t.label)}</p>
      ${addr ? `<p class="oc-addr">${icon("pin")} <span>${esc(addr)}</span></p>` : ""}
      ${p.hours ? `<p class="oc-hours">${icon("clock")} ${esc(p.hours)}</p>` : ""}
      <div class="oc-meta">
        ${p.phone ? `
          <a class="oc-call" data-stop href="${telHref(p.phone)}" dir="ltr" aria-label="Ø§ØªØµØ§Ù„ Ø¨Ù€ ${esc(p.name)}">
            ${icon("phone")} ${fmtPhone(p.phone)}
          </a>` : ""}
        <a class="oc-map" data-stop href="${mapsLink(p.lat, p.lng, addr)}" target="_blank" rel="noopener">
          ${icon("pin")} Site
        </a>
      </div>
    </div>
  </article>`;
}

/* Ø§Ù„Ø¶ØºØ· Ø¹Ù„Ù‰ Ø§Ù„Ø¨Ø·Ø§Ù‚Ø© ÙƒØ§Ù…Ù„Ø© ÙŠÙØªØ­ Ø§Ù„ØªÙØ§ØµÙŠÙ„ â€” Ø¹Ø¯Ø§ Ø§Ù„Ø±ÙˆØ§Ø¨Ø· Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ© Ø§Ù„Ù…ÙˆØ³ÙˆÙ…Ø© data-stop */
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

function entitiesByType(type) {
  return (ENTITIES || []).filter((e) => e && e.type === type);
}
function featuredBy(type, limit) {
  const list = entitiesByType(type).filter((e) => e.featured);
  return typeof limit === "number" ? list.slice(0, limit) : list;
}
function oncallPharmacies(dayName) {
  const ids = (ONCALL && ONCALL[dayName]) ? ONCALL[dayName] : [];
  return ids.map((id) => (ENTITIES || []).find((e) => e && e.id === id)).filter(Boolean);
}


/* ================= Ø§Ù„Ø¨Ø­Ø« ================= */
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

/* ================= Ø§Ù„Ø®Ø±ÙŠØ·Ø© ================= */
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
  return `<b>${esc(e.name)}</b><small>${esc(TYPES[e.type].label)} â€” ${esc(e.area)}</small><br>
    <a href="${telHref(e.phone)}" dir="ltr">${fmtPhone(e.phone)}</a><br>
    <a href="#/entity/${e.id}">Ø¹Ø±Ø¶ Ø§Ù„ØªÙØ§ØµÙŠÙ„ â†</a>`;
}

function mountMap(id, points) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!window.L) {
    el.innerHTML = `<div class="map-fallback">${icon("map")} ØªØ¹Ø°Ù‘Ø± ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø®Ø±ÙŠØ·Ø© â€” ØªØ­Ù‚Ù‚ Ù…Ù† Ø§ØªØµØ§Ù„Ùƒ Ø¨Ø§Ù„Ø¥Ù†ØªØ±Ù†Øª.<br>
      <a href="https://www.openstreetmap.org/#map=15/${SITE.center[0]}/${SITE.center[1]}" target="_blank" rel="noopener">ÙØªØ­ Ù…ÙˆÙ‚Ø¹ ØµÙˆØ±Ø§Ù† ÙÙŠ OpenStreetMap â†—</a></div>`;
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

/* ================= Ø§Ù„ØªÙˆØ³Øª ÙˆØ§Ù„Ù†Ø³Ø® ================= */
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
  const done = () => showToast(`ØªÙ… Ù†Ø³Ø® Ø§Ù„Ø±Ù‚Ù…: ${fmtPhone(text)}`);
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
  try { document.execCommand("copy"); done(); } catch (_) { showToast("ØªØ¹Ø°Ù‘Ø± Ø§Ù„Ù†Ø³Ø®", "warn"); }
  ta.remove();
}

/* ================= Ø§Ù„Ø¹Ø±Ø¶: Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© ================= */
function viewHome() {
  const todayName = DAYS[todayIdx()];

  const featuredDoctors = featuredBy("doctor", 8);
  const featuredDoctorsHtml = featuredDoctors.length
    ? featuredDoctors.map((d) => doctorFeatureCard(d)).join("")
    : `<p class="oncall-empty">Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø£Ø·Ø¨Ø§Ø¡ Ù…Ù…ÙŠØ²ÙˆÙ† Ø­Ø§Ù„ÙŠØ§Ù‹.</p>`;
  const featuredPharmacies = featuredBy("pharmacy", 5).map((p) => entityCardMin(p, { rank: true })).join("");

  const todayOncall = oncallPharmacies(todayName);

  const legend = Object.entries(TYPES).map(([k, t]) =>
    `<span class="legend-item"><i style="--c:${t.color}"></i>${t.plural}</span>`).join("");

return `
  <section class="container">
    <div class="hero">
      <span class="hero-badge">${icon("shield")} Ø¯Ù„ÙŠÙ„ ØµÙˆØ±Ø§Ù† Ø§Ù„Ø·Ø¨ÙŠ</span>
      <h1>ÙƒÙ„ Ø§Ù„Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ø·Ø¨ÙŠØ© ÙÙŠ ØµÙˆØ±Ø§Ù† â€” ÙÙŠ Ù…ÙƒØ§Ù† ÙˆØ§Ø­Ø¯</h1>
      <p class="hero-sub">Ø§Ø¨Ø­Ø« Ø¹Ù† Ø·Ø¨ÙŠØ¨ Ø£Ùˆ ØµÙŠØ¯Ù„ÙŠØ©ØŒ ÙˆØ§ØªØµÙ„ Ù…Ø¨Ø§Ø´Ø±Ø©.</p>
      <div class="hero-search">
        <div class="hero-search-box">
          ${icon("search")}
          <input type="search" id="heroSearch" placeholder="Ø§Ø¨Ø­Ø« Ø¹Ù† Ø·Ø¨ÙŠØ¨ØŒ Ø§Ø®ØªØµØ§ØµØŒ ØµÙŠØ¯Ù„ÙŠØ©â€¦" autocomplete="off" aria-label="Ø¨Ø­Ø« ÙÙŠ Ø§Ù„Ø¯Ù„ÙŠÙ„" />
          <a class="btn btn-primary hero-search-btn" href="#/search" id="heroSearchBtn">Ø¨Ø­Ø«</a>
        </div>
        <div class="hero-suggest" id="heroSuggest" hidden></div>
      </div>
    </div>
  </section>

  <section class="container">
    <div class="quick-nav">
      <h3 class="quick-nav-title">${icon("sparkles")} Ø§Ø®ØªØµØ§Ø±Ø§Øª Ø³Ø±ÙŠØ¹Ø©</h3>
      <div class="quick-nav-row">
        <a class="hero-chip" href="#/doctors">Ø§Ù„Ø£Ø·Ø¨Ø§Ø¡</a>
        <a class="hero-chip" href="#/pharmacies">Ø§Ù„ØµÙŠØ¯Ù„ÙŠØ§Øª</a>
        <a class="hero-chip" href="#/hospitals">Ø§Ù„Ù…Ø´Ø§ÙÙŠ</a>
        <a class="hero-chip" href="#/health-centers">Ø§Ù„Ù…Ø±Ø§ÙƒØ² Ø§Ù„Ø·Ø¨ÙŠØ©</a>
        <a class="hero-chip is-amber" href="#/oncall">Ø§Ù„ØµÙŠØ¯Ù„ÙŠØ§Øª Ø§Ù„Ù…Ù†Ø§ÙˆØ¨Ø©</a>
      </div>
    </div>
  </section>

  ${adsStrip("home") ? `<section class="container" style="margin-top:14px">${adsStrip("home")}</section>` : ""}

  <section class="section container">
    <div class="section-head">
      <div><h2>Ø§Ù„ØµÙŠØ¯Ù„ÙŠØ§Øª Ø§Ù„Ù…Ù†Ø§ÙˆØ¨Ø© Ø§Ù„ÙŠÙˆÙ…</h2><p>${todayName} â€” Ø§Ù„ØµÙŠØ¯Ù„ÙŠØ§Øª Ø§Ù„Ø¹Ø§Ù…Ù„Ø© Ø®Ø§Ø±Ø¬ Ø£ÙˆÙ‚Ø§Øª Ø§Ù„Ø¯ÙˆØ§Ù…ØŒ Ø§ØªØµÙ„ Ù‚Ø¨Ù„ Ø§Ù„ØªÙˆØ¬Ù‡</p></div>
      <a class="section-link" href="#/oncall">Ø¬Ø¯ÙˆÙ„ Ø§Ù„Ù…Ù†Ø§ÙˆØ¨Ø© ${icon("arrowLeft")}</a>
    </div>
    <div class="oncall-today-card">
      <div class="oc-carousel" id="oncallCarousel" data-total="${todayOncall.length}">
        <div class="oc-track">
          ${todayOncall.length ? todayOncall.map((p) => oncallCard(p)).join("") : `<p class="oncall-empty">Ù„Ø§ ØªÙˆØ¬Ø¯ ØµÙŠØ¯Ù„ÙŠØ§Øª Ù…Ù†Ø§ÙˆØ¨Ø© Ù…Ø³Ø¬Ù„Ø© Ù„Ù‡Ø°Ø§ Ø§Ù„ÙŠÙˆÙ… â€” Ø±Ø§Ø¬Ø¹ Ø¬Ø¯ÙˆÙ„ Ø¨Ù‚ÙŠØ© Ø£ÙŠØ§Ù… Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹.</p>`}
        </div>
        <div class="oc-dots" id="oncallDots"></div>
      </div>
    </div>
  </section>

  ${featuredDoctors.length ? `
  <section class="section container">
    <div class="section-head">
      <div><h2>Ø§Ù„Ø£Ø·Ø¨Ø§Ø¡ Ø§Ù„Ù…Ù…ÙŠØ²ÙˆÙ†</h2><p>Ø£Ø³Ù…Ø§Ø¡ ÙˆØªÙØ§ØµÙŠÙ„ Ù…Ø¹ ØµÙˆØ±Ø© â€” Ø§Ø³Ø­Ø¨ Ù„Ù„ØªÙ†Ù‚Ù„ Ø¨ÙŠÙ† Ø§Ù„Ø£Ø·Ø¨Ø§Ø¡</p></div>
      <a class="section-link" href="#/doctors">ÙƒÙ„ Ø§Ù„Ø£Ø·Ø¨Ø§Ø¡ ${icon("arrowLeft")}</a>
    </div>
    <div class="oncall-today-card">
      <div class="oc-carousel" id="featuredDoctorsCarousel" data-total="${featuredDoctors.length}">
        <div class="oc-track">
          ${featuredDoctorsHtml}
        </div>
        <div class="oc-dots" id="featuredDoctorsDots"></div>
      </div>
    </div>
  </section>` : ""}

  <section class="section container">
    <div class="section-head">
      <div><h2>Ø§Ù„Ø®Ø±ÙŠØ·Ø© Ø§Ù„Ø·Ø¨ÙŠØ© Ù„Ù„Ù…Ø¯ÙŠÙ†Ø©</h2><p>Ù…ÙˆØ§Ù‚Ø¹ ØªÙ‚Ø±ÙŠØ¨ÙŠØ© Ù„ÙƒÙ„ Ø§Ù„Ø¬Ù‡Ø§Øª Ø§Ù„Ù…Ø³Ø¬Ù„Ø© â€” Ø§Ø¶ØºØ· Ø§Ù„Ø¹Ù„Ø§Ù…Ø© Ù„Ù„ØªÙØ§ØµÙŠÙ„</p></div>
    </div>
    <div class="map-wrap">
      <div class="map-head">
        <h3>${icon("map")} Ø®Ø±ÙŠØ·Ø© ØµÙˆØ±Ø§Ù† Ø§Ù„ØµØ­ÙŠØ©</h3>
        <div class="map-legend">${legend}</div>
      </div>
      <div id="homeMap"></div>
    </div>
    <p class="map-note">${icon("info")} Ø§Ù„Ù…ÙˆØ§Ù‚Ø¹ ØªÙ‚Ø±ÙŠØ¨ÙŠØ© Ù„Ø£ØºØ±Ø§Ø¶ Ø§Ù„ØªÙˆØ¬ÙŠÙ‡ØŒ ÙˆØ§Ù„Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ø¯Ù‚ÙŠÙ‚ Ù…Ø°ÙƒÙˆØ± ÙÙŠ ØµÙØ­Ø© ÙƒÙ„ Ø¬Ù‡Ø©.</p>
  </section>

  <section class="container" style="padding-bottom:40px">
    <div class="cta-band cta-blue">
      <div>
        <h3>Ø¹Ù†Ø¯Ùƒ Ø³Ø¤Ø§Ù„ ØµØ­ÙŠØŸ Ø§Ø³Ø£Ù„ Ø£Ù‡Ù„ Ø§Ù„Ø§Ø®ØªØµØ§Øµ</h3>
        <p>Ù…ÙƒØªØ¨Ø© Ø¥Ø±Ø´Ø§Ø¯Ø§Øª Ø·Ø¨ÙŠØ© Ù…ÙˆØ«ÙˆÙ‚Ø© Ø¨Ø§Ù„Ù„ØºØ© Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©ØŒ ÙˆØ¥Ù† Ù„Ù… ØªØ¬Ø¯ Ø¥Ø¬Ø§Ø¨ØªÙƒ ÙØ£Ø±Ø³Ù„ Ø³Ø¤Ø§Ù„Ùƒ ÙˆØ³ÙŠØ±Ø§Ø¬Ø¹Ù‡ ÙØ±ÙŠÙ‚ Ø§Ù„Ø¯Ù„ÙŠÙ„.</p>
      </div>
      <a class="btn btn-gold btn-lg" href="#/ask">${icon("chat")} Ø§Ø³Ø£Ù„ Ø§Ù„Ø¢Ù†</a>
    </div>
  </section>`;
}

function afterHome() {
  /* Ø§Ù‚ØªØ±Ø§Ø­Ø§Øª Ø§Ù„Ø¨Ø­Ø« ÙÙŠ Ø§Ù„Ù‡ÙŠØ±Ùˆ */
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
            <span><strong>${esc(e.name)}</strong><small>${esc(e.spec || TYPES[e.type].label)} â€” ${esc(e.area)}</small></span>
          </button>`),
        ...faqs.slice(0, 2).map((f) => `
          <button class="suggest-item" type="button" data-go="#/ask">
            <span class="s-icon">${icon("doc")}</span>
            <span><strong>${esc(f.q)}</strong><small>Ø³Ø¤Ø§Ù„ Ø´Ø§Ø¦Ø¹ â€” ${esc(f.cat)}</small></span>
          </button>`),
      ].join("");
      box.innerHTML = items || `<p class="search-hint">Ù„Ø§ Ù†ØªØ§Ø¦Ø¬ Ù…Ø·Ø§Ø¨Ù‚Ø© Ù„ÙƒÙ„Ù…Ø© Â«${esc(q)}Â» â€” Ø¬Ø±Ù‘Ø¨ ÙƒÙ„Ù…Ø© Ø£Ø®Ø±Ù‰.</p>`;
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
  bindFeaturedDoctorsCarousel();
  bindOncallCarousel();
}

/* Swipe carousel for on-call / featured sections: RTL-aware, dots, auto-advance */
function bindCarousel(id, dotsId) {
  const carousel = $("#" + id);
  if (!carousel) return;
  const track = carousel.querySelector(".oc-track");
  if (!track) return;
  const cards = Array.from(track.querySelectorAll(".oncall-card"));
  const total = cards.length;
  if (total <= 1) return;

  const dotsEl = dotsId ? $("#" + dotsId) : null;
  let visible = 2;
  function computeVisible() { visible = window.matchMedia("(max-width: 640px)").matches ? 1 : 2; }
  computeVisible();
  let index = 0, timer = null, hover = false, dragging = false, dragStartX = 0, dragDelta = 0;

  function maxIndex() { return Math.max(0, total - visible); }
  function buildDots() {
    if (!dotsEl) return;
    const mx = maxIndex();
    dotsEl.innerHTML = Array.from({ length: mx + 1 })
      .map((_, i) => `<button class="oc-dot${i === Math.min(index, mx) ? " is-active" : ""}" type="button" aria-label="Ø´Ø±ÙŠØ­Ø© ${i + 1}" data-i="${i}"></button>`).join("");
  }
  buildDots();
  function cardWidth() {
    const c = cards[0]; if (!c) return 0;
    const style = getComputedStyle(track);
    const gap = parseFloat(style.gap || style.columnGap || 0) || 0;
    return c.getBoundingClientRect().width + gap;
  }
  function goTo(i, animate = true) {
    index = Math.max(0, Math.min(i, maxIndex()));
    const offset = cardWidth() * index;
    const dir = (document.dir || "rtl") === "rtl" ? 1 : -1;
    track.style.transition = animate ? "transform .45s cubic-bezier(.4,0,.2,1)" : "none";
    track.style.transform = `translateX(${dir * offset}px)`;
    if (dotsEl) dotsEl.querySelectorAll(".oc-dot").forEach((d, j) => d.classList.toggle("is-active", j === index));
  }
  function next() { goTo(index >= maxIndex() ? 0 : index + 1); }
  function start() { stop(); timer = setInterval(() => { if (!hover && !dragging) next(); }, 4500); }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  carousel.addEventListener("mouseenter", () => { hover = true; });
  carousel.addEventListener("mouseleave", () => { hover = false; });
  if (dotsEl) dotsEl.addEventListener("click", (e) => { const d = e.target.closest("[data-i]"); if (d) { goTo(parseInt(d.dataset.i, 10)); start(); } });
  const onDown = (x) => { dragging = true; dragStartX = x; dragDelta = 0; track.style.transition = "none"; stop(); };
  const onMove = (x) => { if (!dragging) return; dragDelta = x - dragStartX; const base = cardWidth() * index; const dir = (document.dir || "rtl") === "rtl" ? 1 : -1; track.style.transform = `translateX(${dir * base + dragDelta}px)`; };
  const onUp = () => { if (!dragging) return; dragging = false; const threshold = Math.min(80, cardWidth() * 0.2); if (Math.abs(dragDelta) > threshold) { const rtl = (document.dir || "rtl") === "rtl"; if ((rtl && dragDelta < 0) || (!rtl && dragDelta > 0)) goTo(index + 1); else goTo(index - 1); } else goTo(index); start(); };
  carousel.addEventListener("pointerdown", (e) => { if (e.target.closest("a,button,input")) return; carousel.setPointerCapture(e.pointerId); onDown(e.clientX); });
  carousel.addEventListener("pointermove", (e) => onMove(e.clientX));
  carousel.addEventListener("pointerup", onUp);
  carousel.addEventListener("pointercancel", onUp);
  window.addEventListener("resize", () => { computeVisible(); index = Math.min(index, maxIndex()); buildDots(); goTo(index, false); });
  goTo(0, false); start();
}
function bindOncallCarousel() { bindCarousel("oncallCarousel", "oncallDots"); }
function bindFeaturedDoctorsCarousel() { bindCarousel("featuredDoctorsCarousel", "featuredDoctorsDots"); }
/* Fleming: carousel dot indicators â€” show how many cards are visible and which is active */
function bindScrollDots(scrollId, dotsId) {
  const scroll = $("#" + scrollId);
  const dots = $("#" + dotsId);
  if (!scroll || !dots) return;
  const count = scroll.querySelectorAll(":scope > *").length;
  if (count < 2) return;
  const html = Array.from({ length: count }, (_, i) =>
    `<button class="scroll-dot" data-i="${i}" aria-label="Ø§Ù„Ø¹Ù†ØµØ± ${i + 1}" ${i === 0 ? "aria-current=\"true\"" : ""}></button>`).join("");
  dots.innerHTML = html;
  const update = () => {
    const cardWidth = scroll.querySelector(":scope > *").offsetWidth;
    const left = scroll.scrollLeft;
    const idx = Math.round(left / (cardWidth + 14));
    dots.querySelectorAll(".scroll-dot").forEach((d, i) => {
      const on = i === idx;
      d.classList.toggle("active", on);
      d.setAttribute("aria-current", on ? "true" : "false");
    });
  };
  scroll.addEventListener("scroll", update, { passive: true });
  dots.addEventListener("click", (ev) => {
    const b = ev.target.closest(".scroll-dot");
    if (!b) return;
    const i = +b.dataset.i;
    const cardWidth = scroll.querySelector(":scope > *").offsetWidth;
    scroll.scrollTo({ left: i * (cardWidth + 14), behavior: "smooth" });
  });
}

/* ================= Ø§Ù„Ø¹Ø±Ø¶: Ù‚ÙˆØ§Ø¦Ù… Ø§Ù„Ø¬Ù‡Ø§Øª ================= */
const TYPE_INTRO = {
  doctor: "Ø¹ÙŠØ§Ø¯Ø§Øª ÙˆØ£Ø·Ø¨Ø§Ø¡ Ø¯Ø§Ø®Ù„ Ù…Ø¯ÙŠÙ†Ø© ØµÙˆØ±Ø§Ù† Ù…Ø¹ Ø§Ù„ØªØ®ØµØµØ§Øª ÙˆØ£ÙˆÙ‚Ø§Øª Ø§Ù„Ø¹Ù…Ù„ ÙˆØ£Ø±Ù‚Ø§Ù… Ø§Ù„Ø§ØªØµØ§Ù„ Ø§Ù„Ù…Ø¨Ø§Ø´Ø±.",
  pharmacy: "ØµÙŠØ¯Ù„ÙŠØ§Øª Ø§Ù„Ù…Ø¯ÙŠÙ†Ø© Ù…Ø¹ Ø£ÙˆÙ‚Ø§Øª Ø§Ù„Ø¹Ù…Ù„ ÙˆØ´Ø§Ø±Ø© Â«Ù…Ù†Ø§ÙˆØ¨Ø© Ø§Ù„ÙŠÙˆÙ…Â» Ù„Ù„ØµÙŠØ¯Ù„ÙŠØ§Øª Ø§Ù„Ù…Ù†Ø§ÙˆØ¨Ø© Ø­Ø§Ù„ÙŠØ§Ù‹.",
  hospital: "Ø§Ù„Ù…Ø´Ø§ÙÙŠ ÙˆØ§Ù„Ù…Ø³ØªÙˆØµÙØ§Øª ÙÙŠ ØµÙˆØ±Ø§Ù†: Ø®Ø¯Ù…Ø§ØªÙ‡Ø§ ÙˆØ£Ø±Ù‚Ø§Ù…Ù‡Ø§ ÙˆØ£ÙˆÙ‚Ø§Øª Ø§Ù„Ø¹ÙŠØ§Ø¯Ø§Øª ÙˆØ§Ù„Ø·ÙˆØ§Ø±Ø¦.",
  lab: "Ù…Ø®Ø§Ø¨Ø± Ø§Ù„ØªØ­Ø§Ù„ÙŠÙ„ Ø§Ù„Ø·Ø¨ÙŠØ© Ø¯Ø§Ø®Ù„ Ø§Ù„Ù…Ø¯ÙŠÙ†Ø© Ù…Ø¹ Ø§Ù„Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ù…ØªÙˆÙØ±Ø© ÙˆØ£ÙˆÙ‚Ø§Øª Ø§Ù„Ø³Ø­Ø¨.",
  radiology: "Ù…Ø±Ø§ÙƒØ² Ø§Ù„Ø£Ø´Ø¹Ø© ÙˆØ§Ù„Ø³ÙˆÙ†Ø§Ø±: Ø£Ø¬Ù‡Ø²ØªÙ‡Ø§ ÙˆØ®Ø¯Ù…Ø§ØªÙ‡Ø§ ÙˆÙ…ÙˆØ§Ø¹ÙŠØ¯ Ø¹Ù…Ù„Ù‡Ø§.",
  "health-center": "Ø§Ù„Ù…Ø±Ø§ÙƒØ² Ø§Ù„ØµØ­ÙŠØ© Ø§Ù„Ø­ÙƒÙˆÙ…ÙŠØ© ÙˆØ§Ù„Ø£Ù‡Ù„ÙŠØ©: ØªØ·Ø¹ÙŠÙ…Ø§ØªØŒ Ø±Ø¹Ø§ÙŠØ© Ø£ÙˆÙ„ÙŠØ©ØŒ ÙˆØªØ«Ù‚ÙŠÙ ØµØ­ÙŠ.",
};

function viewList(type, params) {
  const t = TYPES[type];
  const f = state.filters[type];
  const specParam = params.get("spec");
  if (specParam) f.spec = specParam;

  /* Fleming: each type has its own filter set
   - doctors: search + specialization only
   - pharmacies: search + area only
   - labs: area only (region filter)
   - others: search + area + sort */
  const specs = [...new Set(entitiesByType(type).map((e) => e.spec).filter(Boolean))].sort();
  const areas = [...new Set(entitiesByType(type).map((e) => e.area).filter(Boolean))].sort();
  const showSpec = specs.length && type === "doctor";
  const showArea = areas.length && (type === "pharmacy" || type === "lab" || (type !== "doctor" && type !== "pharmacy" && type !== "lab"));
  const showSort = type !== "doctor" && type !== "pharmacy" && type !== "lab";
  const showSearch = type !== "lab";
  const ph = type === "doctor" ? "Ø§Ø¨Ø­Ø« Ø¨Ø§Ø³Ù… Ø§Ù„Ø·Ø¨ÙŠØ¨ Ø£Ùˆ Ø§Ù„ØªØ®ØµØµâ€¦"
    : type === "pharmacy" ? "Ø§Ø¨Ø­Ø« Ø¨Ø§Ø³Ù… Ø§Ù„ØµÙŠØ¯Ù„ÙŠØ©â€¦"
    : "Ø§Ø¨Ø­Ø« Ø¨Ø§Ù„Ø§Ø³Ù…â€¦";

  const specSel = showSpec ? `
    <div class="spec-filter" id="specFilter" data-open="false">
      <button class="spec-filter-btn" id="fSpecBtn" type="button" aria-haspopup="listbox" aria-expanded="false" aria-label="ØªØµÙÙŠØ© Ø­Ø³Ø¨ Ø§Ù„ØªØ®ØµØµ">
        <span class="spec-filter-label">${esc(f.spec || "ÙƒÙ„ Ø§Ù„ØªØ®ØµØµØ§Øª")}</span>
        ${icon("chevLeft")}
      </button>
      <div class="spec-filter-panel hero-suggest" id="fSpecPanel" hidden>
        <button class="suggest-item" type="button" data-spec="">
          <span class="s-icon" style="--tc:var(--primary)">${icon("search")}</span>
          <span class="r-body"><strong>ÙƒÙ„ Ø§Ù„ØªØ®ØµØµØ§Øª</strong><small>Ø¹Ø±Ø¶ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£Ø·Ø¨Ø§Ø¡</small></span>
        </button>
        ${specs.map((s) => `
        <button class="suggest-item" type="button" data-spec="${esc(s)}">
          <span class="s-icon" style="--tc:var(--primary)">${icon("steth")}</span>
          <span class="r-body"><strong>${esc(s)}</strong><small>ØªØµÙÙŠØ© Ø§Ù„Ù†ØªØ§Ø¦Ø¬</small></span>
        </button>`).join("")}
      </div>
    </div>` : "";

  const areaSel = showArea ? `
    <select id="fArea" aria-label="ØªØµÙÙŠØ© Ø­Ø³Ø¨ Ø§Ù„Ù…Ù†Ø·Ù‚Ø©">
      <option value="">ÙƒÙ„ Ø§Ù„Ù…Ù†Ø§Ø·Ù‚</option>
      ${areas.map((a) => `<option value="${esc(a)}" ${f.area === a ? "selected" : ""}>${esc(a)}</option>`).join("")}
    </select>` : "";

  const sortSel = showSort ? `
    <select id="fSort" aria-label="ØªØ±ØªÙŠØ¨ Ø§Ù„Ù†ØªØ§Ø¦Ø¬">
      <option value="featured" ${f.sort === "featured" ? "selected" : ""}>Ø§Ù„Ù…Ù…ÙŠØ²ÙˆÙ† Ø£ÙˆÙ„Ø§Ù‹</option>
      <option value="name" ${f.sort === "name" ? "selected" : ""}>Ø§Ù„Ø§Ø³Ù… (Ø£-ÙŠ)</option>
    </select>` : "";

  const clearBtn = (f.q || f.spec || f.area) ? `<button class="btn btn-ghost btn-sm" id="fClear" type="button">${icon("searchX")} Ù…Ø³Ø­ Ø§Ù„ØªØµÙÙŠØ©</button>` : "";

  return `
  <section class="page-hero">
    <div class="container">
      <nav class="breadcrumb" aria-label="Ù…Ø³Ø§Ø± Ø§Ù„ØªÙ†Ù‚Ù„">
        <a href="#/">Ø§Ù„ Principal</a> ${icon("chevLeft")} <span>${t.plural}</span>
      </nav>
      <h1>${icon(t.icon)} ${t.plural} ÙÙŠ ØµÙˆØ±Ø§Ù†</h1>
      <p>${TYPE_INTRO[type]}</p>
    </div>
  </section>
  <div class="container">
    <div class="toolbar">
      ${showSearch ? `<div class="search-field">${icon("search")}<input id="fQ" type="search" placeholder="${ph}" value="${esc(f.q)}" /></div>` : ""}
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
  if (count) count.innerHTML = `<b>${fmtNum(list.length)}</b> Ù†ØªÙŠØ¬Ø©`;
  if (!body) return;
  body.innerHTML = list.length
    ? `<div class="cards-grid" style="padding-bottom:52px">${list.map((e) => entityCard(e)).join("")}</div>`
    : `<div class="empty-state" style="margin-bottom:52px">
        ${icon("search")}<h3>Ù„Ø§ ØªÙˆØ¬Ø¯ Ù†ØªØ§Ø¦Ø¬ Ù…Ø·Ø§Ø¨Ù‚Ø©</h3>
        <p>Ø¬Ø±Ù‘Ø¨ ØªØ¹Ø¯ÙŠÙ„ ÙƒÙ„Ù…Ø© Ø§Ù„Ø¨Ø­Ø« Ø£Ùˆ Ø¥Ø²Ø§Ù„Ø© Ø¹ÙˆØ§Ù…Ù„ Ø§Ù„ØªØµÙÙŠØ©.</p>
       </div>`;
}

function bindList(type) {
  const f = state.filters[type];
  const q = $("#fQ"), area = $("#fArea"), sort = $("#fSort"), clear = $("#fClear");
  let deb;
  if (q) q.addEventListener("input", () => {
    clearTimeout(deb);
    deb = setTimeout(() => { f.q = q.value.trim(); applyList(type); }, 180);
  });
  const specFilter = $("#specFilter"), specBtn = $("#fSpecBtn"), specPanel = $("#fSpecPanel");
  if (specFilter && specBtn && specPanel) {
    const closeSpec = () => { specPanel.hidden = true; specBtn.setAttribute("aria-expanded", "false"); specFilter.dataset.open = "false"; };
    const openSpec = () => { specPanel.hidden = false; specBtn.setAttribute("aria-expanded", "true"); specFilter.dataset.open = "true"; };
    specBtn.addEventListener("click", (e) => { e.stopPropagation(); specPanel.hidden ? openSpec() : closeSpec(); });
    specPanel.addEventListener("click", (e) => {
      const b = e.target.closest("[data-spec]");
      if (!b) return;
      f.spec = b.getAttribute("data-spec") || "";
      closeSpec();
      applyList(type);
      const lbl = specBtn.querySelector(".spec-filter-label");
      if (lbl) lbl.textContent = f.spec || "ÙƒÙ„ Ø§Ù„ØªØ®ØµØµØ§Øª";
      specPanel.querySelectorAll(".suggest-item").forEach((it) => it.classList.toggle("is-active", (it.getAttribute("data-spec") || "") === f.spec));
    });
    specPanel.querySelectorAll(".suggest-item").forEach((it) => it.classList.toggle("is-active", (it.getAttribute("data-spec") || "") === f.spec));
    document.addEventListener("click", (e) => { if (!specFilter.contains(e.target)) closeSpec(); }, { once: false });
  }
  if (area) area.addEventListener("change", () => { f.area = area.value; applyList(type); });
  if (sort) sort.addEventListener("change", () => { f.sort = sort.value; applyList(type); });
  if (clear) clear.addEventListener("click", () => {
    f.q = ""; f.spec = ""; f.area = ""; f.sort = "featured";
    render();
  });
  applyList(type);
}

/* ================= Ø§Ù„Ø¹Ø±Ø¶: Ø§Ù„Ù…Ù†Ø§ÙˆØ¨Ø© ================= */
function viewOncall(params) {
  const raw = params.get("day");
  const parsed = raw === null || raw === "" ? NaN : parseInt(raw, 10);
  const day = Number.isNaN(parsed) ? state.oncallDay : Math.min(6, Math.max(0, parsed));
  state.oncallDay = day;
  const today = todayIdx();
  const list = oncallPharmacies(DAYS[day]);
  const note = day === today
    ? "Ù‡Ø°Ù‡ ØµÙŠØ¯Ù„ÙŠØ§Øª Ø§Ù„Ù…Ù†Ø§ÙˆØ¨Ø© Ø§Ù„ÙŠÙˆÙ… â€” Ø§ØªØµÙ„ Ù‚Ø¨Ù„ Ø§Ù„ØªÙˆØ¬Ù‡ Ù„Ù„ØªØ£ÙƒØ¯ Ù…Ù† ØªÙˆÙØ± Ø§Ù„Ø¯ÙˆØ§Ø¡ Ø§Ù„Ù…Ø·Ù„ÙˆØ¨."
    : "Ù‡Ø°Ù‡ ØµÙŠØ¯Ù„ÙŠØ§Øª Ø§Ù„Ù…Ù†Ø§ÙˆØ¨Ø© Ù„Ù„ÙŠÙˆÙ… Ø§Ù„Ù…Ø­Ø¯Ø¯ â€” Ù‚Ø¯ ØªØªØºÙŠØ± Ø§Ù„Ø¬Ø¯ÙˆÙ„Ø©ØŒ ØªØ§Ø¨Ø¹ ØªØ­Ø¯ÙŠØ«Ø§Øª Ø§Ù„Ø¯Ù„ÙŠÙ„.";

  const tabs = DAYS.map((d, i) => `
    <button class="day-tab ${i === day ? "active" : ""}" type="button" data-day="${i}">
      ${d}${i === today ? '<span class="t-badge">Ø§Ù„ÙŠÙˆÙ…</span>' : ""}
    </button>`).join("");

  const cards = list.length ? list.map((p) => oncallCard(p)).join("")
    : `<div class="empty-state">${icon("pill")}<h3>Ù„Ø§ ØªÙˆØ¬Ø¯ ØµÙŠØ¯Ù„ÙŠØ§Øª Ù…Ù†Ø§ÙˆØ¨Ø© Ù…Ø³Ø¬Ù„Ø©</h3><p>Ø±Ø§Ø¬Ø¹ Ø¬Ø¯ÙˆÙ„ Ø¨Ù‚ÙŠØ© Ø§Ù„Ø£ÙŠØ§Ù… Ø£Ùˆ ØªÙˆØ§ØµÙ„ Ù…Ø¹ Ø§Ù„Ø§Ø³ØªØ¹Ù„Ø§Ù…Ø§Øª.</p></div>`;

return `
  <section class="page-hero">
    <div class="container">
      <nav class="breadcrumb" aria-label="Ù…Ø³Ø§Ø± Ø§Ù„ØªÙ†Ù‚Ù„">
        <a href="#/">Ø§Ù„Principal</a> ${icon("chevLeft")} <a href="#/pharmacies">Ø§Ù„sidliØ§Øª</a> ${icon("chevLeft")} <span>Ø§Ù„Ù…Ù†Ø§ÙˆØ¨Ø©</span>
      </nav>
      <h1>${icon("ambulance")} sidliØ§Øª Ø§Ù„Ù…Ù†Ø§Ø¸Ø±Ø©</h1>
      <p>Ø¬Ø¯ÙˆÙ„ Ø§Ù„Ù…Ù†Ø§Ø¸Ø±Ø© Weekly Ù„sidliØ§Øª Ù…Ø¯ÙŠÙ†Ø© ØµÙˆØ±Ø§Ù†. Ø§Ø®ØªØ± Ø§Ù„ÙŠÙˆÙ… Ù„Ø¹Ø±Ø¶ sidliØ§Øª Ø§Ù„ØªÙŠ ØªØ¹Ù…Ù„ Ø®Ø§Ø±Ø¬ Ø£ÙˆÙ‚Ø§Øª Ø§Ù„Ø¯ÙˆØ§Ù….</p>
    </div>
  </section>
  <div class="container oncall-page" style="padding:26px 0 56px">
    <div class="day-tabs" role="tablist" aria-label="Ø£ÙŠØ§Ù… Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹">${tabs}</div>
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

/* ================= Ø§Ù„Ø¹Ø±Ø¶: ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø¬Ù‡Ø© ================= */
function viewEntity(id) {
  const e = entityById(id);
  if (!e) return view404();
  const t = TYPES[e.type];
  /* related: same area first, then same type, excluding self */
  const sameArea = entitiesByType(e.type).filter((x) => x.id !== e.id && x.area === e.area);
  const otherArea = entitiesByType(e.type).filter((x) => x.id !== e.id && x.area !== e.area);
  const related = [...sameArea, ...otherArea].slice(0, 4);

  const badges = [];
  if (e.type === "doctor") badges.push(`<span class="badge badge-blue">${icon("briefcase")} Ø®Ø¨Ø±Ø© ${fmtNum(e.exp)} Ø³Ù†Ø©</span>`);

  const services = (e.services || []).map((s) => `<span class="mini-tag">${esc(s)}</span>`).join("");

  return `
  <section class="page-hero detail-hero">
    <div class="container">
      <nav class="breadcrumb" aria-label="Ù…Ø³Ø§Ø± Ø§Ù„ØªÙ†Ù‚Ù„">
        <a href="#/">Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©</a> ${icon("chevLeft")} <a href="#/${routeSlug(e.type)}">${t.plural}</a> ${icon("chevLeft")} <span>${esc(e.name)}</span>
      </nav>
      <div class="detail-card" style="--tc:${t.color}">
        <div class="detail-banner"></div>
        <div class="detail-main">
          <span class="detail-avatar" style="--tc:${t.color}">${e.image_url ? `<img src="${esc(e.image_url)}" alt="${esc(e.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />` : icon(t.icon)}</span>
          <div class="detail-title">
            <h1>${esc(e.name)}</h1>
            <p class="sub">${e.spec ? esc(e.spec) + " â€” " : ""}${esc(e.degree || t.label)}${e.owner ? " Â· " + esc(e.owner) : ""}</p>
            <div class="entity-badges">${badges.join("")}</div>
          </div>
        </div>
        <div class="detail-actions">
          ${e.phone ? `<a class="btn btn-primary btn-lg" href="tel:${e.phone}">${icon("phone")} Ø§ØªØµØ§Ù„ Ø§Ù„Ø¢Ù† â€” <span dir="ltr">${fmtPhone(e.phone)}</span></a>` : ""}
          ${e.whatsapp ? `<a class="btn btn-ghost" href="${waHref(e.phone)}" target="_blank" rel="noopener">${icon("chat")} ÙˆØ§ØªØ³Ø§Ø¨</a>` : ""}
          ${e.type !== "pharmacy" && e.type !== "doctor" ? `<a class="btn btn-outline" href="${mapsLink(e.lat, e.lng, e.address)}" target="_blank" rel="noopener">${icon("pin")} Ø§Ù„Ù…ÙˆÙ‚Ø¹</a>` : ""}
          ${e.type !== "pharmacy" ? `<button class="btn btn-ghost" type="button" data-copy="${esc(e.phone)}">${icon("copy")} Ù†Ø³Ø® Ø§Ù„Ø±Ù‚Ù…</button>` : ""}
          <button class="btn btn-ghost btn-icon" type="button" id="btnShare" title="Ù…Ø´Ø§Ø±ÙƒØ©" aria-label="Ù…Ø´Ø§Ø±ÙƒØ©">${icon("share")}</button>
        </div>
        <div class="detail-info">
          <div class="info-box">${icon("pin")}
            <div><h4>Ø§Ù„Ø¹Ù†ÙˆØ§Ù†</h4><p>${esc(e.area)}</p><small>${esc(e.address)}</small></div>
          </div>
          <div class="info-box">${icon("clock")}
            <div><h4>Ø£ÙˆÙ‚Ø§Øª Ø§Ù„Ø¹Ù…Ù„</h4><p>${esc(e.hours)}</p></div>
          </div>
          <div class="info-box">${icon("phone")}
            <div><h4>Ø§Ù„Ù‡Ø§ØªÙ</h4><p class="phone-line"><span dir="ltr">${fmtPhone(e.phone)}</span></p>
            <small>Ø§Ø¶ØºØ· Ø²Ø± Ø§Ù„Ø§ØªØµØ§Ù„ Ø£Ø¹Ù„Ø§Ù‡ Ù„Ù„Ø§ØªØµØ§Ù„ Ù…Ø¨Ø§Ø´Ø±Ø©</small></div>
          </div>
          ${e.type === "doctor" ? `
          <div class="info-box">${icon("user")}
            <div><h4>Ø§Ù„ØµÙØ©</h4><p>${esc(e.degree)}</p><small>${esc(e.spec)}</small></div>
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
      <div class="section-head"><div><h2>${e.type === "doctor" ? "Ø§Ù„ØªØ®ØµØµØ§Øª ÙˆØ§Ù„Ø®Ø¯Ù…Ø§Øª" : "Ø§Ù„Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ù…ØªÙˆÙØ±Ø©"}</h2></div></div>
      <div class="chips-lg">${services}</div>
    </div>` : ""}

    <div class="detail-section">
      <div class="section-head"><div><h2>Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ø¹Ù„Ù‰ Ø§Ù„Ø®Ø±ÙŠØ·Ø©</h2><p>${esc(e.area)} â€” ${esc(e.address)}</p></div></div>
      <div class="map-wrap"><div id="entityMap"></div></div>
      <p class="map-note">${icon("info")} Ø§Ù„Ù…ÙˆÙ‚Ø¹ ØªÙ‚Ø±ÙŠØ¨ÙŠ â€” Ø§Ø³ØªØ®Ø¯Ù… ØªØ·Ø¨ÙŠÙ‚ Ø§Ù„Ø®Ø±Ø§Ø¦Ø· Ø¹Ù„Ù‰ Ù‡Ø§ØªÙÙƒ Ù„Ù„ÙˆØµÙˆÙ„ Ø§Ù„Ø¯Ù‚ÙŠÙ‚.</p>
    </div>

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
      try { await navigator.share({ title: e.name + " â€” Ø¯Ù„ÙŠÙ„ ØµÙˆØ±Ø§Ù† Ø§Ù„Ø·Ø¨ÙŠ", url }); } catch (_) {}
    } else {
      navigator.clipboard && navigator.clipboard.writeText(url);
      showToast("ØªÙ… Ù†Ø³Ø® Ø±Ø§Ø¨Ø· Ø§Ù„ØµÙØ­Ø©");
    }
  });
}

/* ================= Ø§Ù„Ø¹Ø±Ø¶: Ø§Ø³Ø£Ù„ Ø·Ø¨ÙŠØ§Ù‹ ================= */
function viewAsk() {
  return `
  <section class="page-hero">
    <div class="container">
      <nav class="breadcrumb" aria-label="Ù…Ø³Ø§Ø± Ø§Ù„ØªÙ†Ù‚Ù„">
        <a href="#/">Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©</a> ${icon("chevLeft")} <span>Ø§Ø³Ø£Ù„</span>
      </nav>
      <h1>${icon("chat")} Ø§Ø³Ø£Ù„</h1>
      <p>Ø§ÙƒØªØ¨ Ø³Ø¤Ø§Ù„Ùƒ ÙˆØ³ØªØ±Ù‰ Ø§Ù„Ø¬ÙˆØ§Ø¨. Ù„Ù„Ø­Ø§Ù„Ø§Øª Ø§Ù„Ø·Ø§Ø±Ø¦Ø© Ø§ØªØµÙ„ Ø¨Ø§Ù„Ø¥Ø³Ø¹Ø§Ù.</p>
    </div>
  </section>
<div class="container page-wrap">
  <div class="form-card" style="max-width:720px;margin:0 auto 24px">
    <div class="field">
      <label for="askQ" style="font-size:18px">Ø³Ø¤Ø§Ù„Ùƒ</label>
      <input id="askQ" type="text" placeholder="Ø§ÙƒØªØ¨ Ø³Ø¤Ø§Ù„Ùƒ Ù‡Ù†Ø§â€¦" style="font-size:18px;margin-bottom:16px" />
    </div>
    <button id="askSearchBtn" class="btn btn-primary btn-block" type="button" style="font-size:18px;padding:14px">${icon("search")} Ø¨Ø­Ø«</button>
  </div>

<div class="my-questions" id="myQuestions"></div>
  <div class="form-card" style="max-width:720px;margin:24px auto 0">
    <form id="askForm" class="form-grid" novalidate>
      <div class="field">
        <label for="aqText" style="font-size:18px"> neutrally Ø³Ø¤Ø§Ù„ Ø¬Ø¯ÙŠØ¯</label>
        <textarea id="aqText" placeholder="Ø§ÙƒØªØ¨ Ø³Ø¤Ø§Ù„Ùƒ Ù‡Ù†Ø§â€¦" required style="font-size:18px;min-height:120px"></textarea>
      </div>
      <div class="field">
        <label for="aqPhone">Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)</label>
        <input id="aqPhone" type="tel" inputmode="tel" placeholder="09XX XXX XXX" dir="ltr" style="text-align:end;font-size:18px" />
      </div>
      <button class="btn btn-primary btn-block" type="submit" style="font-size:18px;padding:14px">${icon("send")} neutrally</button>
    </form>
  </div>`;
}

function applyFaq() {
  const list = $("#faqList");
  if (!list) return;
  const nq = state.askQuery.trim().toLowerCase();
  const items = FAQ.filter((f) =>
    (state.askCat === "Ø§Ù„ÙƒÙ„" || f.cat === state.askCat) &&
    (!nq || (f.q + " " + f.a + " " + f.cat).toLowerCase().includes(nq)));
  list.innerHTML = items.length
    ? items.map((f) => `
      <details class="acc-item">
        <summary><span class="acc-q">ØŸ</span> ${esc(f.q)} <span class="acc-cat">${esc(f.cat)}</span>${icon("chevDown", "chev")}</summary>
        <div class="acc-body"><p>${esc(f.a)}</p></div>
      </details>`).join("")
    : `<div class="empty-state">${icon("search")}<h3>Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¥Ø¬Ø§Ø¨Ø© Ù…Ø·Ø§Ø¨Ù‚Ø©</h3><p>Ø¬Ø±Ù‘Ø¨ ÙƒÙ„Ù…Ø§Øª Ø£Ø®Ø±Ù‰ Ø£Ùˆ Ø£Ø±Ø³Ù„ Ø³Ø¤Ø§Ù„Ùƒ Ù…Ù† Ø§Ù„Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„Ù…Ø¬Ø§ÙˆØ±.</p></div>`;
}

function myQuestionsHtml() {
  let arr = [];
  try { arr = JSON.parse(localStorage.getItem("ds-questions") || "[]"); } catch (_) {}
  if (!arr.length) return "";
  return `
    <h3 style="font-size:16px">${icon("doc")} Ø£Ø³Ø¦Ù„ØªÙŠ Ø§Ù„Ù…Ø±Ø³Ù„Ø©</h3>
    ${arr.map((q, i) => `
      <div class="my-q-item">
        <p>${esc(q.text)}
          <span class="my-q-meta">${esc(q.date)} Â· <strong style="color:var(--accent-600)">Ù‚ÙŠØ¯ Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø©</strong></span>
        </p>
        <button class="my-q-del" type="button" data-del-q="${i}" title="Ø­Ø°Ù Ø§Ù„Ø³Ø¤Ø§Ù„" aria-label="Ø­Ø°Ù Ø§Ù„Ø³Ø¤Ø§Ù„">${icon("x")}</button>
      </div>`).join("")}`;
}

function bindAsk() {
  const q = $("#askQ");
  if (q) q.addEventListener("input", () => { state.askQuery = q.value; });

  /* Fleming: click a suggested chip to populate search */
  $$(".suggested-chip").forEach((c) =>
    c.addEventListener("click", () => {
      const text = c.getAttribute("data-q") || "";
      if (q) q.value = text;
      state.askQuery = text;
      const btn = $("#askSearchBtn");
      if (btn) btn.click();
    }));

  const btn = $("#askSearchBtn");
  if (btn) btn.addEventListener("click", () => {
    const v = q ? q.value.trim() : "";
    if (!v) { showToast("Ø§ÙƒØªØ¨ Ø³Ø¤Ø§Ù„Ø§Ù‹ Ø£Ùˆ Ø§Ø®ØªØ± Ù…Ù† Ù…Ù‚ØªØ±Ø­Ø§Øª", "warn"); return; }
    state.askQuery = v;
    const url = "#/search?q=" + encodeURIComponent(v);
    location.hash = url;
  });

  const form = $("#askForm");
  if (form) form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const text = $("#aqText").value.trim();
    if (text.length < 10) { showToast("Ø§ÙƒØªØ¨ Ø³Ø¤Ø§Ù„Ø§Ù‹ Ø£ÙˆØ¶Ø­ (10 Ø£Ø­Ø±Ù Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„)", "warn"); return; }
    const nameEl = $("#aqName");
const nameVal = nameEl ? nameEl.value.trim() : "";
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
      sent ? "ØªÙ… Ø§Ø³ØªÙ„Ø§Ù… Ø³Ø¤Ø§Ù„Ùƒ â€” Ø³ÙŠÙØ±Ø§Ø¬Ø¹ Ù‚Ø±ÙŠØ¨Ø§Ù‹" : "Ø­ÙÙØ¸ Ø³Ø¤Ø§Ù„Ùƒ Ù…Ø­Ù„ÙŠØ§Ù‹ (ØªØ¹Ø°Ù‘Ø± Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ø§Ù„Ø®Ø§Ø¯Ù…)",
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
      showToast("ØªÙ… Ø­Ø°Ù Ø§Ù„Ø³Ø¤Ø§Ù„");
    });
  }
}

/* ================= Ø§Ù„Ø¹Ø±Ø¶: Ù†ØªØ§Ø¦Ø¬ Ø§Ù„Ø¨Ø­Ø« (Ù†Ù…Ø· SearchPage) ================= */
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
              <small>${esc(e.spec || t.label)}${e.area ? " â€” " + esc(e.area) : ""}</small>
            </span>
          </a>`).join("")}
      </div>
    </section>`;
  }).join("");

  const faqSection = faqs.length ? `
    <section class="s-group">
      <h2 class="group-title"><span class="g-sq" style="--tc:var(--gold-dark)"></span>Ø£Ø³Ø¦Ù„Ø© ÙˆØ£Ø¬ÙˆØ¨Ø© <span class="g-count">(${fmtNum(faqs.length)})</span></h2>
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
    <h1 class="page-title">Ø§Ù„Ø¨Ø­Ø« ÙÙŠ Ø¯Ù„ÙŠÙ„ ØµÙˆØ±Ø§Ù† Ø§Ù„Ø·Ø¨ÙŠ</h1>
    <form class="search-big" id="searchBigForm">
      ${icon("search")}
      <input id="searchBigInput" type="search" placeholder="Ø§Ø¨Ø­Ø« Ø¹Ù† Ø·Ø¨ÙŠØ¨ØŒ Ø§Ø®ØªØµØ§ØµØŒ Ø¹ÙŠØ§Ø¯Ø©ØŒ ØµÙŠØ¯Ù„ÙŠØ© Ø£Ùˆ Ø®Ø¯Ù…Ø© Ø·Ø¨ÙŠØ©..." value="${esc(q)}" autocomplete="off" />
      <button class="btn btn-primary" type="submit">Ø¨Ø­Ø«</button>
    </form>

    <div class="s-groups">
      ${!q.trim() ? `<p class="s-hint">Ø§ÙƒØªØ¨ ÙƒÙ„Ù…Ø© Ø¨Ø­Ø« Ù„Ù„Ø¨Ø¯Ø¡.</p>` : total ? groupSections + faqSection : `
      <div class="empty-state s-empty">
        ${icon("searchX")}
        <h3>Ù„Ø§ ØªÙˆØ¬Ø¯ Ù†ØªØ§Ø¦Ø¬ Ù„Ù€ Â«${esc(q)}Â»</h3>
        <p>Ø¬Ø±Ù‘Ø¨ ÙƒÙ„Ù…Ø§Øª Ø¨Ø­Ø« Ø£Ø®Ø±Ù‰ Ø£Ùˆ ØªØµÙØ­ Ø§Ù„Ø£Ù‚Ø³Ø§Ù… Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©.</p>
        <div class="chip-row" style="justify-content:center;margin-top:12px">
          <a class="chip" href="#/doctors">Ø§Ù„Ø£Ø·Ø¨Ø§Ø¡</a>
          <a class="chip" href="#/pharmacies">Ø§Ù„ØµÙŠØ¯Ù„ÙŠØ§Øª</a>
          <a class="chip" href="#/oncall">Ø§Ù„ØµÙŠØ¯Ù„ÙŠØ§Øª Ø§Ù„Ù…Ù†Ø§ÙˆØ¨Ø©</a>
          <a class="chip" href="#/ask">Ø§Ø³Ø£Ù„</a>
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

/* ================= Ø§Ù„ØµÙØ­Ø§Øª Ø§Ù„Ø«Ø§Ø¨ØªØ© ================= */
function viewAbout() {
  const features = [
    { ic: "stetho", t: "Ø§Ù„Ø£Ø·Ø¨Ø§Ø¡ ÙˆØ§Ù„Ø¹ÙŠØ§Ø¯Ø§Øª", d: "Ø¯Ù„ÙŠÙ„ ÙƒØ§Ù…Ù„ Ù„Ù„Ø£Ø·Ø¨Ø§Ø¡ Ù…Ø¹ Ø§Ù„ØªØ®ØµØµØ§Øª ÙˆØ³Ù†ÙˆØ§Øª Ø§Ù„Ø®Ø¨Ø±Ø© ÙˆØ£Ø±Ù‚Ø§Ù… Ø§Ù„ØªÙˆØ§ØµÙ„ Ø§Ù„Ù…Ø¨Ø§Ø´Ø±." },
    { ic: "pill", t: "Ø§Ù„ØµÙŠØ¯Ù„ÙŠØ§Øª", d: "ØµÙŠØ¯Ù„ÙŠØ§Øª Ø§Ù„Ù…Ø¯ÙŠÙ†Ø© Ù…Ø¹ Ø£ÙˆÙ‚Ø§Øª Ø§Ù„Ø¯ÙˆØ§Ù… ÙˆØ´Ø§Ø±Ø© Â«ØªØ¹Ù…Ù„ 24 Ø³Ø§Ø¹Ø©Â»." },
    { ic: "moon", t: "ØµÙŠØ¯Ù„ÙŠØ§Øª Ø§Ù„Ù…Ù†Ø§ÙˆØ¨Ø©", d: "Ø¬Ø¯ÙˆÙ„ Ø§Ù„Ù…Ù†Ø§ÙˆØ¨Ø© Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹ÙŠ â€” Ø§Ø¹Ø±Ù Ø§Ù„ØµÙŠØ¯Ù„ÙŠØ© Ø§Ù„Ù…ÙØªÙˆØ­Ø© Ø§Ù„ÙŠÙˆÙ… ÙÙˆØ±Ø§Ù‹." },
    { ic: "hospital", t: "Ø§Ù„Ù…Ø´Ø§ÙÙŠ ÙˆØ§Ù„Ù…Ø±Ø§ÙƒØ²", d: "Ø§Ù„Ù…Ø´Ø§ÙÙŠ ÙˆØ§Ù„Ù…Ø±Ø§ÙƒØ² Ø§Ù„ØµØ­ÙŠØ© ÙˆØ§Ù„Ù…Ø®Ø§Ø¨Ø± ÙˆÙ…Ø±Ø§ÙƒØ² Ø§Ù„Ø£Ø´Ø¹Ø© ÙÙŠ Ù…ÙƒØ§Ù† ÙˆØ§Ø­Ø¯." },
    { ic: "map", t: "Ø®Ø±ÙŠØ·Ø© ØªÙØ§Ø¹Ù„ÙŠØ©", d: "Ù…ÙˆØ§Ù‚Ø¹ ÙƒÙ„ Ø§Ù„Ø¬Ù‡Ø§Øª Ø¹Ù„Ù‰ Ø®Ø±ÙŠØ·Ø© Ø§Ù„Ù…Ø¯ÙŠÙ†Ø© Ù…Ø¹ Ø£Ù‚ØµØ± Ø·Ø±ÙŠÙ‚ Ù„Ù„ÙˆØµÙˆÙ„." },
    { ic: "chat", t: "Ø§Ø³Ø£Ù„ Ø·Ø¨ÙŠØ§Ù‹", d: "Ø¥Ø±Ø´Ø§Ø¯Ø§Øª ØµØ­ÙŠØ© Ù…ÙˆØ«ÙˆÙ‚Ø© ÙˆÙ…Ø¨Ø³Ø·Ø©ØŒ ÙˆØ¥Ø±Ø³Ø§Ù„ Ø£Ø³Ø¦Ù„ØªÙƒ Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ø¯Ù„ÙŠÙ„ Ù…Ø¨Ø§Ø´Ø±Ø©." },
  ];
  const stats = [
    { n: fmtNum(ENTITIES.length), l: "Ø¬Ù‡Ø© Ø·Ø¨ÙŠØ©" },
    { n: fmtNum(entitiesByType("doctor").length), l: "Ø·Ø¨ÙŠØ¨ ÙˆØ¹ÙŠØ§Ø¯Ø©" },
    { n: fmtNum(entitiesByType("pharmacy").length), l: "ØµÙŠØ¯Ù„ÙŠØ©" },
    { n: "6", l: "Ø£Ù‚Ø³Ø§Ù… Ø·Ø¨ÙŠØ©" },
  ];
  return `
  <div class="container page-wrap">
    <nav class="breadcrumb on-page" aria-label="Ù…Ø³Ø§Ø± Ø§Ù„ØªÙ†Ù‚Ù„">
      <a href="#/">Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©</a> ${icon("chevLeft")} <span>Ø¹Ù† Ø§Ù„Ù…Ù†ØµØ©</span>
    </nav>

    <div class="about-hero">
      <span class="pill-badge">${icon("sparkles")} Ø¹Ù† Ø§Ù„Ù…Ù†ØµØ©</span>
      <h1>Ø¯Ù„ÙŠÙ„ ØµÙˆØ±Ø§Ù† Ø§Ù„Ø·Ø¨ÙŠ</h1>
      <p>Ù…Ù†ØµØ© Ù…Ø¬ØªÙ…Ø¹ÙŠØ© Ù…Ø¬Ø§Ù†ÙŠØ© ØªØ¬Ù…Ø¹ ÙƒÙ„ Ø§Ù„Ø®Ø¯Ù…Ø§Øª Ø§Ù„ØµØ­ÙŠØ© ÙÙŠ Ù…Ø¯ÙŠÙ†Ø© ØµÙˆØ±Ø§Ù† â€” Ø£Ø·Ø¨Ø§Ø¡ØŒ ØµÙŠØ¯Ù„ÙŠØ§ØªØŒ Ù…Ø´Ø§ÙÙŠØŒ Ù…Ø®Ø§Ø¨Ø±ØŒ Ø£Ø´Ø¹Ø© ÙˆÙ…Ø±Ø§ÙƒØ² ØµØ­ÙŠØ© â€” ÙÙŠ Ù…ÙƒØ§Ù† ÙˆØ§Ø­Ø¯ØŒ Ø¨Ø¨ÙŠØ§Ù†Ø§Øª Ù…Ø­Ø¯Ù‘Ø«Ø© ÙˆØ®Ø±ÙŠØ·Ø© ØªÙØ§Ø¹Ù„ÙŠØ© ÙˆØ¬Ø¯ÙˆÙ„ Ù…Ù†Ø§ÙˆØ¨Ø© Ø£Ø³Ø¨ÙˆØ¹ÙŠ.</p>
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
        <h2>Ù…Ø§ Ù‡ÙŠ Ø¯Ù„ÙŠÙ„ ØµÙˆØ±Ø§Ù† Ø§Ù„Ø·Ø¨ÙŠØŸ</h2>
      </div>
      <p class="about-text">
        ÙÙŠ ÙƒÙ„ ÙŠÙˆÙ… ÙŠØ¨Ø­Ø« Ø£Ù‡Ø§Ù„ÙŠ Ù…Ø¯ÙŠÙ†Ø© ØµÙˆØ±Ø§Ù† Ø¹Ù† Ø£Ù‚Ø±Ø¨ Ø¹ÙŠØ§Ø¯Ø© Ø£Ø³Ù†Ø§Ù†ØŒ Ø£Ùˆ Ù…Ø®Ø¨Ø± ÙŠØ¹Ù…Ù„ Ù…Ø³Ø§Ø¡Ù‹ØŒ Ø£Ùˆ ØµÙŠØ¯Ù„ÙŠØ© Ù…Ù†Ø§ÙˆØ¨Ø© Ù„Ù„Ù‘ÙŠÙ„Ø©ØŒ
        Ø£Ùˆ Ø±Ù‚Ù… Ù…Ø´ÙÙ‰ Ù„Ø·Ù„Ø¨ Ø§Ù„Ø¥Ø³Ø¹Ø§Ù. Ø¯Ù„ÙŠÙ„ ØµÙˆØ±Ø§Ù† Ø§Ù„Ø·Ø¨ÙŠ ÙŠØ¬Ù…Ø¹ Ù‡Ø°Ù‡ Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ù…ØªÙØ±Ù‚Ø© ÙÙŠ Ù…ÙƒØ§Ù† ÙˆØ§Ø­Ø¯:
        Ù…Ù†Ø¸Ù‘Ù…Ø©ØŒ Ù…Ø­Ø¯Ù‘Ø«Ø©ØŒ ÙˆÙ…Ø¬Ø§Ù†ÙŠØ© Ù„Ù„Ø¬Ù…ÙŠØ¹ â€” Ù…Ù† Ø£Ø¨Ù†Ø§Ø¡ Ø§Ù„Ù…Ø¯ÙŠÙ†Ø© ÙˆÙ„Ø£Ù‡Ù„Ù‡Ø§.
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
            <p class="dev-tag">Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„Ù…Ø·ÙˆÙ‘Ø±</p>
            <h3>Ù…Ø·ÙˆÙ‘Ø± ÙˆØªÙ‚Ù†ÙŠ Ø¯Ù„ÙŠÙ„ ØµÙˆØ±Ø§Ù† Ø§Ù„Ø·Ø¨ÙŠ</h3>
          </div>
        </div>
        <div class="dev-body">
          <div class="dev-avatar">
            <span>${esc((SITE.developer.name || "Ù…").trim().slice(0, 1))}</span>
            <span class="dev-badge">${icon("badgeCheck")}</span>
          </div>
          <div class="dev-info">
            <p class="dev-name">${esc(SITE.developer.name)}</p>
            <p class="dev-role">${esc(SITE.developer.title || "Ù…Ø·ÙˆÙ‘Ø± Ø§Ù„Ù…Ù†ØµØ©")}</p>
            <p class="dev-desc">ØªØ·ÙˆÙŠØ± ÙˆØ¥Ø´Ø±Ø§Ù ÙÙ†ÙŠ ÙƒØ§Ù…Ù„ Ø¹Ù„Ù‰ Ø§Ù„Ù…Ù†ØµØ© â€” Ù„Ù„Ø¥Ø¨Ù„Ø§Øº Ø¹Ù† Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø£Ùˆ Ø¥Ø¶Ø§ÙØ© Ø¬Ù‡Ø© Ø¬Ø¯ÙŠØ¯Ø© Ø£Ùˆ Ø§Ù„Ø§Ø³ØªÙØ³Ø§Ø±Ø§Øª Ø§Ù„ØªÙ‚Ù†ÙŠØ©ØŒ ØªÙˆØ§ØµÙ„ Ù…Ø¨Ø§Ø´Ø±Ø© Ø¹Ø¨Ø± Ø§Ù„Ù‚Ù†ÙˆØ§Øª Ø§Ù„ØªØ§Ù„ÙŠØ©.</p>
            <div class="dev-actions">
              <a class="dev-btn dev-btn-phone" href="tel:${esc(SITE.developer.phone)}">${icon("phone")} <span dir="ltr">${fmtPhone(SITE.developer.phone)}</span></a>
              ${SITE.developer.instagram ? `<a class="dev-btn dev-btn-ig" href="${esc(SITE.developer.instagram)}" target="_blank" rel="noopener">${icon("instagram")} Ø¥Ù†Ø³ØªØºØ±Ø§Ù…</a>` : ""}
              ${SITE.developer.facebook ? `<a class="dev-btn dev-btn-fb" href="${esc(SITE.developer.facebook)}" target="_blank" rel="noopener">${icon("facebook")} ÙÙŠØ³Ø¨ÙˆÙƒ</a>` : ""}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card support-card">
      <div class="support-row">
        <div>
          <p class="support-title">Ø¥Ø¶Ø§ÙØ© Ø¬Ù‡Ø© Ø£Ùˆ ØªØ¹Ø¯ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª</p>
          <p class="support-sub">Ù„Ø¥Ø¶Ø§ÙØ© Ø¬Ù‡Ø© Ø·Ø¨ÙŠØ© Ø¬Ø¯ÙŠØ¯Ø© Ù„Ù„Ø¯Ù„ÙŠÙ„ Ø£Ùˆ ØªØµØ­ÙŠØ­ Ø£ÙŠ Ø¨ÙŠØ§Ù†Ø§ØªØŒ ØªÙˆØ§ØµÙ„ Ù…Ø¨Ø§Ø´Ø±Ø© Ù…Ø¹ Ù…Ø·ÙˆÙ‘Ø± Ø§Ù„Ù…Ù†ØµØ© Ø¹Ø¨Ø± Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„Ù…Ø·ÙˆÙ‘Ø± Ø£Ø¹Ù„Ø§Ù‡ Ø£Ùˆ Ø§Ù„Ù‡Ø§ØªÙ Ø§Ù„Ù…Ø¬Ø§ÙˆØ±.</p>
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
      <h1>Ø¨Ø§Ù‚Ø§Øª Ø§Ù„Ø§Ø´ØªØ±Ø§Ùƒ</h1>
      <p>Ø§Ø±ØªÙ‚Ù Ø¨Ø¸Ù‡ÙˆØ± ØµÙØ­ØªÙƒ ÙÙŠ Ø¯Ù„ÙŠÙ„ ØµÙˆØ±Ø§Ù† Ø§Ù„Ø·Ø¨ÙŠ â€” ÙŠÙÙØ¹Ù‘Ù„ Ø§Ù„Ø§Ø´ØªØ±Ø§Ùƒ Ù„Ù…Ø¯Ø© Ø´Ù‡Ø± ÙƒØ§Ù…Ù„ Ù…Ù† ØªØ§Ø±ÙŠØ® Ø§Ù„Ù…ÙˆØ§ÙÙ‚Ø©.</p>
      <p class="plans-login">Ù„Ø¯ÙŠÙƒ Ø§Ø´ØªØ±Ø§Ùƒ ÙØ¹Ù‘Ø§Ù„ØŸ <a href="#/login">ØªØ³Ø¬ÙŠÙ„ Ø¯Ø®ÙˆÙ„ Ø§Ù„Ø¬Ù‡Ø© â†</a></p>
    </div>
    <div class="plans-grid">
      ${PACKAGES.map((p) => {
        const waMsg = waHref(SITE.developer.phone, "Ù…Ø±Ø­Ø¨Ø§Ù‹ØŒ Ø£Ø±ØºØ¨ Ø¨Ø§Ù„Ø§Ø´ØªØ±Ø§Ùƒ ÙÙŠ Â«" + p.name + "Â» ÙÙŠ Ø¯Ù„ÙŠÙ„ ØµÙˆØ±Ø§Ù† Ø§Ù„Ø·Ø¨ÙŠ");
        const inner = `
          <span class="plan-ic ${p.id}">${icon(p.id === "free" ? "lock" : p.id === "pro" ? "sparkles" : "crown")}</span>
          <h3>${esc(p.name)}</h3>
          <p class="plan-desc">${esc(p.description)}</p>
          <ul class="plan-features">
            ${p.features.map((f) => `<li>${icon("check")} ${esc(f)}</li>`).join("")}
          </ul>
          <span class="plan-cta ${p.id === "free" ? "is-free" : ""}">${p.id === "free" ? "Ø§Ù„Ø¨Ø§Ù‚Ø© Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ© Ù„ÙƒÙ„ Ø§Ù„Ø¬Ù‡Ø§Øª" : icon("chat") + " Ø§Ø·Ù„Ø¨ Ø§Ù„Ø§Ø´ØªØ±Ø§Ùƒ Ø¹Ø¨Ø± ÙˆØ§ØªØ³Ø§Ø¨"}</span>`;
        return p.id === "free"
          ? `<article class="plan-card">${inner}</article>`
          : `<a class="plan-card ${p.featured ? "is-gold" : ""}" href="${waMsg}" target="_blank" rel="noopener">${inner}</a>`;
      }).join("")}
    </div>
    <p class="plans-note">Ù„Ù… ØªØ¬Ø¯ Ø¬Ù‡ØªÙƒ ÙÙŠ Ø§Ù„Ø¯Ù„ÙŠÙ„ØŸ <a href="${waHref(SITE.developer.phone, "Ù…Ø±Ø­Ø¨Ø§Ù‹ØŒ Ø£Ø±ØºØ¨ Ø¨Ø¥Ø¶Ø§ÙØ© Ø¬Ù‡ØªÙŠ Ø¥Ù„Ù‰ Ø¯Ù„ÙŠÙ„ ØµÙˆØ±Ø§Ù† Ø§Ù„Ø·Ø¨ÙŠ")}" target="_blank" rel="noopener">ØªÙˆØ§ØµÙ„ Ù…Ø¹ Ø§Ù„Ø¥Ø¯Ø§Ø±Ø©</a> Ù„Ø¥Ø¶Ø§ÙØªÙ‡Ø§ Ø£ÙˆÙ„Ø§Ù‹ØŒ Ø«Ù… Ù‚Ø¯Ù‘Ù… Ø·Ù„Ø¨ Ø§Ù„ØªØ±Ù‚ÙŠØ©.</p>
  </div>`;
}

function viewLogin() {
  return `
  <section class="container page-wrap">
    <div class="login-wrap">
      <div class="login-card">
        <div class="login-head">
          <span class="l-icon">${icon("key")}</span>
          <h1>Ø¯Ø®ÙˆÙ„ Ø§Ù„Ø¬Ù‡Ø©</h1>
          <p>Ø£Ø¯Ø®Ù„ Ø§Ù„Ø¨Ø±ÙŠØ¯ ÙˆÙƒÙ„Ù…Ø© Ø§Ù„Ø³Ø± Ø§Ù„Ø®Ø§ØµÙŠÙ† Ø¨Ùƒ Ù„Ù„ÙˆØµÙˆÙ„ Ø¥Ù„Ù‰ Ù„ÙˆØ­Ø© ØªØ­ÙƒÙ… ØµÙØ­ØªÙƒ.</p>
        </div>
        <form id="loginForm" class="form-grid" novalidate>
          <div class="field">
            <label for="lgUser">Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ</label>
            <input id="lgUser" type="text" dir="ltr" placeholder="admin-...@gmail.com" autocomplete="username" />
          </div>
          <div class="field">
            <label for="lgPass">ÙƒÙ„Ù…Ø© Ø§Ù„Ø³Ø±</label>
            <input id="lgPass" type="password" dir="ltr" placeholder="ÙƒÙ„Ù…Ø© Ø§Ù„Ø³Ø± Ø§Ù„Ù…Ø±Ø³Ù„Ø© Ù„Ùƒ" autocomplete="current-password" />
          </div>
          <p class="login-error" id="loginError" hidden>Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¯Ø®ÙˆÙ„ ØºÙŠØ± ØµØ­ÙŠØ­Ø©</p>
          <button class="btn btn-primary btn-block" type="submit">${icon("key")} Ø¯Ø®ÙˆÙ„</button>
        </form>
        <p class="login-note">Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¯Ø®ÙˆÙ„ ØªÙØ³Ù„ÙŽÙ‘Ù… Ù„Ùƒ Ø¹Ù†Ø¯ ØªÙØ¹ÙŠÙ„ Ø§Ø´ØªØ±Ø§ÙƒÙƒ Ù…Ù† Ù‚Ø¨Ù„ Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ù†ØµØ©.</p>
        <p class="login-forgot"><a href="https://cfcsnhuozufqaejkgrje.supabase.co/auth/v1/resetpassword" target="_blank" rel="noopener">${icon("key")} Ù†Ø³ÙŠØª ÙƒÙ„Ù…Ø© Ø§Ù„Ø³Ø±ØŸ</a></p>
      </div>
    </div>
  </section>`;
}

function view404() {
  return `
  <div class="container page-wrap">
    <div class="empty-state" style="padding:80px 20px">
      <h3 style="font-size:26px">404 â€” Ø§Ù„ØµÙØ­Ø© ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø©</h3>
      <p>ÙŠØ¨Ø¯Ùˆ Ø£Ù† Ø§Ù„Ø±Ø§Ø¨Ø· Ø§Ù„Ø°ÙŠ ØªØ¨Ø­Ø« Ø¹Ù†Ù‡ ØªØºÙŠÙ‘Ø± Ø£Ùˆ Ø­ÙØ°Ù.</p>
      <div style="margin-top:18px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <a class="btn btn-primary" href="#/">Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„Ù„Ø±Ø¦ÙŠØ³ÙŠØ©</a>
        <a class="btn btn-ghost" href="#/doctors">ØªØµÙÙ‘Ø­ Ø§Ù„Ø£Ø·Ø¨Ø§Ø¡</a>
      </div>
    </div>
  </div>`;
}

/* ---------- Ø§Ù„ØµÙØ­Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© ---------- */
function viewPrivacy() {
  return pageShell("Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø®ØµÙˆØµÙŠØ©", "shield", `
    <h2>Ù…Ù‚Ø¯Ù…Ø©</h2>
    <p>Ø¯Ù„ÙŠÙ„ ØµÙˆØ±Ø§Ù† Ø§Ù„Ø·Ø¨ÙŠ Ù…Ø´Ø±ÙˆØ¹ Ù…Ø¬ØªÙ…Ø¹ÙŠ ÙŠØ­ØªØ±Ù… Ø®ØµÙˆØµÙŠØ© Ø²ÙˆÙ‘Ø§Ø±Ù‡. ØªÙˆØ¶Ø­ Ù‡Ø°Ù‡ Ø§Ù„Ø³ÙŠØ§Ø³Ø© Ù…Ø§ Ù†Ø¬Ù…Ø¹Ù‡ ÙˆÙƒÙŠÙ Ù†ØªØ¹Ø§Ù…Ù„ Ù…Ø¹Ù‡.</p>
    <h2>Ù…Ø§ Ù„Ø§ Ù†Ø¬Ù…Ø¹Ù‡</h2>
    <ul>
      <li>Ù„Ø§ Ù†Ø·Ù„Ø¨ Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨ Ù„Ù„Ø§Ø³ØªÙØ§Ø¯Ø© Ù…Ù† Ø§Ù„Ø¯Ù„ÙŠÙ„ØŒ ÙˆÙ„Ø§ Ù†ØªØªØ¨Ø¹ Ù…ÙˆÙ‚Ø¹Ùƒ Ø§Ù„Ø¬ØºØ±Ø§ÙÙŠ.</li>
      <li>Ù„Ø§ Ù†Ø³ØªØ®Ø¯Ù… Ù…Ù„ÙØ§Øª ØªØªØ¨Ø¹ Ø¥Ø¹Ù„Ø§Ù†ÙŠØ© ÙˆÙ„Ø§ Ù†Ø´Ø§Ø±Ùƒ Ø£ÙŠ Ø¨ÙŠØ§Ù†Ø§Øª Ù…Ø¹ Ø¬Ù‡Ø§Øª ØªØ³ÙˆÙŠÙ‚ÙŠØ©.</li>
    </ul>
    <h2>Ù…Ø§ Ù‚Ø¯ ÙŠÙØ­ÙØ¸ Ø¹Ù„Ù‰ Ø¬Ù‡Ø§Ø²Ùƒ ÙÙ‚Ø·</h2>
    <ul>
      <li><strong>Ø§Ù„Ø£Ø³Ø¦Ù„Ø© ÙˆØ§Ù„Ø±Ø³Ø§Ø¦Ù„ Ø§Ù„Ù…Ø±Ø³Ù„Ø© Ù…Ù† Ø§Ù„Ù†Ù…Ø§Ø°Ø¬</strong> ØªÙØ­ÙØ¸ Ù…Ø¤Ù‚ØªØ§Ù‹ ÙÙŠ Ù…ØªØµÙØ­Ùƒ (localStorage) Ù„Ø¹Ø±Ø¶Ù‡Ø§ Ù„Ùƒ ÙÙŠ Â«Ø£Ø³Ø¦Ù„ØªÙŠÂ»ØŒ ÙˆÙ„Ø§ ØªÙØ±Ø³Ù„ Ø¥Ù„Ù‰ Ø£ÙŠ Ø®Ø§Ø¯Ù… ÙÙŠ Ø§Ù„Ù†Ø³Ø®Ø© Ø§Ù„ØªØ¬Ø±ÙŠØ¨ÙŠØ©.</li>
      <li><strong>ØªÙØ¶ÙŠÙ„ Ø§Ù„ÙˆØ¶Ø¹ Ø§Ù„Ù„ÙŠÙ„ÙŠ</strong> ÙŠÙØ­ÙØ¸ Ø¹Ù„Ù‰ Ø¬Ù‡Ø§Ø²Ùƒ ÙÙ‚Ø·.</li>
    </ul>
    <h2>Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¬Ù‡Ø§Øª Ø§Ù„Ø·Ø¨ÙŠØ©</h2>
    <p>ØªÙÙ†Ø´Ø± Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¬Ù‡Ø§Øª (Ø§Ù„Ø§Ø³Ù…ØŒ Ø§Ù„ØªØ®ØµØµØŒ Ø§Ù„Ù‡Ø§ØªÙØŒ Ø§Ù„Ø¹Ù†ÙˆØ§Ù†ØŒ Ø£ÙˆÙ‚Ø§Øª Ø§Ù„Ø¹Ù…Ù„) Ø¨Ù…ÙˆØ§ÙÙ‚Ø© Ø£ØµØ­Ø§Ø¨Ù‡Ø§ ÙˆÙ„Ø£ØºØ±Ø§Ø¶ Ø§Ù„Ø¯Ù„ÙŠÙ„ ÙÙ‚Ø·. ØµØ§Ø­Ø¨ Ø§Ù„Ø¬Ù‡Ø© ÙŠØ³ØªØ·ÙŠØ¹ Ø·Ù„Ø¨ ØªØ¹Ø¯ÙŠÙ„ Ø£Ùˆ Ø­Ø°Ù Ø¨ÙŠØ§Ù†Ø§ØªÙ‡ Ø¹Ø¨Ø± <a href="#/about">ØµÙØ­Ø© Ø¹Ù† Ø§Ù„Ù…Ù†ØµØ©</a>.</p>
    <h2>Ø­Ù‚ÙˆÙ‚Ùƒ</h2>
    <p>ÙŠÙ…ÙƒÙ†Ùƒ ÙÙŠ Ø£ÙŠ ÙˆÙ‚Øª Ø­Ø°Ù Ø£Ø³Ø¦Ù„ØªÙƒ Ø§Ù„Ù…Ø­ÙÙˆØ¸Ø© Ù…Ø­Ù„ÙŠØ§Ù‹ Ù…Ù† Ø²Ø± Ø§Ù„Ø­Ø°Ù Ø§Ù„Ù…Ø±ÙÙ‚ Ø¨ÙƒÙ„ Ø³Ø¤Ø§Ù„ØŒ Ø£Ùˆ Ù…Ø³Ø­ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ù…Ù† Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ù…ØªØµÙØ­.</p>
  `);
}

function viewTerms() {
  return pageShell("Ø´Ø±ÙˆØ· Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…", "doc", `
    <h2>Ù‚Ø¨ÙˆÙ„ Ø§Ù„Ø´Ø±ÙˆØ·</h2>
    <p>Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù…Ùƒ Ø¯Ù„ÙŠÙ„ ØµÙˆØ±Ø§Ù† Ø§Ù„Ø·Ø¨ÙŠ ÙØ¥Ù†Ùƒ ØªÙˆØ§ÙÙ‚ Ø¹Ù„Ù‰ Ù‡Ø°Ù‡ Ø§Ù„Ø´Ø±ÙˆØ·. Ø¥Ù† Ù„Ù… ØªÙˆØ§ÙÙ‚ Ø¹Ù„ÙŠÙ‡Ø§ ÙØ§Ù„Ø±Ø¬Ø§Ø¡ Ø§Ù„ØªÙˆÙ‚Ù Ø¹Ù† Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ù…ÙˆÙ‚Ø¹.</p>
    <h2>Ø·Ø¨ÙŠØ¹Ø© Ø§Ù„Ø®Ø¯Ù…Ø©</h2>
    <p>Ø§Ù„Ø¯Ù„ÙŠÙ„ Ù…Ù†ØµØ© Ù…Ø¹Ù„ÙˆÙ…Ø§ØªÙŠØ© ØªÙˆØ¬ÙŠÙ‡ÙŠØ© ØªØ¹Ø±Ø¶ Ø¨ÙŠØ§Ù†Ø§Øª Ø¬Ù‡Ø§Øª Ø·Ø¨ÙŠØ© ÙÙŠ Ù…Ø¯ÙŠÙ†Ø© ØµÙˆØ±Ø§Ù†. Ù†Ø­Ù† ÙˆØ³ÙŠØ· Ù…Ø¹Ù„ÙˆÙ…Ø§ØªÙŠ ÙÙ‚Ø· ÙˆÙ„Ø§ Ù†Ù‚Ø¯Ù‘Ù… Ø®Ø¯Ù…Ø© Ø·Ø¨ÙŠØ© ÙˆÙ„Ø§ Ù†Ø¶Ù…Ù† Ù†ØªØ§Ø¦Ø¬ Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ø¬Ù‡Ø§Øª Ø§Ù„Ù…Ø¯Ø±Ø¬Ø©.</p>
    <h2>Ø§Ø³ØªØ®Ø¯Ø§Ù…Ø§Øª Ù…Ù‚Ø¨ÙˆÙ„Ø©</h2>
    <ul>
      <li>ÙŠÙÙ…Ù†Ø¹ Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ø¯Ù„ÙŠÙ„ Ù„Ø£ÙŠ ØºØ±Ø¶ Ù…Ø®Ø§Ù„Ù Ù„Ù„Ù‚Ø§Ù†ÙˆÙ† Ø£Ùˆ Ù„Ù„Ø¥Ø¶Ø±Ø§Ø± Ø¨Ø§Ù„Ø¬Ù‡Ø§Øª Ø§Ù„Ù…Ø¯Ø±Ø¬Ø©.</li>
      <li>ÙŠÙÙ…Ù†Ø¹ Ù…Ø­Ø§ÙˆÙ„Ø© ØªØ¹Ø·ÙŠÙ„ Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ø£Ùˆ Ø§Ø³ØªØ®Ø±Ø§Ø¬ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø¨Ø´ÙƒÙ„ Ø¢Ù„ÙŠ Ù„Ø¥Ø¹Ø§Ø¯Ø© Ù†Ø´Ø±Ù‡Ø§ Ø¯ÙˆÙ† Ø¥Ø°Ù†.</li>
      <li>Ø£Ø±Ù‚Ø§Ù… Ø§Ù„Ø¬Ù‡Ø§Øª Ù„Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ø´Ø®ØµÙŠ â€” ÙŠÙØ±Ø¬Ù‰ Ø¹Ø¯Ù… Ø§Ù„Ø¥Ø²Ø¹Ø§Ø¬ Ø§Ù„Ù‡Ø§ØªÙÙŠ Ù„Ù„Ø¬Ù‡Ø§Øª.</li>
    </ul>
    <h2>Ø­Ø¯ÙˆØ¯ Ø§Ù„Ù…Ø³Ø¤ÙˆÙ„ÙŠØ©</h2>
    <p>Ù†Ø¨Ø°Ù„ Ø¬Ù‡Ø¯Ù†Ø§ Ù…Ø¹Ù‚ÙˆÙ„Ø§Ù‹ Ù„Ø¯Ù‚Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª ÙˆØªØ­Ø¯ÙŠØ«Ù‡Ø§ØŒ Ù„ÙƒÙ† Ù„Ø§ Ù†Ø¶Ù…Ù† Ø®Ù„ÙˆÙ‘Ù‡Ø§ Ù…Ù† Ø§Ù„Ø£Ø®Ø·Ø§Ø¡ Ø£Ùˆ Ø§Ù„ØªØºÙŠÙŠØ±Ø§Øª Ø§Ù„Ù…ÙØ§Ø¬Ø¦Ø© (Ø¥Ø¬Ø§Ø²Ø§ØªØŒ ØªØºÙŠÙŠØ± Ø£Ø±Ù‚Ø§Ù…). Ù„Ø§ ÙŠØªØ­Ù…Ù„ Ø§Ù„Ø¯Ù„ÙŠÙ„ Ø£ÙŠ Ù…Ø³Ø¤ÙˆÙ„ÙŠØ© Ø¹Ù† Ø£Ø¶Ø±Ø§Ø± Ù†Ø§ØªØ¬Ø© Ø¹Ù† Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯ Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ù…Ù†Ø´ÙˆØ±Ø©.</p>
    <h2>Ø§Ù„Ù…Ù„ÙƒÙŠØ© Ø§Ù„ÙÙƒØ±ÙŠØ©</h2>
    <p>Ø§Ø³Ù… Ø§Ù„Ø¯Ù„ÙŠÙ„ ÙˆØ´Ø¹Ø§Ø±Ù‡ ÙˆØªÙ†Ø¸ÙŠÙ… Ù…Ø­ØªÙˆØ§Ù‡ Ù…Ù„Ùƒ Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹. Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¬Ù‡Ø§Øª Ù…Ù„Ùƒ Ø£ØµØ­Ø§Ø¨Ù‡Ø§ ÙˆØªÙÙ†Ø´Ø± Ø¨Ù…ÙˆØ§ÙÙ‚ØªÙ‡Ù….</p>
    <h2>ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ø´Ø±ÙˆØ·</h2>
    <p>Ù‚Ø¯ Ù†Ø­Ø¯Ù‘Ø« Ù‡Ø°Ù‡ Ø§Ù„Ø´Ø±ÙˆØ· Ø¹Ù†Ø¯ Ø§Ù„Ø­Ø§Ø¬Ø©ØŒ ÙˆÙŠÙØ¹Ø¯ Ù†Ø´Ø±Ù‡Ø§ Ø¹Ù„Ù‰ Ù‡Ø°Ù‡ Ø§Ù„ØµÙØ­Ø© Ø¥Ø´Ø¹Ø§Ø±Ø§Ù‹ ÙƒØ§ÙÙŠØ§Ù‹ Ø¨Ø§Ù„ØªØºÙŠÙŠØ±.</p>
  `);
}

function viewDisclaimer() {
  return pageShell("Ø¥Ø®Ù„Ø§Ø¡ Ø§Ù„Ù…Ø³Ø¤ÙˆÙ„ÙŠØ© Ø§Ù„Ø·Ø¨ÙŠØ©", "alert", `
    <div class="note-box">${icon("alert")}<p><strong>Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª ÙÙŠ Ù‡Ø°Ø§ Ø§Ù„Ù…ÙˆÙ‚Ø¹ ØªÙˆØ¹ÙˆÙŠØ© Ø¹Ø§Ù…Ø© ÙˆÙ„ÙŠØ³Øª Ø§Ø³ØªØ´Ø§Ø±Ø© Ø·Ø¨ÙŠØ©.</strong></p></div>
    <h2>Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ø§Ù„ØªÙˆØ¹ÙˆÙŠ</h2>
    <p>Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø§Øª ÙˆØ§Ù„Ø¥Ø±Ø´Ø§Ø¯Ø§Øª Ø§Ù„Ù…Ù†Ø´ÙˆØ±Ø© ÙÙŠ Â«Ø§Ø³Ø£Ù„ Ø·Ø¨ÙŠØ§Ù‹Â» ÙˆØ¨Ù‚ÙŠØ© Ø§Ù„ØµÙØ­Ø§Øª Ù…ÙØ¹Ø¯Ù‘Ø© Ø¨Ù„ØºØ© Ù…Ø¨Ø³Ø·Ø© Ù„Ø£ØºØ±Ø§Ø¶ Ø§Ù„ØªØ«Ù‚ÙŠÙ Ø§Ù„ØµØ­ÙŠ Ø§Ù„Ø¹Ø§Ù…ØŒ ÙˆÙ‡ÙŠ Ù„Ø§ ØªØ´ÙƒÙ‘Ù„ ØªØ´Ø®ÙŠØµØ§Ù‹ ÙˆÙ„Ø§ Ø®Ø·Ø© Ø¹Ù„Ø§Ø¬ ÙˆÙ„Ø§ Ø¨Ø¯ÙŠÙ„Ø§Ù‹ Ø¹Ù† Ø§Ù„ÙØ­Øµ Ø§Ù„Ø³Ø±ÙŠØ±ÙŠ Ø§Ù„Ù…Ø¨Ø§Ø´Ø±.</p>
    <h2>Ù„Ø§ ØªØ¹ØªÙ…Ø¯ Ø¹Ù„ÙŠÙ‡Ø§ ÙÙŠ Ø§Ù„Ø­Ø§Ù„Ø§Øª Ø§Ù„Ø­Ø±Ø¬Ø©</h2>
    <ul>
      <li>Ø¹Ù†Ø¯ Ø£Ù„Ù… ØµØ¯Ø± Ø´Ø¯ÙŠØ¯ØŒ Ø¶ÙŠÙ‚ ØªÙ†ÙØ³ Ù…ÙØ§Ø¬Ø¦ØŒ ÙÙ‚Ø¯Ø§Ù† ÙˆØ¹ÙŠØŒ Ù†Ø²ÙŠÙ ØºØ²ÙŠØ±ØŒ Ø£Ùˆ Ø¥ØµØ§Ø¨Ø© Ø±Ø¶Ø­ÙŠØ© â€” Ø§ØªØµÙ„ Ø¨Ø§Ù„Ø¥Ø³Ø¹Ø§Ù ÙÙˆØ±Ø§Ù‹ ÙˆØªÙˆØ¬Ù‡ Ù„Ø£Ù‚Ø±Ø¨ Ù…Ø´ÙÙ‰.</li>
      <li>Ù„Ø§ ØªØ¨Ø¯Ø£ Ø£Ùˆ ØªÙˆÙ‚Ù Ø£ÙŠ Ø¯ÙˆØ§Ø¡ Ø¨Ù†Ø§Ø¡Ù‹ Ø¹Ù„Ù‰ Ù…Ø§ ØªÙ‚Ø±Ø£Ù‡ Ù‡Ù†Ø§ Ø¯ÙˆÙ† Ø§Ø³ØªØ´Ø§Ø±Ø© Ø·Ø¨ÙŠØ¨Ùƒ.</li>
    </ul>
    <h2>Ø§Ù„Ø£Ø·ÙØ§Ù„ ÙˆØ§Ù„Ø­ÙˆØ§Ù…Ù„</h2>
    <p>Ø£ÙŠ Ø­Ø§Ù„Ø© ØªØ®Øµ Ø±Ø¶ÙŠØ¹Ø§Ù‹ Ø£Ùˆ Ø·ÙÙ„Ø§Ù‹ Ø£Ùˆ Ø­Ø§Ù…Ù„Ø§Ù‹ Ø£Ùˆ Ù…Ø±Ø¶Ø¹Ø§Ù‹ ØªØªØ·Ù„Ø¨ Ø§Ø³ØªØ´Ø§Ø±Ø© Ù…Ø¨Ø§Ø´Ø±Ø© Ù…Ø¹ Ø§Ù„Ø·Ø¨ÙŠØ¨ Ø§Ù„Ù…Ø®ØªØµ Ù‚Ø¨Ù„ Ø£ÙŠ Ø¥Ø¬Ø±Ø§Ø¡.</p>
    <h2>Ø§Ù„Ù…ØµØ§Ø¯Ø±</h2>
    <p>ØªÙØµØ§Øº Ø§Ù„Ø¥Ø±Ø´Ø§Ø¯Ø§Øª Ø§Ø³ØªÙ†Ø§Ø¯Ø§Ù‹ Ø¥Ù„Ù‰ Ù…Ø¨Ø§Ø¯Ø¦ Ø¹Ø§Ù…Ø© Ø´Ø§Ø¦Ø¹Ø© ÙÙŠ Ù…Ù…Ø§Ø±Ø³Ø§Øª Ø§Ù„Ø·Ø¨ Ø§Ù„Ø£ÙˆÙ„ÙŠØŒ Ù…Ø¹ ØªØ¨Ø³ÙŠØ·Ù‡Ø§ Ù„ØºÙŠØ± Ø§Ù„Ù…Ø®ØªØµÙŠÙ†. ÙÙŠ Ø­Ø§Ù„ Ø§Ù„Ø®Ù„Ø§Ù Ø¨ÙŠÙ† Ù…Ø§ ØªÙ‚Ø±Ø£Ù‡ Ù‡Ù†Ø§ ÙˆÙ…Ø§ ÙŠÙ‚ÙˆÙ„Ù‡ Ø·Ø¨ÙŠØ¨Ùƒ â€” ÙƒÙ„Ø§Ù… Ø·Ø¨ÙŠØ¨Ùƒ Ù‡Ùˆ Ø§Ù„Ù…Ø±Ø¬Ø¹.</p>
  `);
}

function viewContentPolicy() {
  return pageShell("Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ø·Ø¨ÙŠ", "shieldPlus", `
    <h2>Ù…Ø¨Ø¯Ø£Ù†Ø§</h2>
    <p>Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ø§Ù„ØµØ­ÙŠ ÙÙŠ Ø¯Ù„ÙŠÙ„ ØµÙˆØ±Ø§Ù† Ø§Ù„Ø·Ø¨ÙŠ ÙŠØ®Ø¶Ø¹ Ù„Ù…Ø¹Ø§ÙŠÙŠØ± ØªØ­Ø±ÙŠØ± ÙˆØ§Ø¶Ø­Ø© Ù„Ø¶Ù…Ø§Ù† Ø£Ù„Ø§ ÙŠØµÙ„ Ù„Ø£Ù‡Ø§Ù„ÙŠ Ø§Ù„Ù…Ø¯ÙŠÙ†Ø© Ø£ÙŠ Ù…Ø¹Ù„ÙˆÙ…Ø© Ù…Ø¶Ù„Ù„Ø© Ø£Ùˆ Ø¥Ø¹Ù„Ø§Ù†ÙŠØ© Ù…Ø¶Ù„ÙÙ‘Ø¨Ø©.</p>
    <h2>Ù…Ø¹Ø§ÙŠÙŠØ± Ù†Ø´Ø± Ø§Ù„Ø¥Ø±Ø´Ø§Ø¯Ø§Øª</h2>
    <ul>
      <li><strong>Ø¹Ù„Ù…ÙŠØ© ÙˆÙ…Ø¨Ø³Ø·Ø©:</strong> Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ù…Ø³ØªÙ†Ø¯Ø© Ø¥Ù„Ù‰ Ù…Ø¨Ø§Ø¯Ø¦ Ø·Ø¨ Ø£ÙˆÙ„ÙŠ Ù…ØªØ¹Ø§Ø±Ù Ø¹Ù„ÙŠÙ‡Ø§ØŒ Ø¨ØµÙŠØºØ© ÙŠÙÙ‡Ù…Ù‡Ø§ ØºÙŠØ± Ø§Ù„Ù…Ø®ØªØµ.</li>
      <li><strong>Ù…Ø­Ø§ÙŠØ¯Ø©:</strong> Ù„Ø§ Ù†Ù†Ø´Ø± Ø¥Ø±Ø´Ø§Ø¯Ø§Øª ØªØ±ÙˆÙ‘Ø¬ Ù„Ø¯ÙˆØ§Ø¡ Ø£Ùˆ Ù…Ù†ØªØ¬ Ø£Ùˆ Ø¹ÙŠØ§Ø¯Ø© Ø¨Ø¹ÙŠÙ†Ù‡Ø§ Ù…Ù‚Ø§Ø¨Ù„ Ù…Ù‚Ø§Ø¨Ù„ Ù…Ø§Ø¯ÙŠ.</li>
      <li><strong>Ù…ØªÙˆØ§Ø¶Ø¹Ø© ÙÙŠ Ø§Ù„Ø§Ø¯Ø¹Ø§Ø¡:</strong> Ù†ØªØ¬Ù†Ø¨ Ø§Ù„Ø¹Ø¨Ø§Ø±Ø§Øª Ø§Ù„Ø­Ø§Ø³Ù…Ø© ÙÙŠÙ…Ø§ Ù„Ø§ ÙŠØ­ØªÙ…Ù„ Ø§Ù„ÙŠÙ‚ÙŠÙ†ØŒ ÙˆÙ†Ø­ÙŠÙ„ Ø¹Ù„Ù‰ Ø§Ù„Ø·Ø¨ÙŠØ¨ Ø¯Ø§Ø¦Ù…Ø§Ù‹.</li>
      <li><strong>ÙˆØ§Ø¶Ø­Ø© Ø§Ù„Ø­Ø¯ÙˆØ¯:</strong> ÙƒÙ„ ØµÙØ­Ø© Ø¥Ø±Ø´Ø§Ø¯ÙŠØ© ØªØ°ÙƒÙ‘Ø± Ø§Ù„Ù‚Ø§Ø±Ø¦ Ø¨Ø£Ù† Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ù„Ø§ ÙŠØºÙ†ÙŠ Ø¹Ù† Ø§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø©.</li>
    </ul>
    <h2>Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¬Ù‡Ø§Øª</h2>
    <ul>
      <li>ØªÙÙ†Ø´Ø± Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¬Ù‡Ø© ÙÙ‚Ø· Ø¨Ø¹Ø¯ ØªØ£ÙƒÙŠØ¯Ù‡Ø§ Ù…Ø¹ ØµØ§Ø­Ø¨Ù‡Ø§ Ø£Ùˆ Ù…ØµØ¯Ø± Ù…ÙˆØ«ÙˆÙ‚.</li>
      <li>Ø´Ø§Ø±Ø© Â«Ù…Ù…ÙŠØ²Â» ØªØ¹Ø¨Ù‘Ø± Ø¹Ù† Ø¨Ø§Ù‚Ø© Ø¸Ù‡ÙˆØ± Ù…Ø¯ÙÙˆØ¹Ø© Ø£Ùˆ ØªÙØ§Ø¹Ù„ Ù…Ø¬ØªÙ…Ø¹ÙŠ Ù…ÙˆØ«Ù‚ â€” ÙˆÙ„Ø§ ØªØ¹Ù†ÙŠ ØªÙˆØµÙŠØ© Ø·Ø¨ÙŠØ©.</li>
      <li>Ø£ÙŠ Ø¬Ù‡Ø© ØªÙØ«Ø¨Øª Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ù…Ø¶Ù„Ù„Ø© Ø¹Ù† Ù…Ø¤Ù‡Ù„Ø§ØªÙ‡Ø§ ØªÙÙˆÙ‚Ù Ø¨ÙŠØ§Ù†Ø§ØªÙ‡Ø§ Ø­ØªÙ‰ Ø§Ù„ØªØ­Ù‚Ù‚.</li>
    </ul>
    <h2>Ø§Ù„Ø¥Ø¨Ù„Ø§Øº Ø¹Ù† Ù…Ø­ØªÙˆÙ‰</h2>
    <p>Ø±ØµØ¯ØªÙŽ Ù…Ø¹Ù„ÙˆÙ…Ø© Ø®Ø§Ø·Ø¦Ø© Ø£Ùˆ Ø¥Ø±Ø´Ø§Ø¯Ø§Ù‹ Ù…Ø«ÙŠØ±Ø§Ù‹ Ù„Ù„Ø´ÙƒØŸ Ø£Ø¨Ù„ØºÙ†Ø§ Ø¹Ø¨Ø± <a href="#/about">ØµÙØ­Ø© Ø¹Ù† Ø§Ù„Ù…Ù†ØµØ©</a> ÙˆØ³ÙŠÙØ±Ø§Ø¬Ø¹ Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ø®Ù„Ø§Ù„ ÙŠÙˆÙ…ÙŠ Ø¹Ù…Ù„.</p>
  `);
}

function pageShell(title, ic, body) {
  return `
  <section class="page-hero">
    <div class="container">
      <nav class="breadcrumb"><a href="#/">Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©</a> ${icon("chevLeft")} <span>${title}</span></nav>
      <h1>${icon(ic)} ${title}</h1>
      <p>Ø¢Ø®Ø± ØªØ­Ø¯ÙŠØ«: ${new Date().toLocaleDateString("ar-SY", { year: "numeric", month: "long", day: "numeric" })}</p>
    </div>
  </section>
  <div class="container page-wrap"><div class="prose">${body}</div></div>`;
}

/* ================= ØªÙƒØ§Ù…Ù„ Supabase (Ø§Ø®ØªÙŠØ§Ø±ÙŠ Ù…Ø¹ fallback Ù…Ø­Ù„ÙŠ) ================= */
function supabaseHeaders() {
  const cfg = window.SUPABASE_CONFIG;
  if (!cfg || !cfg.url || !cfg.anonKey) return null;
  return { apikey: cfg.anonKey, Authorization: "Bearer " + cfg.anonKey };
}

/* ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø¬Ù‡Ø§Øª ÙˆØ§Ù„Ù…Ù†Ø§ÙˆØ¨Ø© ÙˆØ§Ù„Ø£Ø³Ø¦Ù„Ø© ÙˆØ§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ù…Ù† Supabase â€” Ø¹Ù†Ø¯ Ø§Ù„ÙØ´Ù„ ØªØ¨Ù‚Ù‰ Ø¨ÙŠØ§Ù†Ø§Øª data.js */
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

/* Ø´Ø±ÙŠØ· Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª â€” ÙŠÙØ³ØªØ®Ø¯Ù… ÙÙŠ Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© ÙˆØµÙØ­Ø§Øª Ø§Ù„ØªÙØ§ØµÙŠÙ„ */
function adBanner(a) {
  return `
  <a class="ad-banner" href="${esc(a.link_url || "#")}" ${a.link_url ? 'target="_blank" rel="noopener"' : ""}>
    ${a.image_url ? `<img src="${esc(a.image_url)}" alt="" loading="lazy" />` : ""}
    <span class="ad-body">
      <span class="ad-tag">${icon("sparkles")} Ø¥Ø¹Ù„Ø§Ù†</span>
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

/* Ø¥Ø¯Ø®Ø§Ù„ Ø³Ø¬Ù„ (Ø³Ø¤Ø§Ù„/Ø±Ø³Ø§Ù„Ø©) ÙÙŠ Supabase â€” Ø£ÙØ¶Ù„ Ø¬Ù‡Ø¯ØŒ ÙŠØ¹ÙˆØ¯ false Ø¹Ù†Ø¯ Ø§Ù„ÙØ´Ù„ */
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

/* ================= Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ… (Ø¬Ù„Ø³Ø© Ø§Ù„Ø¬Ù‡Ø©/Ø§Ù„Ø¥Ø¯Ø§Ø±Ø©) ================= */
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
    /* Ø§Ù†ØªÙ‡Øª ØµÙ„Ø§Ø­ÙŠØ© Ø§Ù„Ø¬Ù„Ø³Ø© â€” ØªØ¬Ø¯ÙŠØ¯ ØµØ§Ù…Øª Ø¹Ø¨Ø± refresh_token Ø«Ù… Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù…Ø±Ø© */
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
      showToast("Ø§Ù†ØªÙ‡Øª Ø§Ù„Ø¬Ù„Ø³Ø© â€” Ø³Ø¬Ù‘Ù„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù…Ø¬Ø¯Ø¯Ø§Ù‹", "warn");
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

/* ---------- Ù„ÙˆØ­Ø© Ø§Ù„Ø¬Ù‡Ø© (Ø¯Ø§Ø®Ù„ Ø§Ù„Ù…ÙˆÙ‚Ø¹) â€” ÙƒÙ„ Ø¬Ù‡Ø© ØªØ¯ÙŠØ± Ù…Ù„ÙÙ‡Ø§ ÙÙ‚Ø· ---------- */
function viewDashboard() {
  const s = getSession();
  if (!s) return viewLogin();
  /* Ù…Ø¯ÙŠØ± Ø§Ù„Ù†Ø¸Ø§Ù… â€” Ù„ÙˆØ­ØªÙ‡ Ø§Ù„Ù…Ø³ØªÙ‚Ù„Ø© Ø®Ø§Ø±Ø¬ Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ø²ÙˆØ§Ø± */
  if (s.role === "admin") {
    return `
    <section class="container page-wrap">
      <div class="login-wrap">
        <div class="login-card" style="text-align:center">
          <span class="l-icon">${icon("shieldCheck")}</span>
          <h1>Ø£Ù†Øª Ù…Ø¯ÙŠØ± Ø§Ù„Ù†Ø¸Ø§Ù…</h1>
          <p>Ø§Ù„Ù„ÙˆØ­Ø© Ø§Ù„Ø´Ø§Ù…Ù„Ø© (Ø§Ù„Ø¬Ù‡Ø§ØªØŒ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§ØªØŒ Ø§Ù„Ø£Ø³Ø¦Ù„Ø©ØŒ Ø§Ù„Ø±Ø³Ø§Ø¦Ù„ØŒ Ø­Ø³Ø§Ø¨Ø§Øª Ø§Ù„Ø¬Ù‡Ø§Øª) ÙÙŠ Ø±Ø§Ø¨Ø· Ù…Ø³ØªÙ‚Ù„ Ù„Ø§ ÙŠÙØ¹Ø±Ø¶ Ø¯Ø§Ø®Ù„ Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ø²ÙˆØ§Ø±.</p>
          <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:16px">
            <a class="btn btn-primary" href="/admin.html" target="_blank" rel="noopener">${icon("key")} ÙØªØ­ Ù„ÙˆØ­Ø© Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù†Ø¸Ø§Ù…</a>
            <button class="btn btn-ghost" type="button" id="dashLogout">${icon("x")} Ø®Ø±ÙˆØ¬</button>
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
        <h1>Ù„ÙˆØ­Ø© Ø§Ù„Ø¬Ù‡Ø©</h1>
        <p dir="ltr">${esc(s.email || "")}</p>
      </div>
      <div class="dash-head-actions">
        <button class="btn btn-outline btn-sm" id="dashLogout" type="button">${icon("x")} Ø®Ø±ÙˆØ¬</button>
        <a class="btn btn-primary btn-sm" href="#/">${icon("home")} Ø¹Ø±Ø¶ Ø§Ù„Ù…ÙˆÙ‚Ø¹</a>
      </div>
    </div>
    <div id="entityPanel"><p class="s-hint">Ø¬Ø§Ø±Ù Ø§Ù„ØªØ­Ù…ÙŠÙ„â€¦</p></div>
  </div>`;
}

const entPanelErr = (msg) => `
  <div class="empty-state">${icon("alert")}<h3>${esc(msg)}</h3><p>Ø³Ø¬Ù‘Ù„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù…Ù† Ø¬Ø¯ÙŠØ¯ Ø£Ùˆ ØªÙˆØ§ØµÙ„ Ù…Ø¹ Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ù†ØµØ©.</p></div>`;

async function bindDashboard() {
  const s = getSession();
  if (!s) return;
  const out = $("#dashLogout");
  if (out) out.addEventListener("click", () => {
    sessionStorage.removeItem("ds-session");
    showToast("ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬");
    location.hash = "#/login";
  });

  const panel = $("#entityPanel");
  if (!panel) return;

  /* Ù…Ø¯ÙŠØ± Ø§Ù„Ù†Ø¸Ø§Ù…: Ù„Ø§ Ø´ÙŠØ¡ Ù„Ø¥Ø¯Ø§Ø±ØªÙ‡ Ù‡Ù†Ø§ */
  if (s.role === "admin") return;

  /* Ø¬Ù„Ø¨ Ø±Ø¨Ø· Ø§Ù„Ø¬Ù‡Ø© Ø¨Ø­Ø³Ø§Ø¨Ù‡Ø§ */
  const accs = await dashApi("/rest/v1/entity_accounts?select=entity_id");
  if (!Array.isArray(accs)) { panel.innerHTML = entPanelErr("ØªØ¹Ø°Ø± Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø­Ø³Ø§Ø¨Ùƒ"); return; }
  if (!accs.length) {
    const wa = waHref(SITE.developer.phone, "Ù…Ø±Ø­Ø¨Ø§Ù‹ØŒ Ø­Ø³Ø§Ø¨ Ø¬Ù‡ØªÙŠ ØºÙŠØ± Ù…Ø±ØªØ¨Ø· Ø¨ØµÙØ­ØªÙŠ ÙÙŠ Ø¯Ù„ÙŠÙ„ ØµÙˆØ±Ø§Ù† â€” Ø¨Ø±ÙŠØ¯ÙŠ: " + (s.email || ""));
    panel.innerHTML = `
    <div class="empty-state">
      ${icon("info")}<h3>Ø­Ø³Ø§Ø¨Ùƒ ØºÙŠØ± Ù…Ø±ØªØ¨Ø· Ø¨Ø¬Ù‡Ø© Ø¨Ø¹Ø¯</h3>
      <p>ØªØ±ØªØ¨Ø· Ø§Ù„Ø­Ø³Ø§Ø¨Ø§Øª Ø¨Ø§Ù„Ø¬Ù‡Ø§Øª Ù…Ù† Ù‚Ø¨Ù„ Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ù†ØµØ© Ø¹Ù†Ø¯ ØªÙØ¹ÙŠÙ„ Ø§Ù„Ø§Ø´ØªØ±Ø§Ùƒ.</p>
      <a class="btn btn-primary" style="margin-top:12px" href="${wa}" target="_blank" rel="noopener">${icon("chat")} ØªÙˆØ§ØµÙ„ Ù…Ø¹ Ø§Ù„Ø¥Ø¯Ø§Ø±Ø© Ù„Ø±Ø¨Ø· Ø­Ø³Ø§Ø¨Ùƒ</a>
    </div>`;
    return;
  }
  const eid = accs[0].entity_id;
  const rows = await dashApi("/rest/v1/entities?id=eq." + encodeURIComponent(eid));
  const e = Array.isArray(rows) ? rows[0] : null;
  if (!e) { panel.innerHTML = entPanelErr("ØªØ¹Ø°Ø± Ø¬Ù„Ø¨ Ø¨ÙŠØ§Ù†Ø§Øª Ø¬Ù‡ØªÙƒ"); return; }

  let days = [];
  if (e.type === "pharmacy") {
    const oc = await dashApi("/rest/v1/oncall?pharmacy_id=eq." + encodeURIComponent(eid) + "&select=day");
    if (Array.isArray(oc)) days = oc.map((r) => r.day);
  }

  panel.innerHTML = `
  <div class="note-box" style="margin-bottom:14px">${icon("info")}<p>Ù‡Ø°Ù‡ Ù„ÙˆØ­Ø© Ø¬Ù‡ØªÙƒ â€” Ø¹Ø¯Ù‘Ù„ Ø¨ÙŠØ§Ù†Ø§Øª ØµÙØ­ØªÙƒ ÙˆØªØ¸Ù‡Ø± ÙÙŠ Ø§Ù„Ù…ÙˆÙ‚Ø¹ ÙÙˆØ± Ø§Ù„Ø­ÙØ¸. Ø­Ù‚ÙˆÙ„ Ø§Ù„ØªÙ…ÙŠÙŠØ² ÙˆØ§Ù„Ø¥Ø¯Ø§Ø±Ø© ÙŠØ¯ÙŠØ±Ù‡Ø§ ÙØ±ÙŠÙ‚ Ø§Ù„Ù…Ù†ØµØ©.</p></div>
  <div class="card">
    <h3 style="margin-bottom:14px">${icon("doc")} Ù…Ù„Ù: ${esc(e.name)}</h3>
    <form id="ownForm" class="ef-grid" novalidate>
      <label>Ø§Ù„Ø§Ø³Ù…
        <input id="owName" value="${esc(e.name || "")}" required />
      </label>
      <label>${e.type === "doctor" ? "Ø§Ù„ØªØ®ØµØµ" : "Ø§Ù„ÙˆØµÙ Ø§Ù„Ù…Ø®ØªØµØ±"}
        <input id="owSpec" value="${esc(e.spec || "")}" />
      </label>
      ${e.type === "doctor" ? `
      <label>Ø§Ù„ØµÙØ© / Ø§Ù„Ø¯Ø±Ø¬Ø©<input id="owDegree" value="${esc(e.degree || "")}" /></label>
      <label>Ø³Ù†ÙˆØ§Øª Ø§Ù„Ø®Ø¨Ø±Ø©<input id="owExp" type="number" min="0" value="${e.exp ?? ""}" /></label>` : ""}
      <label>Ø§Ù„Ù…Ù†Ø·Ù‚Ø©<input id="owArea" value="${esc(e.area || "")}" /></label>
      <label>Ø§Ù„Ø¹Ù†ÙˆØ§Ù†<input id="owAddress" value="${esc(e.address || "")}" /></label>
      <label>Ø§Ù„Ù‡Ø§ØªÙ<input id="owPhone" dir="ltr" value="${esc(e.phone || "")}" /></label>
      <label class="ef-full">ØµÙˆØ±Ø© Ø§Ù„Ø¬Ù‡Ø© (URL Ø±Ø§Ø¨Ø· Ø§Ù„ØµÙˆØ±Ø©)<input id="owImage" dir="ltr" value="${esc(e.image_url || "")}" placeholder="https://..." /></label>
      <label>Ø£ÙˆÙ‚Ø§Øª Ø§Ù„Ø¹Ù…Ù„<input id="owHours" value="${esc(e.hours || "")}" /></label>
      <div class="ef-full ef-checks">
        <label><input type="checkbox" id="owWa" ${e.whatsapp ? "checked" : ""}/> Ù…ØªØ§Ø­ÙˆÙ† Ø¹Ù„Ù‰ ÙˆØ§ØªØ³Ø§Ø¨</label>
      </div>
      <label class="ef-full">Ø§Ù„Ø®Ø¯Ù…Ø§Øª (Ø§ÙØµÙ„ Ø¨ÙØ§ØµÙ„Ø©)<input id="owServices" value="${esc((e.services || []).join("ØŒ "))}" /></label>
      <label class="ef-full">Ù†Ø¨Ø°Ø© Ø¹Ù†Ùƒ / Ø¹Ù† Ø¬Ù‡ØªÙƒ<textarea id="owNote" rows="3">${esc(e.note || "")}</textarea></label>
      <label>Ø®Ø· Ø§Ù„Ø¹Ø±Ø¶ lat<input id="owLat" dir="ltr" value="${e.lat ?? ""}" /></label>
      <label>Ø®Ø· Ø§Ù„Ø·ÙˆÙ„ lng<input id="owLng" dir="ltr" value="${e.lng ?? ""}" /></label>
      ${e.type === "pharmacy" ? `
      <div class="ef-full">
        <p class="ef-oncall-title">Ø£ÙŠØ§Ù… ØµÙŠØ¯Ù„ÙŠØ© Ø§Ù„Ù…Ù†Ø§ÙˆØ¨Ø©</p>
        <div class="ef-days">
          ${DAYS.map((d) => `<label class="ef-day"><input type="checkbox" value="${esc(d)}" data-day ${days.includes(d) ? "checked" : ""}/> ${esc(d)}</label>`).join("")}
        </div>
      </div>` : ""}
      <div class="ef-full ef-actions">
        <button class="btn btn-primary" type="submit">${icon("check")} Ø­ÙØ¸ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„Ø§Øª</button>
      </div>
    </form>
  </div>`;

  $("#ownForm").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const name = $("#owName").value.trim();
    if (!name) return showToast("Ø§Ù„Ø§Ø³Ù… Ù…Ø·Ù„ÙˆØ¨", "err");
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
      services: $("#owServices").value.split(/[,ØŒ]/).map((x) => x.trim()).filter(Boolean),
      note: $("#owNote").value.trim() || null,
      lat: num("#owLat"),
      lng: num("#owLng"),
    };
    if (e.type === "doctor") {
      payload.degree = $("#owDegree").value.trim() || null;
      payload.exp = num("#owExp");
    }
    const ok = await dashApi("/rest/v1/entities?id=eq." + encodeURIComponent(eid), "PATCH", payload);
    if (ok === null) return showToast("ØªØ¹Ø°Ø± Ø§Ù„Ø­ÙØ¸ â€” Ø£Ø¹Ø¯ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„", "err");
    if (e.type === "pharmacy") {
      const ds = $$("#ownForm [data-day]:checked").map((c) => c.value);
      await dashApi("/rest/v1/oncall?pharmacy_id=eq." + encodeURIComponent(eid), "DELETE");
      if (ds.length) await dashApi("/rest/v1/oncall", "POST", ds.map((d) => ({ day: d, pharmacy_id: eid })));
    }
    showToast("ØªÙ… Ø­ÙØ¸ ØªØ¹Ø¯ÙŠÙ„Ø§ØªÙƒ â€” Ø¸Ø§Ù‡Ø±Ø© ÙÙŠ Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ø¢Ù†", "ok");
    loadRemoteData();
  });
}

/* Ø±Ø¨Ø· Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„Ø¯Ø®ÙˆÙ„ â€” ÙŠÙØ³ØªØ®Ø¯Ù… ÙÙŠ ØµÙØ­Ø© Ø§Ù„Ø¯Ø®ÙˆÙ„ ÙˆÙ„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ… Ø¹Ù†Ø¯ Ø§Ù†ØªÙ‡Ø§Ø¡ Ø§Ù„Ø¬Ù„Ø³Ø© */
function bindLoginForm() {
  const f = $("#loginForm");
  if (!f) return;
  f.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const user = $("#lgUser").value.trim();
    const pass = $("#lgPass").value;
    const errEl = $("#loginError");
    if (errEl) errEl.hidden = true;
    if (!user || !pass) return showToast("Ø£Ø¯Ø®Ù„ Ø§Ù„Ø¨Ø±ÙŠØ¯ ÙˆÙƒÙ„Ù…Ø© Ø§Ù„Ø³Ø±", "warn");
    const cfg = window.SUPABASE_CONFIG;
    if (!cfg || !cfg.url || !cfg.anonKey) return showToast("Ù†Ø¸Ø§Ù… Ø§Ù„Ø¯Ø®ÙˆÙ„ ØºÙŠØ± Ù…Ù‡ÙŠØ£ Ø¨Ø¹Ø¯", "warn");
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
        showToast("ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¨Ù†Ø¬Ø§Ø­ â€” Ù…Ø±Ø­Ø¨Ø§Ù‹ Ø¨Ùƒ");
        location.hash = "#/dashboard";
      } else {
        if (errEl) errEl.hidden = false;
        showToast("Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¯Ø®ÙˆÙ„ ØºÙŠØ± ØµØ­ÙŠØ­Ø© Ø£Ùˆ Ø§Ù„Ø­Ø³Ø§Ø¨ ØºÙŠØ± Ù…ÙÙ†Ø´Ø£ Ø¨Ø¹Ø¯", "err");
      }
    } catch (_) {
      showToast("ØªØ¹Ø°Ù‘Ø± Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ø®Ø¯Ù…Ø© Ø§Ù„Ø¯Ø®ÙˆÙ„", "warn");
    }
  });
}

/* Ø²Ø± Â«Ø¯Ø®ÙˆÙ„ Ø§Ù„Ø¬Ù‡Ø© / Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…Â» ÙÙŠ Ø§Ù„ØªØ±ÙˆÙŠØ³Ø© Ø­Ø³Ø¨ Ø§Ù„Ø¬Ù„Ø³Ø© */
function updateEntityBtn() {
  const btn = $("#entityBtn");
  if (!btn) return;
  const label = btn.querySelector("span");
  if (getSession()) {
    btn.setAttribute("href", "#/dashboard");
    if (label) label.textContent = "Ù„ÙˆØ­Ø© Ø§Ù„Ø¬Ù‡Ø©";
  } else {
    btn.setAttribute("href", "#/login");
    if (label) label.textContent = "Ø¯Ø®ÙˆÙ„ Ø§Ù„Ø¬Ù‡Ø©";
  }
}

/* ================= Ø§Ù„ØªÙˆØ¬ÙŠÙ‡ ================= */
const ROUTES = [
  { re: /^\/$/, key: "home", title: "Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©", view: () => viewHome(), after: afterHome },
  { re: /^\/doctors$/, key: "doctors", title: "Ø§Ù„Ø£Ø·Ø¨Ø§Ø¡", view: (q) => viewList("doctor", q), after: () => bindList("doctor") },
  { re: /^\/pharmacies$/, key: "pharmacies", title: "Ø§Ù„ØµÙŠØ¯Ù„ÙŠØ§Øª", view: (q) => viewList("pharmacy", q), after: () => bindList("pharmacy") },
  { re: /^\/oncall$/, key: "oncall", title: "Ø§Ù„ØµÙŠØ¯Ù„ÙŠØ§Øª Ø§Ù„Ù…Ù†Ø§ÙˆØ¨Ø©", view: viewOncall, after: bindOncall },
  { re: /^\/hospitals$/, key: "hospitals", title: "Ø§Ù„Ù…Ø´Ø§ÙÙŠ", view: (q) => viewList("hospital", q), after: () => bindList("hospital") },
  { re: /^\/labs$/, key: "labs", title: "Ø§Ù„Ù…Ø®Ø§Ø¨Ø±", view: (q) => viewList("lab", q), after: () => bindList("lab") },
  { re: /^\/radiology$/, key: "radiology", title: "Ù…Ø±Ø§ÙƒØ² Ø§Ù„Ø£Ø´Ø¹Ø©", view: (q) => viewList("radiology", q), after: () => bindList("radiology") },
  { re: /^\/health-centers$/, key: "health-centers", title: "Ø§Ù„Ù…Ø±Ø§ÙƒØ² Ø§Ù„ØµØ­ÙŠØ©", view: (q) => viewList("health-center", q), after: () => bindList("health-center") },
  { re: /^\/entity\/([A-Za-z0-9-]+)$/, key: "", title: "ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø¬Ù‡Ø©", view: (q, m) => viewEntity(m[1]), after: (q, m) => afterEntity(m[1]) },
  { re: /^\/ask$/, key: "ask", title: "Ø§Ø³Ø£Ù„ Ø·Ø¨ÙŠØ§Ù‹", view: viewAsk, after: bindAsk },
  { re: /^\/search$/, key: "", title: "Ø§Ù„Ø¨Ø­Ø«", view: viewSearch, after: () => bindSearch() },
  { re: /^\/featured$/, key: "featured", title: "المميزون", view: viewFeatured, after: afterFeatured },
  { re: /^\/about$/, key: "about", title: "Ø¹Ù† Ø§Ù„Ù…Ù†ØµØ©", view: viewAbout },
  { re: /^\/packages$/, key: "", title: "Ø¨Ø§Ù‚Ø§Øª Ø§Ù„Ø§Ø´ØªØ±Ø§Ùƒ", view: viewPackages },
  { re: /^\/dashboard$/, key: "dashboard", title: "Ù„ÙˆØ­Ø© Ø§Ù„Ø¬Ù‡Ø©", view: viewDashboard, after: () => { getSession() ? bindDashboard() : bindLoginForm(); } },
  { re: /^\/login$/, key: "login", title: "Ø¯Ø®ÙˆÙ„ Ø§Ù„Ø¬Ù‡Ø©", view: viewLogin, after: () => bindLoginForm() },
  { re: /^\/privacy$/, key: "", title: "Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø®ØµÙˆØµÙŠØ©", view: viewPrivacy },
  { re: /^\/terms$/, key: "", title: "Ø´Ø±ÙˆØ· Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…", view: viewTerms },
  { re: /^\/disclaimer$/, key: "", title: "Ø¥Ø®Ù„Ø§Ø¡ Ø§Ù„Ù…Ø³Ø¤ÙˆÙ„ÙŠØ© Ø§Ù„Ø·Ø¨ÙŠØ©", view: viewDisclaimer },
  { re: /^\/content-policy$/, key: "", title: "Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ø·Ø¨ÙŠ", view: viewContentPolicy },
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
    document.title = "Ø§Ù„ØµÙØ­Ø© ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø© â€” Ø¯Ù„ÙŠÙ„ ØµÙˆØ±Ø§Ù† Ø§Ù„Ø·Ø¨ÙŠ";
    window.scrollTo({ top: 0 });
    setActiveNav("");
    return;
  }

  const m = path.match(route.re);
  view.innerHTML = route.view(q, m || []);
  document.title = `${route.title} â€” ${SITE.name}`;
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

/* ================= Ø§Ù„ØªØ±ÙˆÙŠØ³Ø©: Ù‚Ø§Ø¦Ù…Ø©ØŒ Ø«ÙŠÙ…ØŒ Ø¨Ø­Ø«ØŒ Ø¥Ø´Ø¹Ø§Ø±Ø§Øª ================= */
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

  /* Ø§Ø®ØªØµØ§Ø± Ù„ÙˆØ­Ø© Ø§Ù„Ù…ÙØ§ØªÙŠØ­: ÙØªØ­ ØµÙØ­Ø© Ø§Ù„Ø¨Ø­Ø« */
  document.addEventListener("keydown", (ev) => {
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "k") {
      ev.preventDefault();
      location.hash = "#/search";
    }
  });
}

/* ================= Ø§Ù„Ø¥Ù‚Ù„Ø§Ø¹ ================= */
(async function boot() {
  const year = $("#year");
  if (year) year.textContent = fmtNum(new Date().getFullYear());

  initHeader();
  window.addEventListener("hashchange", render);
  if (!location.hash) location.replace("#/");

  /* Ø¬Ù„Ø¨ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø­ÙŠØ© Ù…Ù† Supabase â€” Ø¹Ù†Ø¯ Ø§Ù„ÙØ´Ù„ ØªÙØ³ØªØ®Ø¯Ù… Ø¨ÙŠØ§Ù†Ø§Øª data.js */
  try { await loadRemoteData(); } catch (_) {}
  render();
})();
