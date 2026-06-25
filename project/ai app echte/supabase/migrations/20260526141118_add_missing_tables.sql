-- =====================================================
-- Add missing tables (hybrid approach)
-- Adds coaches, ai_coach_threads, and junction tables.
-- Existing tables (clients, members, sessions, workout_plans, nutrition_plans, progress_logs)
-- are left untouched.
-- =====================================================

create extension if not exists "pgcrypto";

-- ----- shared updated_at trigger function -----
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- =====================================================
-- coaches
-- =====================================================
create table if not exists public.coaches (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  email       text unique,
  avatar_url  text,
  bio         text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists coaches_updated_at on public.coaches;
create trigger coaches_updated_at
  before update on public.coaches
  for each row execute function public.set_updated_at();

-- =====================================================
-- ai_coach_threads
-- =====================================================
create table if not exists public.ai_coach_threads (
  id            uuid primary key default gen_random_uuid(),
  member_id     uuid not null references public.members(id) on delete cascade,
  topic         text not null,
  last_message  text,
  status        text not null default 'Awaiting reply',
  last_active   timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

drop trigger if exists ai_coach_threads_updated_at on public.ai_coach_threads;
create trigger ai_coach_threads_updated_at
  before update on public.ai_coach_threads
  for each row execute function public.set_updated_at();

create index if not exists ai_coach_threads_member_id_idx   on public.ai_coach_threads (member_id);
create index if not exists ai_coach_threads_last_active_idx on public.ai_coach_threads (last_active desc);

-- =====================================================
-- member_workout_assignments  (junction)
-- =====================================================
create table if not exists public.member_workout_assignments (
  member_id        uuid not null references public.members(id) on delete cascade,
  workout_plan_id  uuid not null references public.workout_plans(id) on delete cascade,
  assigned_at      timestamptz not null default now(),
  primary key (member_id, workout_plan_id)
);

-- =====================================================
-- member_nutrition_assignments  (junction)
-- =====================================================
create table if not exists public.member_nutrition_assignments (
  member_id          uuid not null references public.members(id) on delete cascade,
  nutrition_plan_id  uuid not null references public.nutrition_plans(id) on delete cascade,
  assigned_at        timestamptz not null default now(),
  primary key (member_id, nutrition_plan_id)
);

-- =====================================================
-- Row Level Security
-- =====================================================
alter table public.coaches                       enable row level security;
alter table public.ai_coach_threads              enable row level security;
alter table public.member_workout_assignments    enable row level security;
alter table public.member_nutrition_assignments  enable row level security;

-- DEV-MODE policies: allow anon + authenticated to read.
-- TODO: lock down once auth + user-scoping is implemented.
drop policy if exists "dev: public read coaches" on public.coaches;
create policy "dev: public read coaches"
  on public.coaches for select to anon, authenticated using (true);

drop policy if exists "dev: public read ai_coach_threads" on public.ai_coach_threads;
create policy "dev: public read ai_coach_threads"
  on public.ai_coach_threads for select to anon, authenticated using (true);

drop policy if exists "dev: public read member_workout_assignments" on public.member_workout_assignments;
create policy "dev: public read member_workout_assignments"
  on public.member_workout_assignments for select to anon, authenticated using (true);

drop policy if exists "dev: public read member_nutrition_assignments" on public.member_nutrition_assignments;
create policy "dev: public read member_nutrition_assignments"
  on public.member_nutrition_assignments for select to anon, authenticated using (true);