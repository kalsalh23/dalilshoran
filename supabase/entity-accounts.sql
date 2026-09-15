-- ============================================================
-- فصل الصلاحيات: أدمن النظام vs حسابات الجهات
-- 1) دوال هوية: is_admin() و owns_entity()
-- 2) جدول entity_accounts (ربط بريد حساب جهة بجهة)
-- 3) استبدال سياسات authenticated العامة بسياسات مفصولة
-- آمن للتنفيذ المتكرر.
-- ============================================================

-- ---------- 1) دوال المساعدة ----------
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = auth, public as $$
  select coalesce((
    select u.raw_user_meta_data ->> 'role' = 'admin'
    from auth.users u where u.id = auth.uid()
  ), false);
$$;

create or replace function public.entity_email() returns text
language sql stable as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

create or replace function public.owns_entity(eid text) returns boolean
language sql stable security definer set search_path = public, auth as $$
  select exists (
    select 1 from public.entity_accounts ea
    where lower(ea.email) = public.entity_email() and ea.entity_id = eid
  );
$$;

-- ---------- 2) جدول ربط حسابات الجهات ----------
create table if not exists public.entity_accounts (
  email      text primary key,
  entity_id  text not null references public.entities(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.entity_accounts enable row level security;

drop policy if exists "ea_admin_all"  on public.entity_accounts;
drop policy if exists "ea_own_select" on public.entity_accounts;
create policy "ea_admin_all"  on public.entity_accounts for all   to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "ea_own_select" on public.entity_accounts for select to authenticated using (lower(email) = public.entity_email());

-- ---------- 3) الجهات: الأدمن كامل، والجهة تملك صفها فقط ----------
drop policy if exists "entities_admin_select" on public.entities;
drop policy if exists "entities_admin_insert" on public.entities;
drop policy if exists "entities_admin_update" on public.entities;
drop policy if exists "entities_admin_delete" on public.entities;
create policy "entities_admin_select" on public.entities for select to authenticated using (public.is_admin() or public.owns_entity(entities.id));
create policy "entities_admin_insert" on public.entities for insert to authenticated with check (public.is_admin());
create policy "entities_admin_update" on public.entities for update to authenticated
  using (public.is_admin() or public.owns_entity(entities.id))
  with check (public.is_admin() or public.owns_entity(entities.id));
create policy "entities_admin_delete" on public.entities for delete to authenticated using (public.is_admin());

-- ---------- المناوبة: الأدمن كامل، والصيدلية تدير صفوفها ----------
drop policy if exists "oncall_admin_insert" on public.oncall;
drop policy if exists "oncall_admin_delete" on public.oncall;
create policy "oncall_admin_insert" on public.oncall for insert to authenticated with check (public.is_admin() or public.owns_entity(oncall.pharmacy_id));
create policy "oncall_admin_delete" on public.oncall for delete to authenticated using (public.is_admin() or public.owns_entity(oncall.pharmacy_id));

-- ---------- الإعلانات: الأدمن فقط ----------
drop policy if exists "ads_admin_select" on public.ads;
drop policy if exists "ads_admin_insert" on public.ads;
drop policy if exists "ads_admin_update" on public.ads;
drop policy if exists "ads_admin_delete" on public.ads;
create policy "ads_admin_select" on public.ads for select  to authenticated using (public.is_admin());
create policy "ads_admin_insert" on public.ads for insert  to authenticated with check (public.is_admin());
create policy "ads_admin_update" on public.ads for update  to authenticated using (public.is_admin());
create policy "ads_admin_delete" on public.ads for delete  to authenticated using (public.is_admin());

-- ---------- الأسئلة والرسائل: الأدمن فقط ----------
drop policy if exists "questions_admin_select" on public.questions;
drop policy if exists "questions_admin_delete" on public.questions;
drop policy if exists "messages_admin_select"  on public.messages;
drop policy if exists "messages_admin_delete"  on public.messages;
create policy "questions_admin_select" on public.questions for select to authenticated using (public.is_admin());
create policy "questions_admin_delete" on public.questions for delete to authenticated using (public.is_admin());
create policy "messages_admin_select"  on public.messages  for select to authenticated using (public.is_admin());
create policy "messages_admin_delete"  on public.messages  for delete to authenticated using (public.is_admin());
