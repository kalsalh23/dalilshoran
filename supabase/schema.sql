-- ============================================================
-- دليل صوران الطبي — مخطط قاعدة البيانات (Supabase / PostgreSQL)
-- يُنفَّذ من لوحة Supabase (SQL Editor) أو عبر Management API
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- الجهات: أطباء، صيدليات، مشافي، مخابر، أشعة، مراكز صحية ----------
create table if not exists public.entities (
  id          text primary key,
  type        text not null check (type in ('doctor','pharmacy','hospital','lab','radiology','health-center')),
  name        text not null,
  spec        text,
  degree      text,
  exp         integer,
  area        text,
  address     text,
  phone       text,
  whatsapp    boolean not null default false,
  hours       text,
  featured    boolean not null default false,
  "rank"      integer,
  services    jsonb not null default '[]'::jsonb,
  note        text,
  lat         double precision,
  lng         double precision,
  shift24     boolean not null default false,
  owner       text,
  sort_order  integer not null default 100,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------- جدول صيدليات المناوبة الأسبوعي ----------
create table if not exists public.oncall (
  day         text not null,
  pharmacy_id text not null references public.entities(id) on delete cascade,
  primary key (day, pharmacy_id)
);

-- ---------- الأسئلة والإرشادات التوعوية ----------
create table if not exists public.faq (
  id         text primary key,
  cat        text not null default 'عام',
  q          text not null,
  a          text not null,
  sort_order integer not null default 100
);

-- ---------- أسئلة الزوار (إدخال فقط — لا قراءة للعامة) ----------
create table if not exists public.questions (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  phone      text,
  question   text not null,
  created_at timestamptz not null default now()
);

-- ---------- رسائل التواصل (إدخال فقط — لا قراءة للعامة) ----------
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  topic      text,
  name       text,
  contact    text,
  body       text not null,
  created_at timestamptz not null default now()
);

-- ---------- الإعلانات (تُدار بالكامل من لوحة التحكم) ----------
create table if not exists public.ads (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  body       text,
  image_url  text,
  link_url   text,
  placement  text not null default 'home' check (placement in ('home','detail','all')),
  active     boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now()
);

-- ============================================================
-- أمان الصفوف (RLS)
-- ============================================================
alter table public.entities  enable row level security;
alter table public.oncall    enable row level security;
alter table public.faq       enable row level security;
alter table public.questions enable row level security;
alter table public.messages  enable row level security;
alter table public.ads       enable row level security;

drop policy if exists "entities_public_select"  on public.entities;
drop policy if exists "oncall_public_select"    on public.oncall;
drop policy if exists "faq_public_select"       on public.faq;
drop policy if exists "questions_public_insert" on public.questions;
drop policy if exists "messages_public_insert"  on public.messages;
drop policy if exists "ads_public_select"       on public.ads;

-- القراءة العامة للدليل
create policy "entities_public_select"  on public.entities  for select to anon, authenticated using (active);
create policy "oncall_public_select"    on public.oncall    for select to anon, authenticated using (true);
create policy "faq_public_select"       on public.faq       for select to anon, authenticated using (true);
create policy "ads_public_select"       on public.ads       for select to anon, authenticated using (active);

-- الإدخال فقط (بدون قراءة) لحماية خصوصية المرسلين
create policy "questions_public_insert" on public.questions for insert to anon with check (true);
create policy "messages_public_insert"  on public.messages  for insert to anon with check (true);

-- ============================================================
-- صلاحيات لوحة التحكم (مستخدم مسجّل = أدمن)
-- انظر أيضاً: admin-policies.sql و admin-full.sql
-- ============================================================
create policy "entities_admin_select"  on public.entities  for select  to authenticated using (true);
create policy "entities_admin_insert"  on public.entities  for insert  to authenticated with check (true);
create policy "entities_admin_update"  on public.entities  for update  to authenticated using (true);
create policy "entities_admin_delete"  on public.entities  for delete  to authenticated using (true);
create policy "oncall_admin_insert"    on public.oncall    for insert  to authenticated with check (true);
create policy "oncall_admin_delete"    on public.oncall    for delete  to authenticated using (true);
create policy "ads_admin_select"       on public.ads       for select  to authenticated using (true);
create policy "ads_admin_insert"       on public.ads       for insert  to authenticated with check (true);
create policy "ads_admin_update"       on public.ads       for update  to authenticated using (true);
create policy "ads_admin_delete"       on public.ads       for delete  to authenticated using (true);
create policy "questions_admin_select" on public.questions for select  to authenticated using (true);
create policy "questions_admin_delete" on public.questions for delete  to authenticated using (true);
create policy "messages_admin_select"  on public.messages  for select  to authenticated using (true);
create policy "messages_admin_delete"  on public.messages  for delete  to authenticated using (true);
