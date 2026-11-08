-- ============================================================
 supabase/fix-entities-columns.sql
-- أضف الأعمدة الناقصة لجدول entities لتناسب لوحة الإدارة
-- نفّذ في Supabase Dashboard → SQL Editor (يقبل service_role/postgres)
-- ثم انتظر ~دقيقة لتحديث "schema cache"، أو افتح Table Editor لتسريع التحديث.
-- ============================================================

alter table public.entities add column if not exists image_url text;
alter table public.entities add column if not exists rank integer;
alter table public.entities add column if not exists sort_order integer;
alter table public.entities add column if not exists owner text;
alter table public.entities add column if not exists area text;
alter table public.entities add column if not exists address text;
alter table public.entities add column if not exists phone text;
alter table public.entities add column if not exists whatsapp boolean default false;
alter table public.entities add column if not exists hours text;
alter table public.entities add column if not exists shift24 boolean default false;
alter table public.entities add column if not exists featured boolean default false;
alter table public.entities add column if not exists active boolean default true;
alter table public.entities add column if not exists services text[] default '{}';
alter table public.entities add column if not exists note text;
alter table public.entities add column if not exists lat double precision;
alter table public.entities add column if not exists lng double precision;

-- فهرسة مساعدة للبحث حسب النوع والاسم
create index if not exists idx_entities_type on public.entities(type);
create index if not exists idx_entities_name on public.entities(name);
