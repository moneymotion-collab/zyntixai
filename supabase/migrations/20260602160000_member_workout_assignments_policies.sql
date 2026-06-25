-- RLS for linking workout plans to members

drop policy if exists "member_workout_assignments: insert authenticated" on public.member_workout_assignments;
create policy "member_workout_assignments: insert authenticated"
  on public.member_workout_assignments
  for insert
  to authenticated
  with check (true);

drop policy if exists "member_workout_assignments: delete authenticated" on public.member_workout_assignments;
create policy "member_workout_assignments: delete authenticated"
  on public.member_workout_assignments
  for delete
  to authenticated
  using (true);
