-- ============================================================
-- ترقية لوحة التحكم الشاملة — أُنفذت فعلياً على القاعدة الحية
-- 1) صلاحيات الأدمن الكاملة على الجهات والمناوبة
-- 2) جدول الإعلانات (ads) مع سياساته
-- آمن للتنفيذ المتكرر.
-- ============================================================

-- ---------- 1) الجهات: إضافة وحذف للأدمن ----------
drop policy if exists "entities_admin_insert" on public.entities;
drop policy if exists "entities_admin_delete" on public.entities;
create policy "entities_admin_insert" on public.entities for insert to authenticated with check (true);
create policy "entities_admin_delete" on public.entities for delete to authenticated using (true);

-- ---------- المناوبة: إدارة الجدول من اللوحة ----------
drop policy if exists "oncall_admin_insert" on public.oncall;
drop policy if exists "oncall_admin_delete" on public.oncall;
create policy "oncall_admin_insert" on public.oncall for insert to authenticated with check (true);
create policy "oncall_admin_delete" on public.oncall for delete to authenticated using (true);

-- ---------- 2) جدول الإعلانات ----------
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

alter table public.ads enable row level security;

drop policy if exists "ads_public_select" on public.ads;
drop policy if exists "ads_admin_select"  on public.ads;
drop policy if exists "ads_admin_insert"  on public.ads;
drop policy if exists "ads_admin_update"  on public.ads;
drop policy if exists "ads_admin_delete"  on public.ads;

create policy "ads_public_select" on public.ads for select to anon, authenticated using (active);
create policy "ads_admin_select"  on public.ads for select to authenticated using (true);
create policy "ads_admin_insert"  on public.ads for insert to authenticated with check (true);
create policy "ads_admin_update"  on public.ads for update to authenticated using (true);
create policy "ads_admin_delete"  on public.ads for delete to authenticated using (true);
