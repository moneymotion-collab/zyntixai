-- Allow coaches to update their own nutrition plans

drop policy if exists "nutrition_plans: update own" on public.nutrition_plans;

create policy "nutrition_plans: update own"
  on public.nutrition_plans
  for update
  to authenticated
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);
