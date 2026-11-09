-- ============================================================
-- دليل صوران الطبي — جدول اشتراكات الإشعارات (Push Subscriptions)
-- نفّذ هذا في محرر SQL في Supabase
-- ============================================================

create table if not exists public.push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- تمكين RLS
alter table public.push_subscriptions enable row level security;

-- سياسة: anyone can insert (للعملاء عند الاشتراك)
create policy "push_subscriptions_insert"
  on public.push_subscriptions for insert
  to anon
  with check (true);

-- سياسة: anyone can read (للإرسال من الدوال(server-side) نستخدم service_role في API)
create policy "push_subscriptions_select"
  on public.push_subscriptions for select
  to anon
  using (true);

-- سياسة: anyone can delete (لإلغاء الاشتراك)
create policy "push_subscriptions_delete"
  on public.push_subscriptions for delete
  to anon
  using (true);

-- ملاحظة: للإرسال الفعلي للإشعارات، يُستخدم مفتاح service_role في الـ API
-- وليسanon key، لأن RLS قد يمنع القراءة للكتابة الجماعية.
-- بديلاً: أضف سياسة تسمح لـ service_role بكل شيء (المفترض في supabase).
