-- Workout completion tracking (safe to re-run in Supabase SQL Editor)
-- Adds assignment id + status (pending | completed) for My Workouts "Mark complete"

alter table public.workout_assignments
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists status text not null default 'pending',
  add column if not exists completed_at timestamptz;

update public.workout_assignments
set id = gen_random_uuid()
where id is null;

alter table public.workout_assignments
  alter column id set not null;

alter table public.workout_assignments
  drop constraint if exists workout_assignments_pkey;

alter table public.workout_assignments
  add primary key (id);

alter table public.workout_assignments
  drop constraint if exists workout_assignments_member_workout_unique;

alter table public.workout_assignments
  add constraint workout_assignments_member_workout_unique
  unique (member_id, workout_id);

alter table public.workout_assignments
  drop constraint if exists workout_assignments_status_check;

alter table public.workout_assignments
  add constraint workout_assignments_status_check
  check (status in ('pending', 'completed'));

drop policy if exists "workout_assignments: update authenticated" on public.workout_assignments;
drop policy if exists "Users can update assignments" on public.workout_assignments;

create policy "Users can update assignments"
  on public.workout_assignments
  for update
  to authenticated
  using (true)
  with check (true);
