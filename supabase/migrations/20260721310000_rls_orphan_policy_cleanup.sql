-- Orphan RLS cleanup: drop legacy permissive policies that survived out-of-order
-- remote schema application, then re-assert roster-scoped SELECT (and check_ins writes).

-- ---------------------------------------------------------------------------
-- members
-- ---------------------------------------------------------------------------
alter table public.members enable row level security;

drop policy if exists "dev: public read members" on public.members;

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

-- ---------------------------------------------------------------------------
-- workout_plans
-- ---------------------------------------------------------------------------
alter table public.workout_plans enable row level security;

drop policy if exists "dev: public read workout_plans" on public.workout_plans;
drop policy if exists "workout_plans: read authenticated" on public.workout_plans;

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

-- ---------------------------------------------------------------------------
-- workout_assignments
-- ---------------------------------------------------------------------------
alter table public.workout_assignments enable row level security;

drop policy if exists "workout_assignments: read authenticated" on public.workout_assignments;
drop policy if exists "Users can view assignments" on public.workout_assignments;
drop policy if exists "workout_assignments: update authenticated" on public.workout_assignments;
drop policy if exists "Users can update assignments" on public.workout_assignments;

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

-- ---------------------------------------------------------------------------
-- progress_logs
-- ---------------------------------------------------------------------------
alter table public.progress_logs enable row level security;

drop policy if exists "dev: public read progress_logs" on public.progress_logs;
drop policy if exists "progress_logs: insert authenticated" on public.progress_logs;
drop policy if exists "Users can insert progress logs" on public.progress_logs;

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

-- ---------------------------------------------------------------------------
-- check_ins (replace any-coach role gate with roster scope)
-- ---------------------------------------------------------------------------
alter table public.check_ins enable row level security;

drop policy if exists "check_ins: read scoped" on public.check_ins;
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

drop policy if exists "check_ins: insert scoped" on public.check_ins;
create policy "check_ins: insert scoped"
  on public.check_ins
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or exists (
      select 1
      from public.members m
      where m.id = member_id
        and m.coach_id = auth.uid()
    )
    or exists (
      select 1
      from public.members m
      where m.id = member_id
        and (
          m.user_id = auth.uid()
          or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        )
    )
  );
