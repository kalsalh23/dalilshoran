/* ============================================================
   لوحة إدارة دليل صوران الطبي — تحكم كامل (مدير فقط)
   /admin.html — Supabase Auth (role=admin)
   ============================================================ */
"use strict";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const AR = "٠١٢٣٤٥٦٧٨٩";
const fmtNum = (n) => String(n).replace(/\d/g, (d) => AR[d]);
const ICONS = {
  plus: '<path d="M12 5v14M5 12h14"/>', check: '<polyline points="20 6 9 17 4 12"/>',
  doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 13h6M9 17h6"/>',
  alert: '<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>', info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
};
const icon = (n) => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ICONS.info}</svg>`;

const IMG_BUCKET = (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.imageBucket) || "images";

/* حقول إدخال مخصصة لكل نوع جهة */
const ENTITY_FORMS = {
  doctor: {
    label: "طبيب / عيادة", plural: "الأطباء", specLabel: "الاختصاص", specPlaceholder: "مثال: باطنية، أطفال…", degreeLabel: "الدرجة العلمية/اللقب",
    fields: ["name","spec","degree","exp","address","phone","whatsapp","hours","image_file","featured","active"],
  },
  pharmacy: {
    label: "صيدلية", plural: "الصيدليات", specLabel: "وصف مختصر", specPlaceholder: "اختياري", degreeLabel: "ترخيص/ملاحظات (اختياري)",
    fields: ["name","owner","spec","area","address","phone","whatsapp","hours","shift24","oncallWeek","image_file","featured","active"],
  },
  hospital: {
    label: "مشفى", plural: "المشافي", specLabel: "التخصصات/الخدمات الرئيسية", specPlaceholder: "مثال: طوارئ، جراحة، توليد…", degreeLabel: "التصنيف/الجهة المشغلة",
    fields: ["name","spec","degree","area","address","phone","whatsapp","hours","image_file","featured","active"],
  },
  lab: {
    label: "مخبر تحاليل", plural: "المخابر", specLabel: "أنواع التحاليل", specPlaceholder: "مثال: دم، هرمونات، PCR…", degreeLabel: "اعتماد/ملاحظات",
    fields: ["name","spec","degree","area","address","phone","whatsapp","hours","image_file","featured","active"],
  },
  radiology: {
    label: "مركز أشعة", plural: "مراكز الأشعة", specLabel: "أنواع التصوير", specPlaceholder: "مثال: إيكو، أشعة، طبقي…", degreeLabel: "اعتماد/ملاحظات",
    fields: ["name","spec","degree","area","address","phone","whatsapp","hours","image_file","featured","active"],
  },
  "health-center": {
    label: "مركز صحي", plural: "المراكز الصحية", specLabel: "الخدمات المقدمة", specPlaceholder: "مثال: لقاحات، رعاية أولية…", degreeLabel: "الجهة التابعة",
    fields: ["name","spec","degree","area","address","phone","whatsapp","hours","image_file","featured","active"],
  },
};

const state = { tab: "overview", search: "", month: new Date().toISOString().slice(0, 7) };
const ADM_KEY = "adm-session";
const getSession = () => { try { return JSON.parse(sessionStorage.getItem(ADM_KEY) || "null"); } catch (_) { return null; } };
const setSession = (s) => { try { sessionStorage.setItem(ADM_KEY, JSON.stringify(s)); } catch (_) {} };
const clearSession = () => sessionStorage.removeItem(ADM_KEY);

function showToast(msg, kind = "") {
  const w = $("#admToast"); if (!w) return;
  const t = document.createElement("div");
  t.className = "toast " + kind;
  t.innerHTML = icon(kind === "err" ? "alert" : kind === "ok" ? "check" : "info") + " " + esc(msg);
  w.appendChild(t);
  setTimeout(() => { t.classList.add("hide"); setTimeout(() => t.remove(), 320); }, 3200);
}

function baseHeaders() { const cfg = window.SUPABASE_CONFIG; return { apikey: cfg.anonKey, Authorization: "Bearer " + cfg.anonKey }; }

async function getToken() {
  const s = getSession(); if (!s) return null;
  return s.access_token;
}

async function api(path, method = "GET", body = null, prefer) {
  const s = getSession(); const cfg = window.SUPABASE_CONFIG;
  if (!s) { showLogin(); return null; }
  const headers = (tok) => ({ ...baseHeaders(), Authorization: "Bearer " + tok, ...(body ? { "Content-Type": "application/json" } : {}), ...(prefer ? { Prefer: prefer } : {}) });
  const call = (tok) => fetch(cfg.url + path, { method, headers: headers(tok), body: body ? JSON.stringify(body) : undefined });
  try {
    let r = await call(s.access_token);
    if (r.status === 401 && s.refresh_token) {
      const rr = await fetch(cfg.url + "/auth/v1/token?grant_type=refresh_token", { method: "POST", headers: { apikey: cfg.anonKey, "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: s.refresh_token }) });
      if (rr.ok) { const nd = await rr.json(); s.access_token = nd.access_token; s.refresh_token = nd.refresh_token || s.refresh_token; setSession(s); r = await call(s.access_token); }
      else { logout(); return null; }
    }
    if (!r.ok) { let m = ""; try { m = (await r.json()).message || ""; } catch (_) {} console.warn("API", method, path, r.status, m); return null; }
    if (r.status === 204) return true;
    const txt = await r.text(); return txt ? JSON.parse(txt) : true;
  } catch (e) { console.warn("API err", e); return null; }
}

async function uploadImage(file, folder) {
  if (!file) return { url: null };
  const s = getSession(); const cfg = window.SUPABASE_CONFIG;
  if (!s || !cfg) return { error: "لا توجد جلسة" };
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const encPath = path.split("/").map(encodeURIComponent).join("/");
  const url = `${cfg.url}/storage/v1/object/${encodeURIComponent(IMG_BUCKET)}/${encPath}`;
  const doUpload = async (tok) => fetch(url, { method: "POST", headers: { apikey: cfg.anonKey, Authorization: "Bearer " + tok, "x-upsert": "true", "Content-Type": file.type || "image/jpeg" }, body: file });
  try {
    let r = await doUpload(s.access_token);
    if (r.status === 401 && s.refresh_token) {
      const rr = await fetch(cfg.url + "/auth/v1/token?grant_type=refresh_token", { method: "POST", headers: { apikey: cfg.anonKey, "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: s.refresh_token }) });
      if (rr.ok) { const nd = await rr.json(); s.access_token = nd.access_token; s.refresh_token = nd.refresh_token || s.refresh_token; setSession(s); r = await doUpload(s.access_token); }
    }
    if (!r.ok) {
      let msg = "";
      try { const j = await r.json(); msg = j.message || j.error || j.msg || j.statusCode || ""; } catch (_) {}
      const low = String(msg).toLowerCase();
      let hint = " نفّذ supabase/storage-images.sql في Supabase SQL Editor لإنشاء bucket `images` وسياسات المدير.";
      if (low.includes("bucket not found") || low.includes("not found")) hint = " الـ bucket `images` غير موجود." + hint;
      else if (low.includes("row-level security") || low.includes("policy") || r.status === 403) hint = " صلاحيات Storage/RLS تمنع الرفع للمدير." + hint;
      else if (r.status === 400) hint = " طلب الرفع مرفوض (400)." + hint;
      return { error: (msg ? msg + " — " : "") + "تعذر رفع الصورة." + hint };
    }
    return { url: `${cfg.url}/storage/v1/object/public/${encodeURIComponent(IMG_BUCKET)}/${encPath}` };
  } catch (e) { return { error: "فشل رفع الصورة: " + (e && e.message ? e.message : "خطأ شبكة") }; }
}

function bindImagePreview(scope) {
  const inp = scope.querySelector("#efImageFile"); const prev = scope.querySelector("#efImagePreview"); const clear = scope.querySelector("#efImageClear"); const hidden = scope.querySelector("#efImageUrl");
  if (inp) inp.addEventListener("change", () => { const f = inp.files && inp.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { if (prev) { prev.src = r.result; prev.hidden = false; } if (clear) clear.hidden = false; }; r.readAsDataURL(f); });
  if (clear) clear.addEventListener("click", () => { if (inp) inp.value = ""; if (hidden) hidden.value = ""; if (prev) { prev.src = ""; prev.hidden = true; } clear.hidden = true; });
}

function showLogin() { $("#admLogin").hidden = false; $("#admApp").hidden = true; }
function showApp() {
  $("#admLogin").hidden = true; $("#admApp").hidden = false;
  const s = getSession(); if ($("#admWho")) $("#admWho").textContent = s && s.email ? s.email : "";
  $$("#admNav button").forEach((b) => b.classList.toggle("active", b.dataset.tab === state.tab));
  renderTab();
}
function logout() { clearSession(); showLogin(); }

async function bindLogin() {
  $("#admLoginForm").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const email = $("#admUser").value.trim(), pass = $("#admPass").value, err = $("#admLoginErr"); err.hidden = true;
    if (!email || !pass) return;
    try {
      const r = await fetch(window.SUPABASE_CONFIG.url + "/auth/v1/token?grant_type=password", { method: "POST", headers: { apikey: window.SUPABASE_CONFIG.anonKey, "Content-Type": "application/json" }, body: JSON.stringify({ email, password: pass }) });
      if (!r.ok) { err.hidden = false; return; }
      const d = await r.json(); const role = (d.user && d.user.user_metadata && d.user.user_metadata.role) || "";
      if (role !== "admin") { err.hidden = false; return; }
      setSession({ access_token: d.access_token, refresh_token: d.refresh_token, email: (d.user && d.user.email) || email, role: "admin" });
      showToast("مرحباً بمدير النظام", "ok"); showApp();
    } catch (_) { err.hidden = false; }
  });
  $("#admLogout").addEventListener("click", () => logout());
  $$("#admNav button").forEach((b) => b.addEventListener("click", () => { state.tab = b.dataset.tab; state.search = ""; $$("#admNav button").forEach((x) => x.classList.toggle("active", x === b)); renderTab(); }));
}

const dashErr = (msg) => `<div class="adm-empty">${icon("alert")}<h3>${esc(msg)}</h3><p>تحقق من الاتصال أو صلاحيات المدير (RLS).</p></div>`;
const emptyState = (t, d) => `<div class="adm-empty">${icon("info")}<h3>${esc(t)}</h3><p>${esc(d || "")}</p></div>`;

async function renderTab() {
  const main = $("#admMain"); main.innerHTML = `<p class="s-hint">جارٍ التحميل…</p>`;
  const t = state.tab;
  if (t.startsWith("ent_")) return renderEntities(main, t.slice(4));
  if (t === "oncall") return renderOncall(main);
  if (t === "faq") return renderFaq(main);
  if (t === "ads") return renderAds(main);
  if (t === "accounts") return renderAccounts(main);
  if (t === "questions") return renderInbox(main, "questions");
  if (t === "messages") return renderInbox(main, "messages");
  if (t === "settings") return renderSettings(main);
  return renderOverview(main);
}

function downloadFile(name, content, type) { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([content], { type: type || "application/octet-stream" })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }

function entitiesToCsv(list) {
  const cols = [
    ["id","المعرف"],["name","الاسم"],["type","النوع"],["spec","الاختصاص/الوصف"],["degree","الدرجة/التصنيف"],
    ["exp","سنوات الخبرة"],["owner","المالك/المسؤول"],["area","المنطقة"],["address","العنوان"],
    ["phone","الهاتف"],["whatsapp","واتساب"],["hours","ساعات العمل"],["shift24","24 ساعة"],
    ["featured","مميزة"],["active","نشطة"],["image_url","رابط الصورة"],["services","الخدمات"],["note","ملاحظات"],
  ];
  const typeLabel = (t) => (ENTITY_FORMS[t] && ENTITY_FORMS[t].label) || t || "";
  const q = (v) => {
    if (v == null) return "";
    let s = Array.isArray(v) ? v.join("، ") : (typeof v === "boolean" ? (v ? "نعم" : "لا") : String(v));
    if (/[",\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const head = cols.map(c => q(c[1])).join(",");
  const rows = list.map(e => cols.map(([k]) => q(k === "type" ? typeLabel(e.type) : e[k])).join(","));
  return "\uFEFF" + [head, ...rows].join("\r\n");
}

async function renderOverview(main) {
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const [ent, ads, qs, ms, ea, faq, oc] = await Promise.all([
    api("/rest/v1/entities?select=id,type,active"), api("/rest/v1/ads?select=id,active"),
    api("/rest/v1/questions?select=id"), api("/rest/v1/messages?select=id"),
    api("/rest/v1/entity_accounts?select=email"), api("/rest/v1/faq?select=id"),
    api("/rest/v1/oncall_schedule?select=day&day=gte." + monthStart),
  ]);
  if (!Array.isArray(ent)) { main.innerHTML = dashErr("تعذر تحميل البيانات"); return; }
  const byType = {}; Object.keys(ENTITY_FORMS).forEach((k) => byType[k] = 0); ent.forEach((e) => { if (byType[e.type] != null) byType[e.type]++; });
  main.innerHTML = `
  <div class="adm-head"><div><h1>نظرة عامة</h1><p>تحكم كامل بالتطبيق — ${new Date().toLocaleDateString("ar-SY", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-ghost btn-sm" id="expEnt" type="button">${icon("doc")} تصدير الجهات (Excel)</button></div></div>
  <div class="adm-stats"><div class="adm-stat"><b>${fmtNum(ent.length)}</b><span>جهة</span></div><div class="adm-stat"><b>${fmtNum((ads || []).length)}</b><span>إعلان</span></div><div class="adm-stat"><b>${fmtNum((faq || []).length)}</b><span>إرشاد FAQ</span></div><div class="adm-stat"><b>${fmtNum((oc || []).length)}</b><span>تعيين مناوبة (الشهر)</span></div><div class="adm-stat"><b>${fmtNum((qs || []).length)}</b><span>سؤال زائر</span></div><div class="adm-stat"><b>${fmtNum((ms || []).length)}</b><span>رسالة</span></div><div class="adm-stat"><b>${fmtNum((ea || []).length)}</b><span>حساب جهة</span></div></div>
  <div class="adm-card"><h3 style="margin-bottom:12px">الجهات حسب القسم</h3><div class="adm-stats" style="margin:0">${Object.entries(ENTITY_FORMS).map(([k, t]) => `<div class="adm-stat"><b>${fmtNum(byType[k] || 0)}</b><span>${esc(t.plural)}</span></div>`).join("")}</div></div>`;
  $("#expEnt").onclick = async () => { const all = await api("/rest/v1/entities?select=*"); if (Array.isArray(all)) downloadFile("entities.csv", entitiesToCsv(all), "text/csv;charset=utf-8"); else showToast("تعذر التصدير", "err"); };
}

async function renderEntities(main, type) {
  const cfg = ENTITY_FORMS[type] || ENTITY_FORMS.doctor;
  const q = state.search ? "&name=ilike.*" + encodeURIComponent(state.search) + "*" : "";
  const list = await api("/rest/v1/entities?select=*&type=eq." + encodeURIComponent(type) + "&order=sort_order.asc,id.asc" + q);
  if (!Array.isArray(list)) { main.innerHTML = dashErr("تعذر تحميل " + cfg.plural); return; }
  main.innerHTML = `
  <div class="adm-head"><div><h1>إدارة ${esc(cfg.plural)}</h1><p>${fmtNum(list.length)} — حقول إدخال خاصة بـ ${esc(cfg.label)}</p></div>
    <button class="btn btn-primary btn-sm" type="button" id="btnAddEntity">${icon("plus")} إضافة ${esc(cfg.label)}</button></div>
  <div class="adm-toolbar"><div class="adm-search">${icon("search")}<input id="admSearch" type="search" placeholder="ابحث بالاسم…" value="${esc(state.search)}" /></div></div>
  <div id="entFormWrap" class="adm-form-wrap"></div>
  <div class="adm-list">${list.length ? list.map((e) => `
    <div class="adm-row"><div class="di-body"><p class="di-main">${esc(e.name)}${e.featured ? ' <span class="badge badge-amber">مميزة</span>' : ""}${e.active === false ? ' <span class="badge badge-rose">موقوفة</span>' : ""}</p>
      <p class="di-meta">${[e.spec, e.degree, e.phone, e.shift24 ? "24 ساعة" : "", e.image_url ? "صورة ✓" : ""].filter(Boolean).map(esc).join(" · ")}</p></div>
      <div class="di-actions"><button class="dash-btn" type="button" data-ent-edit="${esc(e.id)}">تعديل</button><button class="dash-btn" type="button" data-ent-toggle="${esc(e.id)}" data-active="${e.active === false ? 0 : 1}">${e.active === false ? "تفعيل" : "إيقاف"}</button><button class="dash-btn" type="button" data-ent-link="${esc(e.id)}" data-name="${esc(e.name)}">ربط حساب</button><button class="dash-btn danger" type="button" data-ent-del="${esc(e.id)}">حذف</button></div></div>`).join("") : emptyState("لا يوجد " + cfg.plural, "أضف أول " + cfg.label + ".")}</div>`;

  let deb; $("#admSearch").addEventListener("input", (ev) => { clearTimeout(deb); deb = setTimeout(() => { state.search = ev.target.value.trim(); renderTab(); }, 300); });
  $("#btnAddEntity").addEventListener("click", () => openEntityForm($("#entFormWrap"), type, null, []));
  main.addEventListener("click", async (ev) => {
    const ee = ev.target.closest("[data-ent-edit]");
    if (ee) { const id = ee.dataset.entEdit; const rows = await api("/rest/v1/entities?id=eq." + encodeURIComponent(id)); const e = Array.isArray(rows) ? rows[0] : null; if (!e) return showToast("تعذر الجلب", "err"); let days = []; if (e.type === "pharmacy") { const oc = await api("/rest/v1/oncall?pharmacy_id=eq." + encodeURIComponent(id) + "&select=day"); if (Array.isArray(oc)) days = oc.map(r => r.day); } return openEntityForm($("#entFormWrap"), e.type, e, days); }
    const et = ev.target.closest("[data-ent-toggle]");
    if (et) { const id = et.dataset.entToggle; const active = et.dataset.active !== "1"; const ok = await api("/rest/v1/entities?id=eq." + encodeURIComponent(id), "PATCH", { active }); showToast(ok ? (active ? "تم التفعيل" : "تم الإيقاف") : "تعذر", ok ? "ok" : "err"); if (ok) renderTab(); return; }
    const el = ev.target.closest("[data-ent-link]");
    if (el) { const id = el.dataset.entLink, name = el.dataset.entName; const email = prompt('ربط حساب جهة بـ «' + name + '»\nأدخل البريد:'); if (!email) return; const ins = await api("/rest/v1/entity_accounts", "POST", { email: email.trim().toLowerCase(), entity_id: id }, "resolution=merge-duplicates,return=minimal"); showToast(ins !== null ? "تم الربط" : "تعذر الربط", ins !== null ? "ok" : "err"); return; }
    const ed = ev.target.closest("[data-ent-del]");
    if (ed) { const id = ed.dataset.entDel; if (!confirm("حذف الجهة نهائياً؟")) return; const ok = await api("/rest/v1/entities?id=eq." + encodeURIComponent(id), "DELETE"); showToast(ok ? "تم الحذف" : "تعذر", ok ? "ok" : "err"); if (ok) renderTab(); }
  });
  main.addEventListener("submit", async (ev) => { if (ev.target.id === "entForm") { ev.preventDefault(); if (await saveEntity(type)) renderTab(); } }, { once: true });
}

function field(type, name, e, cfg) {
  const v = e || {}; if (cfg.fields && !cfg.fields.includes(name)) return "";
  const L = (t, inner) => `<label>${esc(t)}${inner}</label>`;
  const Lf = (t, inner) => `<label class="ef-full">${esc(t)}${inner}</label>`;
  switch (name) {
    case "name": return L((type === "pharmacy" ? "اسم الصيدلية" : type === "doctor" ? "اسم الطبيب/العيادة" : "الاسم") + " *", `<input id="efName" required value="${esc(v.name || "")}" />`);
    case "spec": return L(cfg.specLabel, `<input id="efSpec" value="${esc(v.spec || "")}" placeholder="${esc(cfg.specPlaceholder || "")}" />`);
    case "degree": return L(cfg.degreeLabel, `<input id="efDegree" value="${esc(v.degree || "")}" />`);
    case "exp": return L("سنوات الخبرة", `<input id="efExp" type="number" min="0" value="${v.exp ?? ""}" />`);
    case "owner": return L(type === "pharmacy" ? "الصيدلي/المالك" : "المالك/المسؤول", `<input id="efOwner" value="${esc(v.owner || "")}" />`);
    case "area": return L("المنطقة/الحي", `<input id="efArea" value="${esc(v.area || "")}" />`);
    case "address": return Lf("العنوان التفصيلي", `<input id="efAddress" value="${esc(v.address || "")}" />`);
    case "phone": return L("الهاتف", `<input id="efPhone" dir="ltr" inputmode="tel" value="${esc(v.phone || "")}" />`);
    case "whatsapp": return `<label class="ef-check"><input type="checkbox" id="efWa" ${v.whatsapp ? "checked" : ""}/> واتساب متاح على نفس الرقم</label>`;
    case "hours": return Lf("ساعات العمل", `<input id="efHours" value="${esc(v.hours || "")}" placeholder="مثال: يومياً 9 ص - 9 م" />`);
    case "shift24": return `<label class="ef-check"><input type="checkbox" id="ef24" ${v.shift24 ? "checked" : ""}/> تعمل 24 ساعة</label>`;
    case "services": return Lf("الخدمات (افصل بفاصلة ،)", `<input id="efServices" value="${esc((v.services || []).join("، "))}" />`);
    case "note": return Lf("نبذة/ملاحظات", `<textarea id="efNote" rows="2">${esc(v.note || "")}</textarea>`);
    case "image_file": return `<div class="ef-full"><label>الصورة (رفع ملف)</label><div class="adm-upload"><input id="efImageFile" type="file" accept="image/*" /><input id="efImageUrl" type="hidden" value="${esc(v.image_url || "")}" />${v.image_url ? `<img id="efImagePreview" class="adm-img-prev" src="${esc(v.image_url)}" alt="" />` : `<img id="efImagePreview" class="adm-img-prev" src="" alt="" hidden />`}<button type="button" class="dash-btn" id="efImageClear" ${v.image_url ? "" : "hidden"}>إزالة الصورة</button><p class="adm-hint">اختر صورة من الجهاز. تُرفع إلى Supabase Storage (bucket: ${esc(IMG_BUCKET)}).</p></div></div>`;
    case "image_url": return Lf("صورة (رابط)", `<input id="efImage" dir="ltr" value="${esc(v.image_url || "")}" />`);
    case "sort_order": return L("الترتيب", `<input id="efSort" type="number" value="${v.sort_order ?? v.rank ?? 100}" />`);
    case "lat": return L("خط العرض lat (اختياري)", `<input id="efLat" dir="ltr" value="${v.lat ?? ""}" />`);
    case "lng": return L("خط الطول lng (اختياري)", `<input id="efLng" dir="ltr" value="${v.lng ?? ""}" />`);
    case "featured": return `<label class="ef-check"><input type="checkbox" id="efFeat" ${v.featured ? "checked" : ""}/> مميزة/أولوية ظهور</label>`;
    case "active": return `<label class="ef-check"><input type="checkbox" id="efActive" ${v.active !== false ? "checked" : ""}/> نشطة (ظاهرة للزوار)</label>`;
    case "oncallWeek": return `<div class="ef-full" id="efOncallWrap"><p class="ef-oncall-title">قالب مناوبة أسبوعي (اختياري) — للجدول الشهري استخدم تبويب «المناوبة (شهري)»</p><div class="ef-days">${(DAYS || []).map(d => `<label class="ef-day"><input type="checkbox" value="${esc(d)}" data-day ${(v._oncallDays || []).includes(d) ? "checked" : ""}/> ${esc(d)}</label>`).join("")}</div></div>`;
    default: return "";
  }
}

function openEntityForm(wrap, type, e, oncallDays) {
  const cfg = ENTITY_FORMS[type] || ENTITY_FORMS.doctor;
  const isNew = !e; const v = e ? { ...e, _oncallDays: oncallDays || [] } : { active: true, sort_order: 100, services: [], lat: (SITE && SITE.center ? SITE.center[0] : 35.263), lng: (SITE && SITE.center ? SITE.center[1] : 36.745), _oncallDays: [] };
  const fields = cfg.fields.map(n => field(type, n, v, cfg)).join("");
  wrap.innerHTML = `<div class="adm-card"><h3 style="margin-bottom:14px">${isNew ? "إضافة " + esc(cfg.label) : "تعديل: " + esc(e.name)}</h3>
  <form id="entForm" class="ef-grid" novalidate data-type="${esc(type)}"><input type="hidden" id="efId" value="${esc(e ? e.id : "")}" />${fields}
    <div class="ef-full ef-actions"><button class="btn btn-primary" type="submit" id="efSubmit">${isNew ? "إضافة" : "حفظ التعديلات"}</button> <button class="btn btn-ghost" type="button" id="efCancel">إلغاء</button></div>
  </form></div>`;
  bindImagePreview(wrap);
  $("#efCancel").onclick = () => { wrap.innerHTML = ""; }; wrap.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function saveEntity(type) {
  const id = ($("#efId") && $("#efId").value.trim()) || ""; const name = $("#efName") ? $("#efName").value.trim() : "";
  if (!name) return showToast("اكتب الاسم", "err");
  const btn = $("#efSubmit"); if (btn) { btn.disabled = true; btn.textContent = "جارٍ الحفظ…"; }
  const g = (s) => $(s) ? $(s).value : ""; const num = (s) => { const v = g(s).trim(); return v === "" ? null : Number(v); }; const chk = (s) => $(s) ? $(s).checked : false;
  let image_url = $("#efImageUrl") ? $("#efImageUrl").value.trim() || null : ($("#efImage") ? $("#efImage").value.trim() || null : null);
  const fileInp = $("#efImageFile");
  if (fileInp && fileInp.files && fileInp.files[0]) {
    const up = await uploadImage(fileInp.files[0], "entities/" + type);
    if (up.error) {
      const keep = confirm(up.error + "\n\nهل تريد حفظ البيانات بدون الصورة؟ (يمكنك رفع الصورة لاحقاً بعد تهيئة Storage.)");
      if (!keep) { if (btn) { btn.disabled = false; btn.textContent = id ? "حفظ التعديلات" : "إضافة"; } return false; }
      showToast("سيتم الحفظ بدون الصورة", "err");
    } else if (up.url) image_url = up.url;
  }
  const so = Number(g("#efSort")) || 100;
  const payload = { id: id || ("e" + Date.now().toString(36)), type, name, spec: g("#efSpec").trim() || null, degree: g("#efDegree").trim() || null, exp: num("#efExp"), owner: g("#efOwner").trim() || null, area: g("#efArea").trim() || null, address: g("#efAddress").trim() || null, phone: g("#efPhone").trim() || null, whatsapp: chk("#efWa"), hours: g("#efHours").trim() || null, featured: chk("#efFeat"), shift24: chk("#ef24"), active: $("#efActive") ? $("#efActive").checked : true, rank: so, sort_order: so, image_url, services: g("#efServices") ? g("#efServices").split(/[,،]/).map(x => x.trim()).filter(Boolean) : [], note: g("#efNote").trim() || null, lat: num("#efLat"), lng: num("#efLng") };
  const saved = id ? await api("/rest/v1/entities?id=eq." + encodeURIComponent(id), "PATCH", payload) : await api("/rest/v1/entities", "POST", payload);
  if (saved === null) { showToast("تعذر الحفظ", "err"); if (btn) { btn.disabled = false; btn.textContent = id ? "حفظ التعديلات" : "إضافة"; } return false; }
  if (type === "pharmacy" && $("#efOncallWrap")) { const days = $$("#efOncallWrap [data-day]:checked").map(c => c.value); await api("/rest/v1/oncall?pharmacy_id=eq." + encodeURIComponent(payload.id), "DELETE"); if (days.length) await api("/rest/v1/oncall", "POST", days.map(d => ({ day: d, pharmacy_id: payload.id }))); }
  showToast(id ? "تم الحفظ" : "تمت الإضافة", "ok"); return true;
}

/* ---------- المناوبة الشهرية ---------- */
function monthRange(ym) { const [y, m] = ym.split("-").map(Number); const last = new Date(y, m, 0); return { from: `${ym}-01`, to: `${ym}-${String(last.getDate()).padStart(2, "0")}`, days: last.getDate(), y, m }; }
async function renderOncall(main) {
  const ym = state.month || new Date().toISOString().slice(0, 7); const r = monthRange(ym);
  const [pharm, sched] = await Promise.all([api("/rest/v1/entities?select=id,name,active&type=eq.pharmacy&order=sort_order.asc,name.asc"), api("/rest/v1/oncall_schedule?select=day,pharmacy_id&day=gte." + r.from + "&day=lte." + r.to)]);
  if (!Array.isArray(pharm)) { main.innerHTML = dashErr("تعذر تحميل الصيدليات"); return; }
  const byDay = {}; (Array.isArray(sched) ? sched : []).forEach(x => { (byDay[x.day] = byDay[x.day] || []).push(x.pharmacy_id); });
  const todayISO = new Date().toISOString().slice(0, 10); let rows = "";
  for (let d = 1; d <= r.days; d++) {
    const iso = `${r.y}-${String(r.m).padStart(2, "0")}-${String(d).padStart(2, "0")}`; const w = (DAYS || [])[new Date(r.y, r.m - 1, d).getDay()] || "";
    const names = (byDay[iso] || []).map(id => (pharm.find(p => p.id === id) || {}).name).filter(Boolean);
    rows += `<tr data-day="${iso}" style="${iso === todayISO ? 'background:var(--primary-soft,#e6f4f1);' : ''}"><td style="padding:8px;border-bottom:1px solid var(--border,#eee)"><b>${fmtNum(d)}</b> ${esc(w)} ${iso === todayISO ? '<span class="badge badge-blue">اليوم</span>' : ""}<div class="adm-hint" dir="ltr">${iso}</div></td><td style="padding:8px;border-bottom:1px solid var(--border,#eee)">${names.length ? names.map(n => `<span class="badge" style="margin:2px 4px;display:inline-block">${esc(n)}</span>`).join("") : '<span class="adm-hint">—</span>'}</td><td style="padding:8px;border-bottom:1px solid var(--border,#eee);white-space:nowrap"><button class="dash-btn" type="button" data-oc-edit="${iso}">تعيين</button> <button class="dash-btn danger" type="button" data-oc-clear="${iso}">مسح</button></td></tr>`;
  }
  main.innerHTML = `<div class="adm-head"><div><h1>مناوبة الصيدليات (شهري)</h1><p>تحكم كامل بالشهر. <b>الزوار يرون اليوم وغداً فقط</b>.</p></div></div>
  <div class="adm-card"><div class="adm-toolbar" style="margin:0"><label>الشهر <input id="ocMonth" type="month" value="${esc(ym)}" /></label><button class="btn btn-ghost btn-sm" id="ocCopyWeek" type="button">نسخ القالب الأسبوعي لهذا الشهر</button></div></div>
  <div id="ocFormWrap" class="adm-form-wrap"></div><div class="adm-card" style="overflow:auto"><table style="width:100%;border-collapse:collapse;font-size:13.5px"><thead><tr><th style="text-align:start;padding:8px">التاريخ</th><th style="text-align:start;padding:8px">الصيدليات المناوبة</th><th style="padding:8px">إجراء</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  $("#ocMonth").onchange = (ev) => { state.month = ev.target.value; renderTab(); };
  $("#ocCopyWeek").onclick = async () => { if (!confirm("نسخ القالب الأسبوعي لكل أيام " + ym + "؟")) return; const wk = await api("/rest/v1/oncall?select=day,pharmacy_id"); if (!Array.isArray(wk)) return showToast("تعذر جلب القالب", "err"); await api("/rest/v1/oncall_schedule?day=gte." + r.from + "&day=lte." + r.to, "DELETE"); const ins = []; for (let d = 1; d <= r.days; d++) { const iso = `${r.y}-${String(r.m).padStart(2, "0")}-${String(d).padStart(2, "0")}`; const w = (DAYS || [])[new Date(r.y, r.m - 1, d).getDay()]; wk.filter(x => x.day === w).forEach(x => ins.push({ day: iso, pharmacy_id: x.pharmacy_id })); } if (ins.length) await api("/rest/v1/oncall_schedule", "POST", ins, "return=minimal"); showToast("تم النسخ", "ok"); renderTab(); };
  main.onclick = async (ev) => { const ed = ev.target.closest("[data-oc-edit]"); if (ed) return openOncallDay($("#ocFormWrap"), ed.dataset.ocEdit, pharm, byDay[ed.dataset.ocEdit] || []); const cl = ev.target.closest("[data-oc-clear]"); if (cl) { if (!confirm("مسح مناوبة " + cl.dataset.ocClear + "؟")) return; await api("/rest/v1/oncall_schedule?day=eq." + cl.dataset.ocClear, "DELETE"); showToast("تم المسح", "ok"); renderTab(); } };
}
function openOncallDay(wrap, day, pharm, selected) {
  wrap.innerHTML = `<div class="adm-card"><h3 style="margin-bottom:10px">مناوبة ${esc(day)}</h3><div class="ef-days" style="margin-bottom:12px">${pharm.map(p => `<label class="ef-day" style="min-width:220px"><input type="checkbox" data-oc-ph="${esc(p.id)}" ${(selected || []).includes(p.id) ? "checked" : ""}/> ${esc(p.name)}</label>`).join("") || "<p class='adm-hint'>لا صيدليات.</p>"}</div><div class="ef-actions"><button class="btn btn-primary btn-sm" id="ocSaveDay" type="button">حفظ</button> <button class="btn btn-ghost btn-sm" id="ocCancelDay" type="button">إلغاء</button></div></div>`;
  $("#ocCancelDay").onclick = () => { wrap.innerHTML = ""; };
  $("#ocSaveDay").onclick = async () => { const ids = $$("[data-oc-ph]:checked", wrap).map(c => c.dataset.ocPh); await api("/rest/v1/oncall_schedule?day=eq." + encodeURIComponent(day), "DELETE"); if (ids.length) await api("/rest/v1/oncall_schedule", "POST", ids.map(id => ({ day, pharmacy_id: id })), "return=minimal"); showToast("تم الحفظ", "ok"); wrap.innerHTML = ""; renderTab(); };
}

/* ---------- FAQ ---------- */
async function renderFaq(main) {
  const list = await api("/rest/v1/faq?select=*&order=sort_order.asc,id.asc"); if (!Array.isArray(list)) { main.innerHTML = dashErr("تعذر تحميل الإرشادات"); return; }
  main.innerHTML = `<div class="adm-head"><div><h1>الإرشادات / اسأل</h1><p>${fmtNum(list.length)}</p></div><button class="btn btn-primary btn-sm" id="btnAddFaq" type="button">${icon("plus")} إضافة</button></div><div id="faqFormWrap" class="adm-form-wrap"></div><div class="adm-list">${list.map(f => `<div class="adm-row"><div class="di-body"><p class="di-main">${esc(f.q)} <span class="badge badge-blue">${esc(f.cat || "عام")}</span></p><p class="di-meta">${esc((f.a || "").slice(0, 140))}</p></div><div class="di-actions"><button class="dash-btn" data-faq-edit="${esc(f.id)}">تعديل</button><button class="dash-btn danger" data-faq-del="${esc(f.id)}">حذف</button></div></div>`).join("") || emptyState("لا إرشادات", "")}</div>`;
  $("#btnAddFaq").onclick = () => openFaqForm($("#faqFormWrap"), null);
  main.addEventListener("click", async (ev) => { const ee = ev.target.closest("[data-faq-edit]"); if (ee) { const r = await api("/rest/v1/faq?id=eq." + encodeURIComponent(ee.dataset.faqEdit)); if (Array.isArray(r) && r[0]) openFaqForm($("#faqFormWrap"), r[0]); return; } const ed = ev.target.closest("[data-faq-del]"); if (ed) { if (!confirm("حذف الإرشاد؟")) return; const ok = await api("/rest/v1/faq?id=eq." + encodeURIComponent(ed.dataset.faqDel), "DELETE"); showToast(ok ? "تم الحذف" : "تعذر", ok ? "ok" : "err"); if (ok) renderTab(); } });
  main.addEventListener("submit", async (ev) => { if (ev.target.id === "faqForm") { ev.preventDefault(); if (await saveFaq()) renderTab(); } });
}
function openFaqForm(wrap, f) { const v = f || { id: "f" + Date.now().toString(36), cat: "عام", sort_order: 100 }; wrap.innerHTML = `<div class="adm-card"><h3 style="margin-bottom:14px">${f ? "تعديل إرشاد" : "إرشاد جديد"}</h3><form id="faqForm" class="ef-grid" novalidate><input type="hidden" id="fqId" value="${esc(v.id || "")}" /><label>التصنيف<input id="fqCat" value="${esc(v.cat || "عام")}" /></label><label>الترتيب<input id="fqSort" type="number" value="${v.sort_order ?? 100}" /></label><label class="ef-full">السؤال *<input id="fqQ" required value="${esc(v.q || "")}" /></label><label class="ef-full">الإجابة *<textarea id="fqA" rows="4" required>${esc(v.a || "")}</textarea></label><div class="ef-full ef-actions"><button class="btn btn-primary" type="submit">حفظ</button> <button class="btn btn-ghost" type="button" id="fqCancel">إلغاء</button></div></form></div>`; $("#fqCancel").onclick = () => { wrap.innerHTML = ""; }; }
async function saveFaq() { const id = $("#fqId").value.trim() || ("f" + Date.now().toString(36)); const q = $("#fqQ").value.trim(), a = $("#fqA").value.trim(); if (!q || !a) return showToast("أكمل السؤال والإجابة", "err"); const payload = { id, cat: $("#fqCat").value.trim() || "عام", q, a, sort_order: Number($("#fqSort").value) || 100 }; const exists = await api("/rest/v1/faq?id=eq." + encodeURIComponent(id) + "&select=id"); const ok = Array.isArray(exists) && exists.length ? await api("/rest/v1/faq?id=eq." + encodeURIComponent(id), "PATCH", payload) : await api("/rest/v1/faq", "POST", payload); if (ok === null) return showToast("تعذر الحفظ", "err"); showToast("تم الحفظ", "ok"); return true; }

/* ---------- الإعلانات ---------- */
const PLACEMENT_LABEL = { home: "الرئيسية", detail: "صفحات التفاصيل", all: "كل الصفحات" };
async function renderAds(main) {
  const list = await api("/rest/v1/ads?select=*&order=sort_order.asc,created_at.desc"); if (!Array.isArray(list)) { main.innerHTML = dashErr("تعذر تحميل الإعلانات"); return; }
  main.innerHTML = `<div class="adm-head"><div><h1>الإعلانات</h1><p>${fmtNum(list.length)}</p></div><button class="btn btn-primary btn-sm" id="btnAddAd" type="button">${icon("plus")} إعلان جديد</button></div><div id="adFormWrap" class="adm-form-wrap"></div><div class="adm-list">${list.map(a => `<div class="adm-row"><div class="di-body"><p class="di-main">${esc(a.title)} <span class="badge badge-blue">${esc(PLACEMENT_LABEL[a.placement] || a.placement)}</span>${a.active ? "" : ' <span class="badge badge-rose">موقوف</span>'}</p><p class="di-meta">${[a.body, a.link_url].filter(Boolean).map(esc).join(" · ")}</p></div><div class="di-actions"><button class="dash-btn" data-ad-edit="${esc(a.id)}">تعديل</button><button class="dash-btn" data-ad-toggle="${esc(a.id)}" data-active="${a.active ? 1 : 0}">${a.active ? "إيقاف" : "تفعيل"}</button><button class="dash-btn danger" data-ad-del="${esc(a.id)}">حذف</button></div></div>`).join("") || emptyState("لا إعلانات", "")}</div>`;
  $("#btnAddAd").onclick = () => openAdForm($("#adFormWrap"), null);
  main.addEventListener("click", async (ev) => { const ae = ev.target.closest("[data-ad-edit]"); if (ae) { const r = await api("/rest/v1/ads?id=eq." + encodeURIComponent(ae.dataset.adEdit)); if (Array.isArray(r) && r[0]) openAdForm($("#adFormWrap"), r[0]); return; } const at = ev.target.closest("[data-ad-toggle]"); if (at) { const active = at.dataset.active !== "1"; const ok = await api("/rest/v1/ads?id=eq." + encodeURIComponent(at.dataset.adToggle), "PATCH", { active }); showToast(ok ? "تم" : "تعذر", ok ? "ok" : "err"); if (ok) renderTab(); return; } const ad = ev.target.closest("[data-ad-del]"); if (ad) { if (!confirm("حذف الإعلان؟")) return; const ok = await api("/rest/v1/ads?id=eq." + encodeURIComponent(ad.dataset.adDel), "DELETE"); showToast(ok ? "تم الحذف" : "تعذر", ok ? "ok" : "err"); if (ok) renderTab(); } });
  main.addEventListener("submit", async (ev) => { if (ev.target.id === "adForm") { ev.preventDefault(); if (await saveAd()) renderTab(); } });
}
function openAdForm(wrap, a) { const v = a || { placement: "home", active: true, sort_order: 100 }; wrap.innerHTML = `<div class="adm-card"><h3 style="margin-bottom:14px">${a ? "تعديل الإعلان" : "إعلان جديد"}</h3><form id="adForm" class="ef-grid" novalidate><input type="hidden" id="afId" value="${esc(a ? a.id : "")}" /><label class="ef-full">العنوان *<input id="afTitle" required value="${esc(v.title || "")}" /></label><label class="ef-full">النص<input id="afBody" value="${esc(v.body || "")}" /></label><label class="ef-full">رابط الصورة<input id="afImg" dir="ltr" value="${esc(v.image_url || "")}" placeholder="https://..." /></label><label>رابط الانتقال<input id="afLink" dir="ltr" value="${esc(v.link_url || "")}" /></label><label>المكان<select id="afPlacement"><option value="home" ${v.placement === "home" ? "selected" : ""}>الرئيسية</option><option value="detail" ${v.placement === "detail" ? "selected" : ""}>التفاصيل</option><option value="all" ${v.placement === "all" ? "selected" : ""}>الكل</option></select></label><label>الترتيب<input id="afSort" type="number" value="${v.sort_order ?? 100}" /></label><div class="ef-full ef-checks"><label><input type="checkbox" id="afActive" ${v.active ? "checked" : ""}/> نشط</label></div><div class="ef-full ef-actions"><button class="btn btn-primary" type="submit">حفظ</button> <button class="btn btn-ghost" type="button" id="afCancel">إلغاء</button></div></form></div>`; $("#afCancel").onclick = () => { wrap.innerHTML = ""; }; }
async function saveAd() { const id = $("#afId").value.trim(); const title = $("#afTitle").value.trim(); if (!title) return showToast("اكتب العنوان", "err"); const payload = { title, body: $("#afBody").value.trim() || null, image_url: $("#afImg").value.trim() || null, link_url: $("#afLink").value.trim() || null, placement: $("#afPlacement").value, active: $("#afActive").checked, sort_order: Number($("#afSort").value) || 100 }; const ok = id ? await api("/rest/v1/ads?id=eq." + encodeURIComponent(id), "PATCH", payload) : await api("/rest/v1/ads", "POST", payload); if (ok === null) return showToast("تعذر الحفظ", "err"); showToast("تم الحفظ", "ok"); return true; }

/* ---------- حسابات الجهات ---------- */
async function renderAccounts(main) {
  const [accs, ents] = await Promise.all([api("/rest/v1/entity_accounts?select=*&order=created_at.desc"), api("/rest/v1/entities?select=id,name,type&order=sort_order.asc")]);
  if (!Array.isArray(accs)) { main.innerHTML = dashErr("تعذر تحميل الحسابات"); return; }
  const nameOf = (id) => { const e = (ents || []).find(x => x.id === id); return e ? e.name : id; };
  main.innerHTML = `<div class="adm-head"><div><h1>حسابات الجهات</h1><p>ربط حساب جهة بصفحتها.</p></div></div><div class="adm-card"><form id="accForm" class="ef-grid" novalidate><label>البريد<input id="aaEmail" type="email" dir="ltr" required /></label><label>الجهة<select id="aaEntity">${(ents || []).map(e => `<option value="${esc(e.id)}">${esc(e.name)}</option>`).join("")}</select></label><div class="ef-full"><button class="btn btn-primary btn-sm" type="submit">ربط</button></div></form></div><div class="adm-list">${accs.map(a => `<div class="adm-row"><div class="di-body"><p class="di-main" dir="ltr">${esc(a.email)}</p><p class="di-meta">تدير: ${esc(nameOf(a.entity_id))}</p></div><button class="dash-btn danger" data-acc-del="${esc(a.email)}">فك الربط</button></div>`).join("") || emptyState("لا حسابات", "")}</div>`;
  main.addEventListener("submit", async (ev) => { if (ev.target.id !== "accForm") return; ev.preventDefault(); const email = $("#aaEmail").value.trim().toLowerCase(), entity_id = $("#aaEntity").value; if (!email) return; const ins = await api("/rest/v1/entity_accounts", "POST", { email, entity_id }, "resolution=merge-duplicates,return=minimal"); showToast(ins !== null ? "تم الربط" : "تعذر", ins !== null ? "ok" : "err"); if (ins !== null) renderTab(); });
  main.addEventListener("click", async (ev) => { const del = ev.target.closest("[data-acc-del]"); if (!del) return; if (!confirm("فك الربط؟")) return; const ok = await api("/rest/v1/entity_accounts?email=eq." + encodeURIComponent(del.dataset.accDel), "DELETE"); showToast(ok ? "تم" : "تعذر", ok ? "ok" : "err"); if (ok) renderTab(); });
}

/* ---------- الرسائل والأسئلة ---------- */
async function renderInbox(main, kind) {
  const isQ = kind === "questions"; const list = await api(`/rest/v1/${kind}?select=*&order=created_at.desc`);
  if (!Array.isArray(list)) { main.innerHTML = dashErr(isQ ? "تعذر تحميل الأسئلة" : "تعذر تحميل الرسائل"); return; }
  main.innerHTML = `<div class="adm-head"><div><h1>${isQ ? "أسئلة الزوار" : "رسائل التواصل"}</h1><p>${fmtNum(list.length)}</p></div></div><div class="adm-list">${list.map(x => `<div class="adm-row"><div class="di-body"><p class="di-main">${isQ ? esc(x.question) : `<span class="badge badge-blue">${esc(x.topic || "رسالة")}</span> ${esc(x.body)}`}</p><p class="di-meta">${[x.name, x.phone || x.contact, x.created_at ? new Date(x.created_at).toLocaleString("ar-SY") : ""].filter(Boolean).map(esc).join(" · ")}</p></div><button class="dash-btn danger" data-inbox-del="${esc(x.id)}">حذف</button></div>`).join("") || emptyState("لا يوجد", "")}</div>`;
  main.onclick = async (ev) => { const del = ev.target.closest("[data-inbox-del]"); if (!del) return; if (!confirm("حذف؟")) return; const ok = await api(`/rest/v1/${kind}?id=eq.` + encodeURIComponent(del.dataset.inboxDel), "DELETE"); showToast(ok ? "تم الحذف" : "تعذر", ok ? "ok" : "err"); if (ok) renderTab(); };
}

/* ---------- الإعدادات ---------- */
async function renderSettings(main) {
  const rows = await api("/rest/v1/app_settings?select=*"); const map = {}; (Array.isArray(rows) ? rows : []).forEach(r => map[r.key] = r.value);
  const site = map.site || (window.SITE || {});
  main.innerHTML = `<div class="adm-head"><div><h1>إعدادات التطبيق</h1><p>تحكم بنصوص/بيانات الموقع العامة.</p></div></div>
  <div class="adm-card"><form id="siteSettings" class="ef-grid" novalidate>
    <label class="ef-full">اسم الموقع<input id="stName" value="${esc(site.name || 'دليل صوران الطبي')}" /></label>
    <label>المدينة<input id="stCity" value="${esc(site.city || 'صوران')}" /></label>
    <label>المنطقة<input id="stRegion" value="${esc(site.region || '')}" /></label>
    <label class="ef-full">الشعار<input id="stTag" value="${esc(site.tagline || '')}" /></label>
    <label class="ef-full">وصف SEO<textarea id="stDesc" rows="2">${esc(site.description || '')}</textarea></label>
    <label>هاتف المعلومات<input id="stPhone" dir="ltr" value="${esc(site.infoPhone || '')}" /></label>
    <label>البريد<input id="stEmail" dir="ltr" value="${esc(site.email || '')}" /></label>
    <label>اسم المطور<input id="stDevName" value="${esc((site.developer && site.developer.name) || '')}" /></label>
    <label>هاتف المطور<input id="stDevPhone" dir="ltr" value="${esc((site.developer && site.developer.phone) || '')}" /></label>
    <label class="ef-full">روابط التواصل (JSON)<textarea id="stSocial" rows="3" dir="ltr">${esc(JSON.stringify(site.social || {}, null, 2))}</textarea></label>
    <div class="ef-full ef-actions"><button class="btn btn-primary" type="submit">حفظ الإعدادات</button></div>
  </form></div>
  <div class="adm-card"><h3 style="margin-bottom:8px">حالة الإدارة</h3><p class="adm-hint">المدير: <b dir="ltr">${esc((getSession() || {}).email || '')}</b></p><p class="adm-hint">رفع الصور يحتاج Storage bucket عام باسم <b dir="ltr">${esc(IMG_BUCKET)}</b> مع صلاحية كتابة للمدير. يمكن تغييره عبر <code>SUPABASE_CONFIG.imageBucket</code>.</p></div>`;
  $("#siteSettings").onsubmit = async (ev) => { ev.preventDefault(); let social = {}; try { social = JSON.parse($("#stSocial").value || "{}"); } catch (_) { return showToast("JSON الروابط غير صالح", "err"); } const value = { ...site, name: $("#stName").value.trim(), city: $("#stCity").value.trim(), region: $("#stRegion").value.trim(), tagline: $("#stTag").value.trim(), description: $("#stDesc").value.trim(), infoPhone: $("#stPhone").value.trim(), email: $("#stEmail").value.trim(), developer: { ...(site.developer || {}), name: $("#stDevName").value.trim(), phone: $("#stDevPhone").value.trim() }, social }; const ok = await api("/rest/v1/app_settings", "POST", { key: "site", value, updated_at: new Date().toISOString() }, "resolution=merge-duplicates,return=minimal"); showToast(ok !== null ? "تم حفظ الإعدادات" : "تعذر الحفظ", ok !== null ? "ok" : "err"); };
}

document.addEventListener("DOMContentLoaded", () => { bindLogin(); if (getSession()) showApp(); else showLogin(); });
