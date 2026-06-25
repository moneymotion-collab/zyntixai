-- Demo-friendly workout_exercises rows linked to workout_plans.

create table if not exists public.workout_exercises (
  id              uuid primary key default gen_random_uuid(),
  workout_plan_id uuid not null references public.workout_plans (id) on delete cascade,
  exercise_name   text not null,
  sets            integer not null default 3 check (sets > 0),
  reps            integer not null default 10 check (reps > 0),
  rest_seconds    integer not null default 60 check (rest_seconds >= 0),
  order_index     integer not null default 0,
  is_demo         boolean not null default false,
  created_at      timestamptz not null default now(),
  unique (workout_plan_id, exercise_name)
);

alter table public.workout_exercises
  add column if not exists workout_plan_id uuid references public.workout_plans (id) on delete cascade;

alter table public.workout_exercises
  add column if not exists exercise_name text;

alter table public.workout_exercises
  add column if not exists sets integer not null default 3;

alter table public.workout_exercises
  add column if not exists reps integer not null default 10;

alter table public.workout_exercises
  add column if not exists rest_seconds integer not null default 60;

alter table public.workout_exercises
  add column if not exists order_index integer not null default 0;

alter table public.workout_exercises
  add column if not exists is_demo boolean not null default false;

create index if not exists workout_exercises_plan_idx
  on public.workout_exercises (workout_plan_id);

create index if not exists workout_exercises_plan_demo_idx
  on public.workout_exercises (workout_plan_id, is_demo)
  where is_demo = true;

alter table public.workout_exercises enable row level security;

drop policy if exists "workout_exercises: read authenticated" on public.workout_exercises;
create policy "workout_exercises: read authenticated"
  on public.workout_exercises
  for select
  to authenticated
  using (true);

drop policy if exists "workout_exercises: insert authenticated" on public.workout_exercises;
create policy "workout_exercises: insert authenticated"
  on public.workout_exercises
  for insert
  to authenticated
  with check (true);

drop policy if exists "workout_exercises: delete authenticated" on public.workout_exercises;
create policy "workout_exercises: delete authenticated"
  on public.workout_exercises
  for delete
  to authenticated
  using (true);
