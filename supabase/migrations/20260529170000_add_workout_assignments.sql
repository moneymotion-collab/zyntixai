-- Assign workouts (user-created) to members

create table if not exists public.workout_assignments (
  member_id   uuid not null references public.members (id) on delete cascade,
  workout_id  uuid not null references public.workouts (id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (member_id, workout_id)
);

alter table public.workout_assignments enable row level security;

drop policy if exists "workout_assignments: read authenticated" on public.workout_assignments;
create policy "workout_assignments: read authenticated"
  on public.workout_assignments
  for select
  to authenticated
  using (true);

drop policy if exists "workout_assignments: insert authenticated" on public.workout_assignments;
create policy "workout_assignments: insert authenticated"
  on public.workout_assignments
  for insert
  to authenticated
  with check (true);

drop policy if exists "workout_assignments: delete authenticated" on public.workout_assignments;
create policy "workout_assignments: delete authenticated"
  on public.workout_assignments
  for delete
  to authenticated
  using (true);
