-- RLS for linking nutrition plans to members

drop policy if exists "member_nutrition_assignments: insert authenticated" on public.member_nutrition_assignments;
create policy "member_nutrition_assignments: insert authenticated"
  on public.member_nutrition_assignments
  for insert
  to authenticated
  with check (true);

drop policy if exists "member_nutrition_assignments: delete authenticated" on public.member_nutrition_assignments;
create policy "member_nutrition_assignments: delete authenticated"
  on public.member_nutrition_assignments
  for delete
  to authenticated
  using (true);
