-- ============================================================
-- دليل صوران الطبي — إضافة أعمدة الصيدلي والموظفين لجدول entidades
-- نفّذ في Supabase Dashboard → SQL Editor
-- ============================================================

-- اسم الصيدلي المسؤول عن الصيدلية (يُعرض تحت اسم الصيدلية)
alter table public.entities add column if not exists pharmacist text;

-- قائمة الموظفين للمشافي والمراكز الصحية (JSONB)
-- كل موظف: { name, jobTitle, time, days }
alter table public.entities add column if not exists staff jsonb not null default '[]'::jsonb;

-- فهرس مساعدة للبحث حسبเภت الصيدلي (اختياري)
create index if not exists idx_entities_pharmacist on public.entities(pharmacist);

-- ============================================================
