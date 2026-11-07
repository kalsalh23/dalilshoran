-- صلاحيات لوحة التحكم للمستخدم المسجّل (authenticated)
drop policy if exists "questions_admin_select" on public.questions;
drop policy if exists "questions_admin_delete" on public.questions;
drop policy if exists "messages_admin_select" on public.messages;
drop policy if exists "messages_admin_delete" on public.messages;
drop policy if exists "entities_admin_select"  on public.entities;
drop policy if exists "entities_admin_update"  on public.entities;

create policy "questions_admin_select" on public.questions for select to authenticated using (true);
create policy "questions_admin_delete" on public.questions for delete to authenticated using (true);
create policy "messages_admin_select"  on public.messages  for select to authenticated using (true);
create policy "messages_admin_delete"  on public.messages  for delete to authenticated using (true);
create policy "entities_admin_select"  on public.entities  for select to authenticated using (true);
create policy "entities_admin_update"  on public.entities  for update to authenticated using (true);
