-- ============================================================
-- إصلاح: سياسات إدخال الزوار المفقودة (questions / messages)
-- المشكلة: الإدخال من الموقع يفشل بـ 42501 (RLS) لأن هاتين
-- السياستين لم تُطبقا على قاعدة البيانات الحية.
-- التنفيذ: لوحة Supabase → SQL Editor → الصق والتنفيذ.
-- آمن للتنفيذ المتكرر (idempotent).
-- ============================================================

-- الأسئلة: يسمح لأي زائر بإرسال سؤال (إدخال فقط، لا قراءة)
drop policy if exists "questions_public_insert" on public.questions;
create policy "questions_public_insert" on public.questions
  for insert to anon with check (true);

-- رسائل التواصل: يسمح لأي زائر بإرسال رسالة (إدخال فقط، لا قراءة)
drop policy if exists "messages_public_insert" on public.messages;
create policy "messages_public_insert" on public.messages
  for insert to anon with check (true);
