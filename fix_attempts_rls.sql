-- Fix: Add missing RLS policies for the attempts table

-- Drop any existing policies on attempts just to be safe
drop policy if exists "Students can insert own attempts" on public.attempts;
drop policy if exists "Students can view own attempts" on public.attempts;
drop policy if exists "Teachers can view attempts for their quizzes" on public.attempts;

-- 1. Allow students to submit their attempts
create policy "Students can insert own attempts" on public.attempts
  for insert with check (student_id = auth.uid());

-- 2. Allow students to view their own attempts
create policy "Students can view own attempts" on public.attempts
  for select using (student_id = auth.uid());

-- 3. Allow teachers to view attempts for quizzes they created
create policy "Teachers can view attempts for their quizzes" on public.attempts
  for select using (
    exists (
      select 1 from public.quizzes q
      where q.id = quiz_id and q.teacher_id = auth.uid()
    )
  );
