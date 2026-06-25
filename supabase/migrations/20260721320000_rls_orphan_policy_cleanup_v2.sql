-- RLS orphan cleanup v2: drop permissive policies created outside migration history.
-- Remote had policies like "Authenticated users can view members" (using true / auth.role()).

do $$
declare
  r record;
begin
  for r in
    select
      c.relname as table_name,
      p.polname as policy_name
    from pg_policy p
    join pg_class c on c.oid = p.polrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname in (
        'members',
        'workout_plans',
        'workout_assignments',
        'progress_logs',
        'check_ins'
      )
      and (
        pg_get_expr(p.polqual, p.polrelid) = 'true'
        or pg_get_expr(p.polqual, p.polrelid) = '(auth.role() = ''authenticated''::text)'
      )
  loop
    execute format(
      'drop policy if exists %I on public.%I',
      r.policy_name,
      r.table_name
    );
    raise notice 'dropped permissive policy % on %', r.policy_name, r.table_name;
  end loop;
end $$;

-- Explicit names (in case qual expressions differ slightly)
drop policy if exists "Authenticated users can view members" on public.members;
drop policy if exists "Allow inserts for anon users" on public.members;
drop policy if exists "dev: public insert members" on public.members;
drop policy if exists "dev: public update members" on public.members;
drop policy if exists "dev: public delete members" on public.members;

drop policy if exists "allow all workout plans" on public.workout_plans;

drop policy if exists "Authenticated users can view assignments" on public.workout_assignments;
drop policy if exists "Authenticated users can insert assignments" on public.workout_assignments;

drop policy if exists "Authenticated users can view progress logs" on public.progress_logs;
drop policy if exists "Authenticated users can insert progress logs" on public.progress_logs;

drop policy if exists "Users can manage check ins" on public.check_ins;

-- Re-assert scoped SELECT policies (idempotent)
drop policy if exists "members: select scoped" on public.members;
create policy "members: select scoped"
  on public.members
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or lower(trim(email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
    or coach_id = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

drop policy if exists "workout_plans: select scoped" on public.workout_plans;
create policy "workout_plans: select scoped"
  on public.workout_plans
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or created_by = auth.uid()
    or exists (
      select 1
      from public.workout_assignments wa
      join public.members m on m.id = wa.member_id
      where wa.workout_plan_id = workout_plans.id
        and m.coach_id = auth.uid()
    )
    or exists (
      select 1
      from public.member_workout_assignments mwa
      join public.members m on m.id = mwa.member_id
      where mwa.workout_plan_id = workout_plans.id
        and m.coach_id = auth.uid()
    )
    or exists (
      select 1
      from public.workout_assignments wa
      join public.members m on m.id = wa.member_id
      where wa.workout_plan_id = workout_plans.id
        and (
          m.user_id = auth.uid()
          or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        )
    )
    or exists (
      select 1
      from public.member_workout_assignments mwa
      join public.members m on m.id = mwa.member_id
      where mwa.workout_plan_id = workout_plans.id
        and (
          m.user_id = auth.uid()
          or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        )
    )
  );

drop policy if exists "workout_assignments: select scoped" on public.workout_assignments;
create policy "workout_assignments: select scoped"
  on public.workout_assignments
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or exists (
      select 1
      from public.members m
      where m.id = workout_assignments.member_id
        and m.coach_id = auth.uid()
    )
    or exists (
      select 1
      from public.members m
      where m.id = workout_assignments.member_id
        and (
          m.user_id = auth.uid()
          or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        )
    )
  );

drop policy if exists "progress_logs: select scoped" on public.progress_logs;
create policy "progress_logs: select scoped"
  on public.progress_logs
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or exists (
      select 1
      from public.members m
      where m.id = progress_logs.member_id
        and m.coach_id = auth.uid()
    )
    or exists (
      select 1
      from public.members m
      where m.id = progress_logs.member_id
        and (
          m.user_id = auth.uid()
          or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        )
    )
  );

drop policy if exists "check_ins: select scoped" on public.check_ins;
create policy "check_ins: select scoped"
  on public.check_ins
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or exists (
      select 1
      from public.members m
      where m.id = check_ins.member_id
        and m.coach_id = auth.uid()
    )
    or exists (
      select 1
      from public.members m
      where m.id = check_ins.member_id
        and (
          m.user_id = auth.uid()
          or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        )
    )
  );
