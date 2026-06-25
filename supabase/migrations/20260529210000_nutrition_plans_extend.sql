-- Extend nutrition_plans for coach-created plans

alter table public.nutrition_plans
  add column if not exists description text,
  add column if not exists fats numeric,
  add column if not exists created_by uuid references auth.users (id) on delete set null;

drop policy if exists "nutrition_plans: insert authenticated" on public.nutrition_plans;
drop policy if exists "Users can insert nutrition plans" on public.nutrition_plans;

create policy "nutrition_plans: insert authenticated"
  on public.nutrition_plans
  for insert
  to authenticated
  with check (auth.uid() = created_by);
