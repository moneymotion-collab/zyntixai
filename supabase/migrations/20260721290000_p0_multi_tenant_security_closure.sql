-- P0 Multi-tenant security closure (BETA5 blockers).
-- Scope: member_workout_assignments, member_allergies, member_food_preferences,
--         client_profiles, client_goals, client_habits.

-- ---------------------------------------------------------------------------
-- member_workout_assignments
-- ---------------------------------------------------------------------------
alter table public.member_workout_assignments enable row level security;

drop policy if exists "dev: public read member_workout_assignments" on public.member_workout_assignments;
drop policy if exists "member_workout_assignments: insert authenticated" on public.member_workout_assignments;
drop policy if exists "member_workout_assignments: delete authenticated" on public.member_workout_assignments;
drop policy if exists "member_workout_assignments: select scoped" on public.member_workout_assignments;
drop policy if exists "member_workout_assignments: insert scoped" on public.member_workout_assignments;
drop policy if exists "member_workout_assignments: delete scoped" on public.member_workout_assignments;

create policy "member_workout_assignments: select scoped"
  on public.member_workout_assignments
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
      where m.id = member_workout_assignments.member_id
        and m.coach_id = auth.uid()
    )
    or exists (
      select 1
      from public.members m
      where m.id = member_workout_assignments.member_id
        and (
          m.user_id = auth.uid()
          or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        )
    )
  );

create policy "member_workout_assignments: insert scoped"
  on public.member_workout_assignments
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

create policy "member_workout_assignments: delete scoped"
  on public.member_workout_assignments
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
      where m.id = member_workout_assignments.member_id
        and m.coach_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- member_allergies
-- ---------------------------------------------------------------------------
alter table public.member_allergies enable row level security;

drop policy if exists "member_allergies: read authenticated" on public.member_allergies;
drop policy if exists "member_allergies: insert authenticated" on public.member_allergies;
drop policy if exists "member_allergies: delete authenticated" on public.member_allergies;
drop policy if exists "member_allergies: select scoped" on public.member_allergies;
drop policy if exists "member_allergies: insert scoped" on public.member_allergies;
drop policy if exists "member_allergies: delete scoped" on public.member_allergies;

create policy "member_allergies: select scoped"
  on public.member_allergies
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
      where m.id = member_allergies.member_id
        and m.coach_id = auth.uid()
    )
    or exists (
      select 1
      from public.members m
      where m.id = member_allergies.member_id
        and (
          m.user_id = auth.uid()
          or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        )
    )
  );

create policy "member_allergies: insert scoped"
  on public.member_allergies
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

create policy "member_allergies: delete scoped"
  on public.member_allergies
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
      where m.id = member_allergies.member_id
        and m.coach_id = auth.uid()
    )
    or exists (
      select 1
      from public.members m
      where m.id = member_allergies.member_id
        and (
          m.user_id = auth.uid()
          or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        )
    )
  );

-- ---------------------------------------------------------------------------
-- member_food_preferences
-- ---------------------------------------------------------------------------
alter table public.member_food_preferences enable row level security;

drop policy if exists "member_food_preferences: read authenticated" on public.member_food_preferences;
drop policy if exists "member_food_preferences: insert authenticated" on public.member_food_preferences;
drop policy if exists "member_food_preferences: delete authenticated" on public.member_food_preferences;
drop policy if exists "member_food_preferences: select scoped" on public.member_food_preferences;
drop policy if exists "member_food_preferences: insert scoped" on public.member_food_preferences;
drop policy if exists "member_food_preferences: delete scoped" on public.member_food_preferences;

create policy "member_food_preferences: select scoped"
  on public.member_food_preferences
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
      where m.id = member_food_preferences.member_id
        and m.coach_id = auth.uid()
    )
    or exists (
      select 1
      from public.members m
      where m.id = member_food_preferences.member_id
        and (
          m.user_id = auth.uid()
          or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        )
    )
  );

create policy "member_food_preferences: insert scoped"
  on public.member_food_preferences
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

create policy "member_food_preferences: delete scoped"
  on public.member_food_preferences
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
      where m.id = member_food_preferences.member_id
        and m.coach_id = auth.uid()
    )
    or exists (
      select 1
      from public.members m
      where m.id = member_food_preferences.member_id
        and (
          m.user_id = auth.uid()
          or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        )
    )
  );

-- ---------------------------------------------------------------------------
-- client_profiles — remove any-coach-read-all; roster scope only
-- ---------------------------------------------------------------------------
alter table public.client_profiles enable row level security;

drop policy if exists "client_profiles: read scoped" on public.client_profiles;
create policy "client_profiles: read scoped"
  on public.client_profiles
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
      where m.id = client_profiles.member_id
        and m.coach_id = auth.uid()
    )
    or exists (
      select 1
      from public.members m
      where m.id = client_profiles.member_id
        and (
          m.user_id = auth.uid()
          or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        )
    )
  );

drop policy if exists "client_profiles: insert scoped" on public.client_profiles;
create policy "client_profiles: insert scoped"
  on public.client_profiles
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
      where m.id = client_profiles.member_id
        and m.coach_id = auth.uid()
    )
    or exists (
      select 1
      from public.members m
      where m.id = client_profiles.member_id
        and (
          m.user_id = auth.uid()
          or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        )
    )
  );

drop policy if exists "client_profiles: update scoped" on public.client_profiles;
create policy "client_profiles: update scoped"
  on public.client_profiles
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
      where m.id = client_profiles.member_id
        and m.coach_id = auth.uid()
    )
    or exists (
      select 1
      from public.members m
      where m.id = client_profiles.member_id
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
      where m.id = client_profiles.member_id
        and m.coach_id = auth.uid()
    )
    or exists (
      select 1
      from public.members m
      where m.id = client_profiles.member_id
        and (
          m.user_id = auth.uid()
          or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        )
    )
  );

-- ---------------------------------------------------------------------------
-- client_goals — fix A3 SELECT policy typo (client_checkins.member_id)
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

-- ---------------------------------------------------------------------------
-- client_habits — fix A3 SELECT policy typo (client_checkins.member_id)
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
