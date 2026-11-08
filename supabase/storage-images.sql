-- ============================================================
-- Supabase Storage: bucket للصور (entities/ads)
-- نفّذ هذا الملف في Supabase Dashboard → SQL Editor
-- ثم تأكد من أن المستخدم المدير يملك role=admin في user_metadata.
-- ============================================================

-- إنشاء bucket عام (للروابط العامة image_url)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'images',
  'images',
  true,
  5242880, -- 5 MB
  array['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- سياسات storage.objects للـ bucket images
-- ملاحظة: is_admin() يجب أن تكون معرفة (راجع entity-accounts.sql).
-- إن لم تكن موجودة، استبدل public.is_admin() بشرط role=admin المناسب.

drop policy if exists "images_public_read" on storage.objects;
drop policy if exists "images_admin_insert" on storage.objects;
drop policy if exists "images_admin_update" on storage.objects;
drop policy if exists "images_admin_delete" on storage.objects;

-- قراءة عامة (لأن bucket عام ولعرض الصور في الموقع)
create policy "images_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'images');

-- كتابة/تعديل/حذف للمدير فقط
create policy "images_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'images' and public.is_admin());

create policy "images_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'images' and public.is_admin())
  with check (bucket_id = 'images' and public.is_admin());

create policy "images_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'images' and public.is_admin());
