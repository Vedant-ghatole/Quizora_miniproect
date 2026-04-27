-- Create the attempts table (run this in Supabase SQL Editor)
create table if not exists public.attempts (
  id uuid default gen_random_uuid() primary key,
  quiz_id uuid references public.quizzes(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  score integer not null default 0,
  total_marks integer not null default 0,
  answers jsonb default '[]'::jsonb,
  submitted_at timestamptz default now(),
  unique(quiz_id, student_id)
);

alter table public.attempts enable row level security;

-- Drop old policies to avoid duplicates
drop policy if exists "Students can insert own attempts" on public.attempts;
drop policy if exists "Students can view own attempts" on public.attempts;
drop policy if exists "Teachers can view attempts for their quizzes" on public.attempts;

-- Students can submit their own attempts
create policy "Students can insert own attempts" on public.attempts
  for insert with check (student_id = auth.uid());

-- Students can view their own attempts
create policy "Students can view own attempts" on public.attempts
  for select using (student_id = auth.uid());

-- Teachers can view attempts for their own quizzes
create policy "Teachers can view attempts for their quizzes" on public.attempts
  for select using (
    exists (
      select 1 from public.quizzes q
      where q.id = quiz_id and q.teacher_id = auth.uid()
    )
  );
