-- Coach/admin write access for workout_plans.

alter table public.workout_plans enable row level security;

drop policy if exists "dev: public read workout_plans" on public.workout_plans;
drop policy if exists "workout_plans: read authenticated" on public.workout_plans;
create policy "workout_plans: read authenticated"
  on public.workout_plans
  for select
  to authenticated
  using (true);

drop policy if exists "workout_plans: insert coach or admin" on public.workout_plans;
create policy "workout_plans: insert coach or admin"
  on public.workout_plans
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'coach')
    )
    and (created_by is null or created_by = auth.uid())
  );

drop policy if exists "workout_plans: update own or admin" on public.workout_plans;
create policy "workout_plans: update own or admin"
  on public.workout_plans
  for update
  to authenticated
  using (
    created_by = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  )
  with check (
    created_by = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

drop policy if exists "workout_plans: delete own or admin" on public.workout_plans;
create policy "workout_plans: delete own or admin"
  on public.workout_plans
  for delete
  to authenticated
  using (
    created_by = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );
