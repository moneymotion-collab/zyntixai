-- Exercises linked to workout plans (sets / reps per exercise)
-- Idempotent: skips index creation when legacy workout_id column is absent.

create table if not exists public.workout_exercises (
  id          uuid primary key default gen_random_uuid(),
  workout_id  uuid not null references public.workouts (id) on delete cascade,
  name        text not null,
  sets        integer not null default 3 check (sets > 0),
  reps        integer not null default 10 check (reps > 0),
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'workout_exercises'
      and column_name = 'workout_id'
  ) then
    execute 'create index if not exists workout_exercises_workout_id_idx on public.workout_exercises (workout_id)';
    execute 'create index if not exists workout_exercises_sort_idx on public.workout_exercises (workout_id, sort_order)';
  end if;
end;
$$;

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

drop policy if exists "workout_exercises: update authenticated" on public.workout_exercises;
create policy "workout_exercises: update authenticated"
  on public.workout_exercises
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "workout_exercises: delete authenticated" on public.workout_exercises;
create policy "workout_exercises: delete authenticated"
  on public.workout_exercises
  for delete
  to authenticated
  using (true);
