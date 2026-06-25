-- RLS: authenticated users can read and update workout assignments

drop policy if exists "workout_assignments: read authenticated" on public.workout_assignments;
drop policy if exists "workout_assignments: update authenticated" on public.workout_assignments;
drop policy if exists "Users can view assignments" on public.workout_assignments;
drop policy if exists "Users can update assignments" on public.workout_assignments;

create policy "Users can view assignments"
  on public.workout_assignments
  for select
  using (auth.role() = 'authenticated');

create policy "Users can update assignments"
  on public.workout_assignments
  for update
  using (auth.role() = 'authenticated');
