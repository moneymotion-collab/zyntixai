-- Exercise catalog for coaches (pick exercises when building plans)

create table if not exists public.exercises (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  muscle_group text not null default '',
  created_at   timestamptz not null default now()
);

create index if not exists exercises_muscle_group_idx
  on public.exercises (muscle_group);

alter table public.exercises enable row level security;

drop policy if exists "exercises: read authenticated" on public.exercises;
create policy "exercises: read authenticated"
  on public.exercises
  for select
  to authenticated
  using (true);

drop policy if exists "exercises: insert authenticated" on public.exercises;
create policy "exercises: insert authenticated"
  on public.exercises
  for insert
  to authenticated
  with check (true);

insert into public.exercises (name, muscle_group) values
  ('Bench Press', 'Chest'),
  ('Incline Dumbbell Press', 'Chest'),
  ('Barbell Row', 'Back'),
  ('Lat Pulldown', 'Back'),
  ('Barbell Squat', 'Legs'),
  ('Romanian Deadlift', 'Legs'),
  ('Overhead Press', 'Shoulders'),
  ('Lateral Raise', 'Shoulders'),
  ('Barbell Curl', 'Arms'),
  ('Tricep Pushdown', 'Arms');
