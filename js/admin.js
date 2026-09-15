/* ============================================================
   لوحة إدارة دليل صوران الطبي — مستقلة عن موقع الزوار
   الرابط: /admin.html — دخول بحساب مدير النظام فقط
   تُدار من هنا: الجهات + حسابات الجهات + الإعلانات + الأسئلة + الرسائل
   ============================================================ */
"use strict";

/* ---------- أدوات عامة ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const AR = "٠١٢٣٤٥٦٧٨٩";
const fmtNum = (n) => String(n).replace(/\d/g, (d) => AR[d]);

const ICONS = {
  building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01"/>',
  sparkles: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 13h6M9 17h6"/>',
  alert: '<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>',
  chart: '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
};
const icon = (n) => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ICONS.info}</svg>`;

const waLinkOf = (phone, text) =>
  "https://wa.me/963" + String(phone).replace(/^\+?963/, "").replace(/^0/, "").replace(/\D/g, "") +
  (text ? "?text=" + encodeURIComponent(text) : "");

/* ---------- الحالة ---------- */
const state = { tab: "overview", search: "" };
const ADM_KEY = "adm-session";
const getSession = () => { try { return JSON.parse(localStorage.getItem(ADM_KEY) || "null"); } catch (_) { return null; } };
const setSession = (s) => { try { localStorage.setItem(ADM_KEY, JSON.stringify(s)); } catch (_) {} };
const clearSession = () => localStorage.removeItem(ADM_KEY);

function showToast(msg, kind = "") {
  const w = $("#admToast");
  const t = document.createElement("div");
  t.className = "toast " + kind;
  t.innerHTML = icon(kind === "err" ? "alert" : kind === "ok" ? "check" : "info") + esc(msg);
  w.appendChild(t);
  setTimeout(() => { t.classList.add("hide"); setTimeout(() => t.remove(), 320); }, 2600);
}

/* ---------- واجهة Supabase REST ---------- */
function baseHeaders() {
  const cfg = window.SUPABASE_CONFIG;
  return { apikey: cfg.anonKey, Authorization: "Bearer " + cfg.anonKey };
}

async function api(path, method = "GET", body = null) {
  const s = getSession();
  const cfg = window.SUPABASE_CONFIG;
  if (!s) { showLogin(); return null; }
  const call = (tok) => fetch(cfg.url + path, {
    method,
    headers: { ...baseHeaders(), Authorization: "Bearer " + tok, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  try {
    let r = await call(s.access_token);
    if (r.status === 401 && s.refresh_token) {
      const rr = await fetch(cfg.url + "/auth/v1/token?grant_type=refresh_token", {
        method: "POST",
        headers: { apikey: cfg.anonKey, "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: s.refresh_token }),
      });
      if (rr.ok) {
        const ns = await rr.json();
        s = { ...s, access_token: ns.access_token, refresh_token: ns.refresh_token };
        setSession(s);
        r = await call(s.access_token);
      }
    }
    if (r.status === 401 || r.status === 403) { logout(); return null; }
    if (r.status === 204) return true;
    const txt = await r.text();
    if (!r.ok) return null;
    return txt ? JSON.parse(txt) : true;
  } catch (_) {
    return null;
  }
}

/* ---------- الدخول والخروج ---------- */
function showLogin() { $("#admLogin").hidden = false; $("#admApp").hidden = true; }
function showApp() {
  const s = getSession();
  if (!s) return showLogin();
  $("#admLogin").hidden = true;
  $("#admApp").hidden = false;
  $("#admWho").textContent = s.email || "";
  $$("#admNav button").forEach((b) => b.classList.toggle("active", b.dataset.tab === state.tab));
  renderTab();
}

async function bindLogin() {
  $("#admLoginForm").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const email = $("#admUser").value.trim();
    const pass = $("#admPass").value;
    const err = $("#admLoginErr");
    err.hidden = true;
    if (!email || !pass) return;
    try {
      const r = await fetch(window.SUPABASE_CONFIG.url + "/auth/v1/token?grant_type=password", {
        method: "POST",
        headers: { apikey: window.SUPABASE_CONFIG.anonKey, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      if (!r.ok) { err.hidden = false; return; }
      const d = await r.json();
      const role = (d.user && d.user.user_metadata && d.user.user_metadata.role) || "";
      if (role !== "admin") { err.hidden = false; return; }
      setSession({
        access_token: d.access_token,
        refresh_token: d.refresh_token,
        email: (d.user && d.user.email) || email,
        role: "admin",
      });
      showToast("مرحباً بمدير النظام", "ok");
      showApp();
    } catch (_) {
      err.hidden = false;
    }
  });
  $("#admLogout").addEventListener("click", () => { logout(); });
  $$("#admNav button").forEach((b) =>
    b.addEventListener("click", () => {
      state.tab = b.dataset.tab;
      $$("#admNav button").forEach((x) => x.classList.toggle("active", x === b));
      renderTab();
    }));
}

function logout() {
  clearSession();
  showLogin();
}

/* ---------- مساعدات العرض ---------- */
const dashErr = (msg) => `
  <div class="adm-empty">${icon("alert")}<h3>${esc(msg)}</h3><p>أعد المحاولة أو سجّل الدخول من جديد.</p></div>`;
const emptyState = (t, d) => `
  <div class="adm-empty">${icon("info")}<h3>${esc(t)}</h3><p>${esc(d)}</p></div>`;

/* ---------- التبويبات ---------- */
async function renderTab() {
  const main = $("#admMain");
  main.innerHTML = `<p class="s-hint">جارٍ التحميل…</p>`;
  const t = state.tab;
  if (t === "entities") return renderEntities(main);
  if (t === "accounts") return renderAccounts(main);
  if (t === "ads") return renderAds(main);
  if (t === "questions") return renderInbox(main, "questions");
  if (t === "messages") return renderInbox(main, "messages");
  return renderOverview(main);
}

async function renderOverview(main) {
  const [ent, ads, qs, ms, ea] = await Promise.all([
    api("/rest/v1/entities?select=id,type"),
    api("/rest/v1/ads?select=id"),
    api("/rest/v1/questions?select=id"),
    api("/rest/v1/messages?select=id"),
    api("/rest/v1/entity_accounts?select=email"),
  ]);
  if (!Array.isArray(ent)) { main.innerHTML = dashErr("تعذر تحميل البيانات"); return; }
  const byType = {};
  Object.entries(TYPES).forEach(([k]) => (byType[k] = 0));
  ent.forEach((e) => { if (byType[e.type] !== undefined) byType[e.type]++; });
  main.innerHTML = `
  <div class="adm-head"><div><h1>نظرة عامة</h1><p>ملخص محتوى المنصة — ${new Date().toLocaleDateString("ar-SY", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p></div></div>
  <div class="adm-stats">
    <div class="adm-stat"><b>${fmtNum(ent.length)}</b><span>جهة مسجلة</span></div>
    <div class="adm-stat"><b>${fmtNum(Array.isArray(ads) ? ads.length : 0)}</b><span>إعلان</span></div>
    <div class="adm-stat"><b>${fmtNum(Array.isArray(qs) ? qs.length : 0)}</b><span>سؤال زائر</span></div>
    <div class="adm-stat"><b>${fmtNum(Array.isArray(ms) ? ms.length : 0)}</b><span>رسالة تواصل</span></div>
    <div class="adm-stat"><b>${fmtNum(Array.isArray(ea) ? ea.length : 0)}</b><span>حساب جهة مربوط</span></div>
  </div>
  <div class="adm-card">
    <h3 style="margin-bottom:12px">الجهات حسب القسم</h3>
    <div class="adm-stats" style="margin:0">
      ${Object.entries(TYPES).map(([k, t]) => `
        <div class="adm-stat"><b>${fmtNum(byType[k])}</b><span>${esc(t.plural)}</span></div>`).join("")}
    </div>
  </div>`;
}

/* ---------- الجهات ---------- */
async function renderEntities(main) {
  const q = state.search ? "&name=like.*" + encodeURIComponent(state.search) + "*" : "";
  const list = await api("/rest/v1/entities?select=*&order=sort_order.asc,id.asc" + q);
  if (!Array.isArray(list)) { main.innerHTML = dashErr("تعذر تحميل الجهات"); return; }
  main.innerHTML = `
  <div class="adm-head">
    <div><h1>إدارة الجهات</h1><p>${fmtNum(list.length)} جهة — الإضافة والتعديل والحذف والإيقاف</p></div>
    <button class="btn btn-primary btn-sm" type="button" id="btnAddEntity">${icon("plus")} إضافة جهة</button>
  </div>
  <div class="adm-toolbar">
    <div class="adm-search">${icon("search")}<input id="admSearch" type="search" placeholder="ابحث بالاسم…" value="${esc(state.search)}" /></div>
    <span class="adm-hint">الحفظ يظهر في الموقع فوراً — الإيقاف يخفي دون حذف</span>
  </div>
  <div id="entFormWrap" class="adm-form-wrap"></div>
  <div class="adm-list">
    ${list.length ? list.map((e) => `
    <div class="adm-row">
      <div class="di-body">
        <p class="di-main">${esc(e.name)} <span class="badge badge-blue">${esc(TYPES[e.type] ? TYPES[e.type].label : e.type)}</span>${e.featured ? ' <span class="badge badge-amber">مميزة</span>' : ""}${e.active ? "" : ' <span class="badge badge-rose">موقوفة</span>'}</p>
        <p class="di-meta">${[e.spec, e.area, e.phone].filter(Boolean).map(esc).join(" · ")}</p>
      </div>
      <div class="di-actions">
        <button class="dash-btn" type="button" data-ent-edit="${esc(e.id)}">${icon("doc")} تعديل</button>
        <button class="dash-btn" type="button" data-ent-toggle="${esc(e.id)}" data-active="${e.active ? 1 : 0}">${e.active ? "إيقاف" : "تفعيل"}</button>
        <button class="dash-btn" type="button" data-ent-link="${esc(e.id)}" data-name="${esc(e.name)}">${icon("key")} ربط حساب</button>
        <button class="dash-btn danger" type="button" data-ent-del="${esc(e.id)}">${icon("x")} حذف</button>
      </div>
    </div>`).join("") : emptyState("لا توجد جهات مطابقة", state.search ? "جرّب كلمة بحث أخرى." : "أضف أول جهة من الزر أعلاه.")}
  </div>`;

  const search = $("#admSearch");
  let deb;
  search.addEventListener("input", () => {
    clearTimeout(deb);
    deb = setTimeout(() => { state.search = search.value.trim(); renderTab(); }, 300);
  });
  $("#btnAddEntity").addEventListener("click", () => openEntityForm($("#entFormWrap"), null, []));
  bindEntityActions(main);
}

function bindEntityActions(scope) {
  scope.addEventListener("click", async (ev) => {
    const add = ev.target.closest("#btnAddEntity");
    if (add) return openEntityForm($("#entFormWrap"), null, []);
    const ee = ev.target.closest("[data-ent-edit]");
    if (ee) {
      const id = ee.getAttribute("data-ent-edit");
      const rows = await api("/rest/v1/entities?id=eq." + encodeURIComponent(id));
      const e = Array.isArray(rows) ? rows[0] : null;
      if (!e) return showToast("تعذر جلب بيانات الجهة", "err");
      let days = [];
      if (e.type === "pharmacy") {
        const oc = await api("/rest/v1/oncall?pharmacy_id=eq." + encodeURIComponent(id) + "&select=day");
        if (Array.isArray(oc)) days = oc.map((r) => r.day);
      }
      return openEntityForm($("#entFormWrap"), e, days);
    }
    const et = ev.target.closest("[data-ent-toggle]");
    if (et) {
      const id = et.getAttribute("data-ent-toggle");
      const active = et.getAttribute("data-active") !== "1";
      const ok = await api("/rest/v1/entities?id=eq." + encodeURIComponent(id), "PATCH", { active });
      showToast(ok ? (active ? "تم تفعيل الجهة" : "تم إيقاف الجهة") : "تعذر التنفيذ", ok ? "ok" : "err");
      if (ok) renderTab();
      return;
    }
    const el = ev.target.closest("[data-ent-link]");
    if (el) {
      const id = el.getAttribute("data-ent-link");
      const name = el.getAttribute("data-name");
      const email = prompt('ربط حساب جهة بـ «' + name + '»\nأدخل بريد حساب الجهة (أنشئ المستخدم أولاً من لوحة Supabase → Authentication):');
      if (!email) return;
      const ins = await api("/rest/v1/entity_accounts", "POST", { email: email.trim().toLowerCase(), entity_id: id });
      showToast(ins !== null ? "تم ربط الحساب بالجهة" : "تعذر الربط (قد يكون البريد مربوطاً مسبقاً)", ins !== null ? "ok" : "err");
      return;
    }
    const ed = ev.target.closest("[data-ent-del]");
    if (ed) {
      const id = ed.getAttribute("data-ent-del");
      if (!confirm("حذف هذه الجهة نهائياً؟ سيُحذف معها جدول مناوبتها وربط حسابها.")) return;
      const ok = await api("/rest/v1/entities?id=eq." + encodeURIComponent(id), "DELETE");
      showToast(ok ? "تم حذف الجهة" : "تعذر الحذف", ok ? "ok" : "err");
      if (ok) renderTab();
    }
  });
}

function openEntityForm(wrap, e, oncallDays) {
  const isNew = !e;
  const v = e || { type: "doctor", active: true, sort_order: 100, services: [], lat: SITE.center[0], lng: SITE.center[1] };
  wrap.innerHTML = `
  <div class="adm-card">
    <h3 style="margin-bottom:14px">${isNew ? "إضافة جهة جديدة" : "تعديل: " + esc(e.name)}</h3>
    <form id="entForm" class="ef-grid" novalidate>
      <input type="hidden" id="efId" value="${esc(e ? e.id : "")}" />
      <label>النوع
        <select id="efType">
          ${Object.entries(TYPES).map(([k, t]) => `<option value="${k}" ${v.type === k ? "selected" : ""}>${esc(t.label)}</option>`).join("")}
        </select>
      </label>
      <label>الاسم *
        <input id="efName" required value="${esc(v.name || "")}" placeholder="د. / صيدلية / مشفى…" />
      </label>
      <label>التخصص<input id="efSpec" value="${esc(v.spec || "")}" /></label>
      <label>الصفة / الدرجة<input id="efDegree" value="${esc(v.degree || "")}" /></label>
      <label>سنوات الخبرة<input id="efExp" type="number" min="0" value="${v.exp ?? ""}" /></label>
      <label>المنطقة<input id="efArea" value="${esc(v.area || "")}" /></label>
      <label>العنوان<input id="efAddress" value="${esc(v.address || "")}" /></label>
      <label>الهاتف<input id="efPhone" dir="ltr" value="${esc(v.phone || "")}" /></label>
      <label>أوقات العمل<input id="efHours" value="${esc(v.hours || "")}" /></label>
      <label>الترتيب (الأصغر أولاً)<input id="efSort" type="number" value="${v.sort_order ?? 100}" /></label>
      <div class="ef-full ef-checks">
        <label><input type="checkbox" id="efWa" ${v.whatsapp ? "checked" : ""}/> واتساب</label>
        <label><input type="checkbox" id="efFeat" ${v.featured ? "checked" : ""}/> جهة مميزة</label>
        <label><input type="checkbox" id="ef24" ${v.shift24 ? "checked" : ""}/> تعمل 24 ساعة</label>
        <label><input type="checkbox" id="efActive" ${v.active ? "checked" : ""}/> نشطة في الموقع</label>
      </div>
      <label class="ef-full">الخدمات (افصل بفاصلة)<input id="efServices" value="${esc((v.services || []).join("، "))}" /></label>
      <label class="ef-full">نبذة<textarea id="efNote" rows="2">${esc(v.note || "")}</textarea></label>
      <label>خط العرض lat<input id="efLat" dir="ltr" value="${v.lat ?? ""}" /></label>
      <label>خط الطول lng<input id="efLng" dir="ltr" value="${v.lng ?? ""}" /></label>
      <div class="ef-full" id="efOncallWrap">
        <p class="ef-oncall-title">أيام المناوبة (للصيدليات)</p>
        <div class="ef-days">
          ${DAYS.map((d) => `<label class="ef-day"><input type="checkbox" value="${esc(d)}" data-day ${(oncallDays || []).includes(d) ? "checked" : ""}/> ${esc(d)}</label>`).join("")}
        </div>
      </div>
      <div class="ef-full ef-actions">
        <button class="btn btn-primary" type="submit">${isNew ? icon("plus") + " إضافة الجهة" : icon("check") + " حفظ التعديلات"}</button>
        <button class="btn btn-ghost" type="button" id="efCancel">إلغاء</button>
      </div>
    </form>
  </div>`;
  const typeSel = $("#efType");
  const syncOncall = () => { $("#efOncallWrap").hidden = typeSel.value !== "pharmacy"; };
  typeSel.addEventListener("change", syncOncall);
  syncOncall();
  $("#efCancel").addEventListener("click", () => { wrap.innerHTML = ""; });
  wrap.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function saveEntity(form) {
  const id = $("#efId").value.trim();
  const type = $("#efType").value;
  const name = $("#efName").value.trim();
  if (!name) return showToast("اكتب اسم الجهة", "err");
  const so = Number($("#efSort").value) || 100;
  const num = (sel) => ($(sel).value.trim() === "" ? null : Number($(sel).value));
  const payload = {
    id: id || "e" + Date.now().toString(36),
    type,
    name,
    spec: $("#efSpec").value.trim() || null,
    degree: $("#efDegree").value.trim() || null,
    exp: num("#efExp"),
    area: $("#efArea").value.trim() || null,
    address: $("#efAddress").value.trim() || null,
    phone: $("#efPhone").value.trim() || null,
    whatsapp: $("#efWa").checked,
    hours: $("#efHours").value.trim() || null,
    featured: $("#efFeat").checked,
    shift24: $("#ef24").checked,
    active: $("#efActive").checked,
    rank: so,
    sort_order: so,
    services: $("#efServices").value.split(/[,،]/).map((x) => x.trim()).filter(Boolean),
    note: $("#efNote").value.trim() || null,
    lat: num("#efLat"),
    lng: num("#efLng"),
  };
  const saved = id
    ? await api("/rest/v1/entities?id=eq." + encodeURIComponent(id), "PATCH", payload)
    : await api("/rest/v1/entities", "POST", payload);
  if (saved === null) return showToast("تعذر الحفظ", "err");
  if (type === "pharmacy") {
    const days = $$("#efOncallWrap [data-day]:checked").map((c) => c.value);
    await api("/rest/v1/oncall?pharmacy_id=eq." + encodeURIComponent(payload.id), "DELETE");
    if (days.length) await api("/rest/v1/oncall", "POST", days.map((d) => ({ day: d, pharmacy_id: payload.id })));
  }
  showToast(id ? "تم حفظ التعديلات" : "تمت إضافة الجهة — ظاهرة في الموقع الآن", "ok");
  return true;
}

/* ---------- حسابات الجهات ---------- */
async function renderAccounts(main) {
  const [accs, ents] = await Promise.all([
    api("/rest/v1/entity_accounts?select=*&order=created_at.desc"),
    api("/rest/v1/entities?select=id,name,type&order=sort_order.asc"),
  ]);
  if (!Array.isArray(accs)) { main.innerHTML = dashErr("تعذر تحميل الحسابات"); return; }
  const nameOf = (id) => { const e = (ents || []).find((x) => x.id === id); return e ? e.name : id; };
  main.innerHTML = `
  <div class="adm-head">
    <div><h1>حسابات الجهات</h1><p>ربط بريد حساب جهة بصفحتها — تدخل الجهة عبر الموقع وتدير ملفها فقط</p></div>
    <button class="btn btn-primary btn-sm" type="button" id="btnAddAcc">${icon("plus")} ربط جديد</button>
  </div>
  <div class="adm-card" style="font-size:12.5px;line-height:2;color:var(--muted)">
    ${icon("info")} <b>كيفية إنشاء حساب جهة:</b> أنشئ المستخدم أولاً من لوحة Supabase → Authentication → Add user (مع تأكيد البريد)، ثم اربط بريده بالجهة من هنا أو من زر «ربط حساب» في صف الجهات. تسجيل الجهات الذاتي معطل عمداً.
  </div>
  <div id="accFormWrap" class="adm-form-wrap"></div>
  <div class="adm-list">
    ${accs.length ? accs.map((a) => `
    <div class="adm-row">
      <div class="di-body">
        <p class="di-main" dir="ltr">${esc(a.email)}</p>
        <p class="di-meta">تدير: ${esc(nameOf(a.entity_id))} · منذ ${a.created_at ? new Date(a.created_at).toLocaleDateString("ar-SY") : "—"}</p>
      </div>
      <button class="dash-btn danger" type="button" data-acc-del="${esc(a.email)}">${icon("x")} فك الربط</button>
    </div>`).join("") : emptyState("لا توجد حسابات مربوطة", "اربط أول حساب جهة من الزر أعلاه.")}
  </div>`;

  $("#btnAddAcc").addEventListener("click", () => {
    $("#accFormWrap").innerHTML = `
    <div class="adm-card">
      <h3 style="margin-bottom:14px">ربط حساب جديد</h3>
      <form id="accForm" class="ef-grid" novalidate>
        <label>بريد حساب الجهة (موجود مسبقاً في Authentication)
          <input id="aaEmail" type="email" dir="ltr" required placeholder="entity@gmail.com" />
        </label>
        <label>الجهة التي سيديرها
          <select id="aaEntity">
            ${(ents || []).map((e) => `<option value="${esc(e.id)}">${esc(e.name)} — ${esc(TYPES[e.type] ? TYPES[e.type].label : e.type)}</option>`).join("")}
          </select>
        </label>
        <div class="ef-full ef-actions">
          <button class="btn btn-primary" type="submit">${icon("key")} ربط الحساب</button>
          <button class="btn btn-ghost" type="button" id="aaCancel">إلغاء</button>
        </div>
      </form>
    </div>`;
    $("#aaCancel").addEventListener("click", () => { $("#accFormWrap").innerHTML = ""; });
  });

  main.addEventListener("click", async (ev) => {
    const del = ev.target.closest("[data-acc-del]");
    if (del) {
      const email = del.getAttribute("data-acc-del");
      if (!confirm("فك ربط الحساب «" + email + "»؟ لن يستطيع صاحبه إدارة الجهة.")) return;
      const ok = await api("/rest/v1/entity_accounts?email=eq." + encodeURIComponent(email), "DELETE");
      showToast(ok ? "تم فك الربط" : "تعذر التنفيذ", ok ? "ok" : "err");
      if (ok) renderTab();
    }
  });

  main.addEventListener("submit", async (ev) => {
    if (ev.target.id !== "accForm") return;
    ev.preventDefault();
    const email = $("#aaEmail").value.trim().toLowerCase();
    const entity_id = $("#aaEntity").value;
    if (!email) return showToast("أدخل بريد الحساب", "err");
    const ins = await api("/rest/v1/entity_accounts", "POST", { email, entity_id });
    showToast(ins !== null ? "تم ربط الحساب" : "تعذر الربط", ins !== null ? "ok" : "err");
    if (ins !== null) renderTab();
  });
}

/* ---------- الإعلانات ---------- */
const PLACEMENT_LABEL = { home: "الرئيسية", detail: "صفحات التفاصيل", all: "كل الصفحات" };

async function renderAds(main) {
  const list = await api("/rest/v1/ads?select=*&order=sort_order.asc,created_at.desc");
  if (!Array.isArray(list)) { main.innerHTML = dashErr("تعذر تحميل الإعلانات"); return; }
  main.innerHTML = `
  <div class="adm-head">
    <div><h1>الإعلانات</h1><p>الإعلان النشط يظهر مباشرة في مكانه بالموقع</p></div>
    <button class="btn btn-primary btn-sm" type="button" id="btnAddAd">${icon("plus")} إعلان جديد</button>
  </div>
  <div id="adFormWrap" class="adm-form-wrap"></div>
  <div class="adm-list">
    ${list.length ? list.map((a) => `
    <div class="adm-row">
      <div class="di-body">
        <p class="di-main">${esc(a.title)} <span class="badge badge-blue">${esc(PLACEMENT_LABEL[a.placement] || a.placement)}</span>${a.active ? "" : ' <span class="badge badge-rose">موقوف</span>'}</p>
        <p class="di-meta">${[a.body, a.link_url].filter(Boolean).map(esc).join(" · ")}</p>
      </div>
      <div class="di-actions">
        <button class="dash-btn" type="button" data-ad-edit="${esc(a.id)}">${icon("doc")} تعديل</button>
        <button class="dash-btn" type="button" data-ad-toggle="${esc(a.id)}" data-active="${a.active ? 1 : 0}">${a.active ? "إيقاف" : "تفعيل"}</button>
        <button class="dash-btn danger" type="button" data-ad-del="${esc(a.id)}">${icon("x")} حذف</button>
      </div>
    </div>`).join("") : emptyState("لا توجد إعلانات", "أضف أول إعلان من الزر أعلاه.")}
  </div>`;

  $("#btnAddAd").addEventListener("click", () => openAdForm($("#adFormWrap"), null));
  main.addEventListener("click", async (ev) => {
    const ae = ev.target.closest("[data-ad-edit]");
    if (ae) {
      const rows = await api("/rest/v1/ads?id=eq." + encodeURIComponent(ae.getAttribute("data-ad-edit")));
      const a = Array.isArray(rows) ? rows[0] : null;
      if (!a) return showToast("تعذر جلب الإعلان", "err");
      return openAdForm($("#adFormWrap"), a);
    }
    const at = ev.target.closest("[data-ad-toggle]");
    if (at) {
      const id = at.getAttribute("data-ad-toggle");
      const active = at.getAttribute("data-active") !== "1";
      const ok = await api("/rest/v1/ads?id=eq." + encodeURIComponent(id), "PATCH", { active });
      showToast(ok ? (active ? "تم تفعيل الإعلان" : "تم إيقاف الإعلان") : "تعذر التنفيذ", ok ? "ok" : "err");
      if (ok) renderTab();
      return;
    }
    const ad = ev.target.closest("[data-ad-del]");
    if (ad) {
      if (!confirm("حذف هذا الإعلان نهائياً؟")) return;
      const ok = await api("/rest/v1/ads?id=eq." + encodeURIComponent(ad.getAttribute("data-ad-del")), "DELETE");
      showToast(ok ? "تم حذف الإعلان" : "تعذر الحذف", ok ? "ok" : "err");
      if (ok) renderTab();
    }
  });
}

function openAdForm(wrap, a) {
  const isNew = !a;
  const v = a || { placement: "home", active: true, sort_order: 100 };
  wrap.innerHTML = `
  <div class="adm-card">
    <h3 style="margin-bottom:14px">${isNew ? "إعلان جديد" : "تعديل الإعلان"}</h3>
    <form id="adForm" class="ef-grid" novalidate>
      <input type="hidden" id="afId" value="${esc(a ? a.id : "")}" />
      <label class="ef-full">عنوان الإعلان *
        <input id="afTitle" required value="${esc(v.title || "")}" />
      </label>
      <label class="ef-full">النص<input id="afBody" value="${esc(v.body || "")}" /></label>
      <label>رابط الصورة (اختياري)<input id="afImg" dir="ltr" value="${esc(v.image_url || "")}" placeholder="https://…" /></label>
      <label>رابط الانتقال (اختياري)<input id="afLink" dir="ltr" value="${esc(v.link_url || "")}" placeholder="https://wa.me/…" /></label>
      <label>مكان الظهور
        <select id="afPlacement">
          <option value="home" ${v.placement === "home" ? "selected" : ""}>الصفحة الرئيسية</option>
          <option value="detail" ${v.placement === "detail" ? "selected" : ""}>صفحات تفاصيل الجهات</option>
          <option value="all" ${v.placement === "all" ? "selected" : ""}>كل الصفحات</option>
        </select>
      </label>
      <label>الترتيب<input id="afSort" type="number" value="${v.sort_order ?? 100}" /></label>
      <div class="ef-full ef-checks">
        <label><input type="checkbox" id="afActive" ${v.active ? "checked" : ""}/> نشط (ظاهر في الموقع)</label>
      </div>
      <div class="ef-full ef-actions">
        <button class="btn btn-primary" type="submit">${isNew ? icon("plus") + " نشر الإعلان" : icon("check") + " حفظ التعديلات"}</button>
        <button class="btn btn-ghost" type="button" id="afCancel">إلغاء</button>
      </div>
    </form>
  </div>`;
  $("#afCancel").addEventListener("click", () => { wrap.innerHTML = ""; });
}

async function saveAd() {
  const id = $("#afId").value.trim();
  const title = $("#afTitle").value.trim();
  if (!title) return showToast("اكتب عنوان الإعلان", "err");
  const payload = {
    title,
    body: $("#afBody").value.trim() || null,
    image_url: $("#afImg").value.trim() || null,
    link_url: $("#afLink").value.trim() || null,
    placement: $("#afPlacement").value,
    active: $("#afActive").checked,
    sort_order: Number($("#afSort").value) || 100,
  };
  const saved = id
    ? await api("/rest/v1/ads?id=eq." + encodeURIComponent(id), "PATCH", payload)
    : await api("/rest/v1/ads", "POST", payload);
  if (saved === null) return showToast("تعذر الحفظ", "err");
  showToast(id ? "تم حفظ الإعلان" : "تم نشر الإعلان — ظاهر في الموقع الآن", "ok");
  return true;
}

/* ---------- الأسئلة والرسائل ---------- */
async function renderInbox(main, kind) {
  const isQ = kind === "questions";
  const list = await api(`/rest/v1/${kind}?select=*&order=created_at.desc`);
  if (!Array.isArray(list)) { main.innerHTML = dashErr(isQ ? "تعذر تحميل الأسئلة" : "تعذر تحميل الرسائل"); return; }
  main.innerHTML = `
  <div class="adm-head">
    <div>
      <h1>${isQ ? "أسئلة الزوار" : "رسائل التواصل"}</h1>
      <p>${fmtNum(list.length)} ${isQ ? "سؤال" : "رسالة"} — تُحفظ في قاعدة البيانات عند إرسالها من الموقع</p>
    </div>
  </div>
  <div class="adm-list">
    ${list.length ? list.map((x) => `
    <div class="adm-row">
      <div class="di-body">
        <p class="di-main">${isQ ? esc(x.question) : `<span class="badge badge-blue">${esc(x.topic || "رسالة")}</span> ${esc(x.body)}`}</p>
        <p class="di-meta">${[isQ ? x.name : x.name, isQ ? x.phone : x.contact, x.created_at ? new Date(x.created_at).toLocaleDateString("ar-SY") : ""].filter(Boolean).map(esc).join(" · ")}</p>
      </div>
      <button class="dash-btn danger" type="button" data-inbox-del="${esc(x.id)}">${icon("x")} حذف</button>
    </div>`).join("") : emptyState(isQ ? "لا توجد أسئلة بعد" : "لا توجد رسائل بعد", "ستظهر هنا فور إرسالها من الموقع.")}
  </div>`;

  main.addEventListener("click", async (ev) => {
    const del = ev.target.closest("[data-inbox-del]");
    if (!del) return;
    const id = del.getAttribute("data-inbox-del");
    if (!confirm(isQ ? "حذف هذا السؤال؟" : "حذف هذه الرسالة؟")) return;
    const ok = await api(`/rest/v1/${kind}?id=eq.` + encodeURIComponent(id), "DELETE");
    showToast(ok ? "تم الحذف" : "تعذر الحذف", ok ? "ok" : "err");
    if (ok) renderTab();
  });
}

/* ---------- الإقلاع ---------- */
document.addEventListener("DOMContentLoaded", () => {
  bindLogin();
  if (getSession()) showApp(); else showLogin();
});
