-- Fix: Drop old policy and recreate it with WITH CHECK so INSERT works
drop policy if exists "Teachers can CRUD own quizzes" on public.quizzes;

create policy "Teachers can CRUD own quizzes" on public.quizzes
  for all
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());
