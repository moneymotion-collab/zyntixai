-- A3 Legacy RLS cleanup: replace USING (true) / blanket coach access with
-- coach-roster, member-own, and admin-scoped policies.

-- ---------------------------------------------------------------------------
-- sessions
-- ---------------------------------------------------------------------------
alter table public.sessions enable row level security;

drop policy if exists "dev: public read sessions" on public.sessions;
drop policy if exists "sessions: insert authenticated" on public.sessions;
drop policy if exists "sessions: update authenticated" on public.sessions;

drop policy if exists "sessions: select scoped" on public.sessions;
create policy "sessions: select scoped"
  on public.sessions
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
      where m.id = sessions.member_id
        and m.coach_id = auth.uid()
    )
    or exists (
      select 1
      from public.members m
      where m.id = sessions.member_id
        and (
          m.user_id = auth.uid()
          or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        )
    )
  );

drop policy if exists "sessions: insert scoped" on public.sessions;
create policy "sessions: insert scoped"
  on public.sessions
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
      where m.id = sessions.member_id
        and m.coach_id = auth.uid()
    )
  );

drop policy if exists "sessions: update scoped" on public.sessions;
create policy "sessions: update scoped"
  on public.sessions
  for update
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
      where m.id = sessions.member_id
        and m.coach_id = auth.uid()
    )
  )
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
      where m.id = sessions.member_id
        and m.coach_id = auth.uid()
    )
  );

drop policy if exists "sessions: delete scoped" on public.sessions;
create policy "sessions: delete scoped"
  on public.sessions
  for delete
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
      where m.id = sessions.member_id
        and m.coach_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- nutrition_plans
-- ---------------------------------------------------------------------------
alter table public.nutrition_plans enable row level security;

drop policy if exists "dev: public read nutrition_plans" on public.nutrition_plans;
drop policy if exists "nutrition_plans: insert authenticated" on public.nutrition_plans;
drop policy if exists "Users can insert nutrition plans" on public.nutrition_plans;
drop policy if exists "nutrition_plans: update own" on public.nutrition_plans;

drop policy if exists "nutrition_plans: select scoped" on public.nutrition_plans;
create policy "nutrition_plans: select scoped"
  on public.nutrition_plans
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
      from public.member_nutrition_assignments mna
      join public.members m on m.id = mna.member_id
      where mna.nutrition_plan_id = nutrition_plans.id
        and m.coach_id = auth.uid()
    )
    or exists (
      select 1
      from public.member_nutrition_assignments mna
      join public.members m on m.id = mna.member_id
      where mna.nutrition_plan_id = nutrition_plans.id
        and (
          m.user_id = auth.uid()
          or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        )
    )
  );

drop policy if exists "nutrition_plans: insert scoped" on public.nutrition_plans;
create policy "nutrition_plans: insert scoped"
  on public.nutrition_plans
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      auth.uid() = created_by
      and exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role in ('admin', 'coach')
      )
    )
  );

drop policy if exists "nutrition_plans: update scoped" on public.nutrition_plans;
create policy "nutrition_plans: update scoped"
  on public.nutrition_plans
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or created_by = auth.uid()
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or created_by = auth.uid()
  );

drop policy if exists "nutrition_plans: delete scoped" on public.nutrition_plans;
create policy "nutrition_plans: delete scoped"
  on public.nutrition_plans
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or created_by = auth.uid()
  );

-- ---------------------------------------------------------------------------
-- member_nutrition_assignments
-- ---------------------------------------------------------------------------
alter table public.member_nutrition_assignments enable row level security;

drop policy if exists "dev: public read member_nutrition_assignments" on public.member_nutrition_assignments;
drop policy if exists "member_nutrition_assignments: insert authenticated" on public.member_nutrition_assignments;
drop policy if exists "member_nutrition_assignments: delete authenticated" on public.member_nutrition_assignments;

drop policy if exists "member_nutrition_assignments: select scoped" on public.member_nutrition_assignments;
create policy "member_nutrition_assignments: select scoped"
  on public.member_nutrition_assignments
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
      where m.id = member_nutrition_assignments.member_id
        and m.coach_id = auth.uid()
    )
    or exists (
      select 1
      from public.members m
      where m.id = member_nutrition_assignments.member_id
        and (
          m.user_id = auth.uid()
          or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        )
    )
  );

drop policy if exists "member_nutrition_assignments: insert scoped" on public.member_nutrition_assignments;
create policy "member_nutrition_assignments: insert scoped"
  on public.member_nutrition_assignments
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      exists (
        select 1
        from public.members m
        where m.id = member_id
          and m.coach_id = auth.uid()
      )
      and exists (
        select 1
        from public.nutrition_plans np
        where np.id = nutrition_plan_id
          and (np.created_by = auth.uid() or np.created_by is null)
      )
    )
  );

drop policy if exists "member_nutrition_assignments: update scoped" on public.member_nutrition_assignments;
create policy "member_nutrition_assignments: update scoped"
  on public.member_nutrition_assignments
  for update
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
      where m.id = member_nutrition_assignments.member_id
        and m.coach_id = auth.uid()
    )
  )
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
  );

drop policy if exists "member_nutrition_assignments: delete scoped" on public.member_nutrition_assignments;
create policy "member_nutrition_assignments: delete scoped"
  on public.member_nutrition_assignments
  for delete
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
      where m.id = member_nutrition_assignments.member_id
        and m.coach_id = auth.uid()
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

-- insert / update / delete policies from 20260620120000_workout_plans_rls.sql remain scoped.

-- ---------------------------------------------------------------------------
-- workout_assignments
-- ---------------------------------------------------------------------------
alter table public.workout_assignments enable row level security;

drop policy if exists "workout_assignments: read authenticated" on public.workout_assignments;
drop policy if exists "Users can view assignments" on public.workout_assignments;
drop policy if exists "workout_assignments: insert authenticated" on public.workout_assignments;
drop policy if exists "workout_assignments: update authenticated" on public.workout_assignments;
drop policy if exists "Users can update assignments" on public.workout_assignments;
drop policy if exists "workout_assignments: delete authenticated" on public.workout_assignments;

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

drop policy if exists "workout_assignments: insert scoped" on public.workout_assignments;
create policy "workout_assignments: insert scoped"
  on public.workout_assignments
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      exists (
        select 1
        from public.members m
        where m.id = member_id
          and m.coach_id = auth.uid()
      )
      and exists (
        select 1
        from public.workout_plans wp
        where wp.id = workout_plan_id
          and (wp.created_by = auth.uid() or wp.created_by is null)
      )
    )
  );

drop policy if exists "workout_assignments: update scoped" on public.workout_assignments;
create policy "workout_assignments: update scoped"
  on public.workout_assignments
  for update
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
  )
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

drop policy if exists "workout_assignments: delete scoped" on public.workout_assignments;
create policy "workout_assignments: delete scoped"
  on public.workout_assignments
  for delete
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

drop policy if exists "progress_logs: insert scoped" on public.progress_logs;
create policy "progress_logs: insert scoped"
  on public.progress_logs
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

drop policy if exists "progress_logs: update scoped" on public.progress_logs;
create policy "progress_logs: update scoped"
  on public.progress_logs
  for update
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
  )
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

drop policy if exists "progress_logs: delete scoped" on public.progress_logs;
create policy "progress_logs: delete scoped"
  on public.progress_logs
  for delete
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
  );

-- ---------------------------------------------------------------------------
-- client_checkins
-- ---------------------------------------------------------------------------
alter table public.client_checkins enable row level security;

drop policy if exists "client_checkins: select scoped" on public.client_checkins;
create policy "client_checkins: select scoped"
  on public.client_checkins
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      coach_id = auth.uid()
      and exists (
        select 1
        from public.members m
        where m.id = client_checkins.member_id
          and m.coach_id = auth.uid()
      )
    )
    or exists (
      select 1
      from public.members m
      where m.id = client_checkins.member_id
        and (
          m.user_id = auth.uid()
          or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        )
    )
  );

drop policy if exists "client_checkins: insert scoped" on public.client_checkins;
create policy "client_checkins: insert scoped"
  on public.client_checkins
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      coach_id = auth.uid()
      and exists (
        select 1
        from public.members m
        where m.id = member_id
          and m.coach_id = auth.uid()
      )
    )
  );

drop policy if exists "client_checkins: update scoped" on public.client_checkins;
create policy "client_checkins: update scoped"
  on public.client_checkins
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      coach_id = auth.uid()
      and exists (
        select 1
        from public.members m
        where m.id = client_checkins.member_id
          and m.coach_id = auth.uid()
      )
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      coach_id = auth.uid()
      and exists (
        select 1
        from public.members m
        where m.id = member_id
          and m.coach_id = auth.uid()
      )
    )
  );

drop policy if exists "client_checkins: delete scoped" on public.client_checkins;
create policy "client_checkins: delete scoped"
  on public.client_checkins
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      coach_id = auth.uid()
      and exists (
        select 1
        from public.members m
        where m.id = client_checkins.member_id
          and m.coach_id = auth.uid()
      )
    )
  );

-- ---------------------------------------------------------------------------
-- client_goals
-- ---------------------------------------------------------------------------
alter table public.client_goals enable row level security;

drop policy if exists "client_goals: select scoped" on public.client_goals;
create policy "client_goals: select scoped"
  on public.client_goals
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      coach_id = auth.uid()
      and exists (
        select 1
        from public.members m
        where m.id = client_goals.member_id
          and m.coach_id = auth.uid()
      )
    )
    or exists (
      select 1
      from public.members m
      where m.id = client_goals.member_id
        and (
          m.user_id = auth.uid()
          or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        )
    )
  );

drop policy if exists "client_goals: insert scoped" on public.client_goals;
create policy "client_goals: insert scoped"
  on public.client_goals
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      coach_id = auth.uid()
      and exists (
        select 1
        from public.members m
        where m.id = member_id
          and m.coach_id = auth.uid()
      )
    )
  );

drop policy if exists "client_goals: update scoped" on public.client_goals;
create policy "client_goals: update scoped"
  on public.client_goals
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      coach_id = auth.uid()
      and exists (
        select 1
        from public.members m
        where m.id = client_goals.member_id
          and m.coach_id = auth.uid()
      )
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      coach_id = auth.uid()
      and exists (
        select 1
        from public.members m
        where m.id = member_id
          and m.coach_id = auth.uid()
      )
    )
  );

drop policy if exists "client_goals: delete scoped" on public.client_goals;
create policy "client_goals: delete scoped"
  on public.client_goals
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      coach_id = auth.uid()
      and exists (
        select 1
        from public.members m
        where m.id = client_goals.member_id
          and m.coach_id = auth.uid()
      )
    )
  );

-- ---------------------------------------------------------------------------
-- client_habits
-- ---------------------------------------------------------------------------
alter table public.client_habits enable row level security;

drop policy if exists "client_habits: select scoped" on public.client_habits;
create policy "client_habits: select scoped"
  on public.client_habits
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      coach_id = auth.uid()
      and exists (
        select 1
        from public.members m
        where m.id = client_habits.member_id
          and m.coach_id = auth.uid()
      )
    )
    or exists (
      select 1
      from public.members m
      where m.id = client_habits.member_id
        and (
          m.user_id = auth.uid()
          or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        )
    )
  );

drop policy if exists "client_habits: insert scoped" on public.client_habits;
create policy "client_habits: insert scoped"
  on public.client_habits
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      coach_id = auth.uid()
      and exists (
        select 1
        from public.members m
        where m.id = member_id
          and m.coach_id = auth.uid()
      )
    )
  );

drop policy if exists "client_habits: update scoped" on public.client_habits;
create policy "client_habits: update scoped"
  on public.client_habits
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      coach_id = auth.uid()
      and exists (
        select 1
        from public.members m
        where m.id = client_habits.member_id
          and m.coach_id = auth.uid()
      )
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      coach_id = auth.uid()
      and exists (
        select 1
        from public.members m
        where m.id = member_id
          and m.coach_id = auth.uid()
      )
    )
  );

drop policy if exists "client_habits: delete scoped" on public.client_habits;
create policy "client_habits: delete scoped"
  on public.client_habits
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      coach_id = auth.uid()
      and exists (
        select 1
        from public.members m
        where m.id = client_habits.member_id
          and m.coach_id = auth.uid()
      )
    )
  );

-- ---------------------------------------------------------------------------
-- client_notes
-- ---------------------------------------------------------------------------
alter table public.client_notes enable row level security;

drop policy if exists "client_notes: select scoped" on public.client_notes;
create policy "client_notes: select scoped"
  on public.client_notes
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      coach_id = auth.uid()
      and exists (
        select 1
        from public.members m
        where m.id = client_notes.member_id
          and m.coach_id = auth.uid()
      )
    )
  );

drop policy if exists "client_notes: insert scoped" on public.client_notes;
create policy "client_notes: insert scoped"
  on public.client_notes
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      coach_id = auth.uid()
      and exists (
        select 1
        from public.members m
        where m.id = member_id
          and m.coach_id = auth.uid()
      )
    )
  );

drop policy if exists "client_notes: update scoped" on public.client_notes;
create policy "client_notes: update scoped"
  on public.client_notes
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      coach_id = auth.uid()
      and exists (
        select 1
        from public.members m
        where m.id = client_notes.member_id
          and m.coach_id = auth.uid()
      )
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      coach_id = auth.uid()
      and exists (
        select 1
        from public.members m
        where m.id = member_id
          and m.coach_id = auth.uid()
      )
    )
  );

drop policy if exists "client_notes: delete scoped" on public.client_notes;
create policy "client_notes: delete scoped"
  on public.client_notes
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      coach_id = auth.uid()
      and exists (
        select 1
        from public.members m
        where m.id = client_notes.member_id
          and m.coach_id = auth.uid()
      )
    )
  );

-- ---------------------------------------------------------------------------
-- client_reminders
-- ---------------------------------------------------------------------------
alter table public.client_reminders enable row level security;

drop policy if exists "client_reminders: select scoped" on public.client_reminders;
create policy "client_reminders: select scoped"
  on public.client_reminders
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      coach_id = auth.uid()
      and exists (
        select 1
        from public.members m
        where m.id = client_reminders.member_id
          and m.coach_id = auth.uid()
      )
    )
  );

drop policy if exists "client_reminders: insert scoped" on public.client_reminders;
create policy "client_reminders: insert scoped"
  on public.client_reminders
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      coach_id = auth.uid()
      and exists (
        select 1
        from public.members m
        where m.id = member_id
          and m.coach_id = auth.uid()
      )
    )
  );

drop policy if exists "client_reminders: update scoped" on public.client_reminders;
create policy "client_reminders: update scoped"
  on public.client_reminders
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      coach_id = auth.uid()
      and exists (
        select 1
        from public.members m
        where m.id = client_reminders.member_id
          and m.coach_id = auth.uid()
      )
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      coach_id = auth.uid()
      and exists (
        select 1
        from public.members m
        where m.id = member_id
          and m.coach_id = auth.uid()
      )
    )
  );

drop policy if exists "client_reminders: delete scoped" on public.client_reminders;
create policy "client_reminders: delete scoped"
  on public.client_reminders
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      coach_id = auth.uid()
      and exists (
        select 1
        from public.members m
        where m.id = client_reminders.member_id
          and m.coach_id = auth.uid()
      )
    )
  );
