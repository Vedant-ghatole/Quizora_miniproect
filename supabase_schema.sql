-- ============================================================
-- QUIZORA DATABASE SCHEMA (FINAL VERSION)
-- ============================================================

-- EXTENSIONS (needed for uuid)
create extension if not exists "pgcrypto";

--------------------------------------------------
-- 1. TODOS TABLE (Optional, for testing)
--------------------------------------------------
create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_completed boolean default false,
  created_at timestamptz default now()
);

--------------------------------------------------
-- 2. PROFILES TABLE
--------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null default '',
  role text not null default 'student'
    check (role in ('student', 'teacher')),
  institution text default '',
  department text default '',
  semester text default '',
  roll_number text default '',
  class_code text default '',
  avatar_url text default '',
  created_at timestamptz default now()
);

-- Index for role-based queries
create index if not exists idx_profiles_role on public.profiles(role);

--------------------------------------------------
-- 3. QUIZZES TABLE
--------------------------------------------------
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text default '',
  subject text not null,
  duration integer not null default 30,
  total_marks integer not null default 0,
  pass_percentage integer not null default 40,
  type text default 'mcq',
  status text default 'scheduled'
    check (status in ('scheduled', 'active', 'closed')),
  topics text[] default '{}',
  scheduled_at timestamptz,
  created_at timestamptz default now(),
  questions jsonb default '[]'::jsonb,

  -- 🔥 NEW (PIN SYSTEM)
  quiz_pin text unique
);

-- Indexes for performance
create index if not exists idx_quizzes_teacher on public.quizzes(teacher_id);
create index if not exists idx_quizzes_status on public.quizzes(status);
create index if not exists idx_quizzes_scheduled on public.quizzes(scheduled_at);

--------------------------------------------------
-- 4. ATTEMPTS TABLE
--------------------------------------------------
create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  score integer not null default 0,
  total_marks integer not null default 0,
  answers jsonb default '[]'::jsonb,
  submitted_at timestamptz default now(),

  unique(quiz_id, student_id)
);

-- Indexes for faster queries
create index if not exists idx_attempts_student on public.attempts(student_id);
create index if not exists idx_attempts_quiz on public.attempts(quiz_id);

--------------------------------------------------
-- 5. ENABLE RLS
--------------------------------------------------
alter table public.profiles enable row level security;
alter table public.quizzes enable row level security;
alter table public.attempts enable row level security;
alter table public.todos enable row level security;

--------------------------------------------------
-- 6. RLS POLICIES (IMPROVED & SAFE)
--------------------------------------------------

-- TODOS (test only)
create policy if not exists "Public access to todos"
on public.todos for all using (true);

---------------- PROFILES ----------------

create policy if not exists "Users can view own profile"
on public.profiles for select
using (auth.uid() = id);

create policy if not exists "Users can update own profile"
on public.profiles for update
using (auth.uid() = id);

---------------- QUIZZES ----------------

-- Teachers full access to their quizzes
create policy if not exists "Teachers can manage own quizzes"
on public.quizzes for all
using (teacher_id = auth.uid())
with check (teacher_id = auth.uid());

-- Students can view only available quizzes
create policy if not exists "Students can view available quizzes"
on public.quizzes for select
using (
  status in ('scheduled', 'active')
  AND (scheduled_at is null OR scheduled_at <= now())
);

---------------- ATTEMPTS ----------------

-- Students insert own attempts
create policy if not exists "Students can insert own attempts"
on public.attempts for insert
with check (student_id = auth.uid());

-- Students view their attempts
create policy if not exists "Students can view own attempts"
on public.attempts for select
using (student_id = auth.uid());

-- Teachers view attempts of their quizzes
create policy if not exists "Teachers can view quiz attempts"
on public.attempts for select
using (
  exists (
    select 1 from public.quizzes q
    where q.id = quiz_id
    and q.teacher_id = auth.uid()
  )
);

--------------------------------------------------
-- 7. AUTH TRIGGER (AUTO PROFILE CREATION)
--------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'name', 'User'),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  )
  on conflict (id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
