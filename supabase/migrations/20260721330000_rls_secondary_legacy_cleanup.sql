-- Secondary / legacy RLS cleanup: drop permissive orphans on workout_completions,
-- workouts, clients, coaches, member_plans, exercises; re-assert scoped policies.

-- ---------------------------------------------------------------------------
-- 1) Dynamic drop: USING (true), WITH CHECK (true), blanket authenticated
-- ---------------------------------------------------------------------------
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
        'workout_completions',
        'workouts',
        'clients',
        'coaches',
        'member_plans',
        'exercises'
      )
      and (
        pg_get_expr(p.polqual, p.polrelid) = 'true'
        or pg_get_expr(p.polwithcheck, p.polrelid) = 'true'
        or pg_get_expr(p.polqual, p.polrelid) = '(auth.role() = ''authenticated''::text)'
        or pg_get_expr(p.polwithcheck, p.polrelid) = '(auth.role() = ''authenticated''::text)'
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

-- ---------------------------------------------------------------------------
-- 2) Explicit drops (names that may not match qual expressions exactly)
-- ---------------------------------------------------------------------------
drop policy if exists "allow all workout completions" on public.workout_completions;
drop policy if exists "Users can insert their own completions" on public.workout_completions;

drop policy if exists "Authenticated users can view workouts" on public.workouts;
drop policy if exists "Authenticated users can insert workouts" on public.workouts;
drop policy if exists "workouts: read all authenticated" on public.workouts;

drop policy if exists "dev: public read clients" on public.clients;
drop policy if exists "dev: public read coaches" on public.coaches;

drop policy if exists "Allow read access" on public.member_plans;
drop policy if exists "Allow update" on public.member_plans;
drop policy if exists "Allow insert" on public.member_plans;

drop policy if exists "Anyone can view exercises" on public.exercises;
drop policy if exists "exercises: read authenticated" on public.exercises;
drop policy if exists "exercises: insert authenticated" on public.exercises;

-- ---------------------------------------------------------------------------
-- 3) workout_completions (live — member roster scoped)
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.workout_completions') is null then
    raise notice 'skip workout_completions RLS: table does not exist';
    return;
  end if;

  alter table public.workout_completions enable row level security;
end $$;

drop policy if exists "workout_completions: select scoped" on public.workout_completions;
create policy "workout_completions: select scoped"
  on public.workout_completions
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
      where m.id = workout_completions.member_id
        and m.coach_id = auth.uid()
    )
    or exists (
      select 1
      from public.members m
      where m.id = workout_completions.member_id
        and (
          m.user_id = auth.uid()
          or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        )
    )
  );

drop policy if exists "workout_completions: insert scoped" on public.workout_completions;
create policy "workout_completions: insert scoped"
  on public.workout_completions
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

drop policy if exists "workout_completions: update scoped" on public.workout_completions;
create policy "workout_completions: update scoped"
  on public.workout_completions
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
      where m.id = workout_completions.member_id
        and m.coach_id = auth.uid()
    )
    or exists (
      select 1
      from public.members m
      where m.id = workout_completions.member_id
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

drop policy if exists "workout_completions: delete scoped" on public.workout_completions;
create policy "workout_completions: delete scoped"
  on public.workout_completions
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
      where m.id = workout_completions.member_id
        and m.coach_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 4) workouts (legacy — owner scoped read; existing write policies remain)
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.workouts') is null then
    raise notice 'skip workouts RLS: table does not exist';
    return;
  end if;

  alter table public.workouts enable row level security;

  drop policy if exists "workouts: select scoped" on public.workouts;
  create policy "workouts: select scoped"
    on public.workouts
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
    );
end $$;

-- ---------------------------------------------------------------------------
-- 5) clients (legacy — trainer owner or admin)
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.clients') is null then
    raise notice 'skip clients RLS: table does not exist';
    return;
  end if;

  alter table public.clients enable row level security;

  drop policy if exists "clients: select scoped" on public.clients;
  create policy "clients: select scoped"
    on public.clients
    for select
    to authenticated
    using (
      exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role = 'admin'
      )
      or trainer_id = auth.uid()
    );

  drop policy if exists "clients: insert admin" on public.clients;
  create policy "clients: insert admin"
    on public.clients
    for insert
    to authenticated
    with check (
      exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role = 'admin'
      )
      or trainer_id = auth.uid()
    );

  drop policy if exists "clients: update scoped" on public.clients;
  create policy "clients: update scoped"
    on public.clients
    for update
    to authenticated
    using (
      exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role = 'admin'
      )
      or trainer_id = auth.uid()
    )
    with check (
      exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role = 'admin'
      )
      or trainer_id = auth.uid()
    );

  drop policy if exists "clients: delete admin" on public.clients;
  create policy "clients: delete admin"
    on public.clients
    for delete
    to authenticated
    using (
      exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role = 'admin'
      )
    );
end $$;

-- ---------------------------------------------------------------------------
-- 6) coaches (legacy — admin only)
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.coaches') is null then
    raise notice 'skip coaches RLS: table does not exist';
    return;
  end if;

  alter table public.coaches enable row level security;

  drop policy if exists "coaches: admin all" on public.coaches;
  create policy "coaches: admin all"
    on public.coaches
    for all
    to authenticated
    using (
      exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role = 'admin'
      )
    )
    with check (
      exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role = 'admin'
      )
    );
end $$;

-- ---------------------------------------------------------------------------
-- 7) member_plans (legacy — member roster scoped)
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.member_plans') is null then
    raise notice 'skip member_plans RLS: table does not exist';
    return;
  end if;

  alter table public.member_plans enable row level security;

  drop policy if exists "member_plans: select scoped" on public.member_plans;
  create policy "member_plans: select scoped"
    on public.member_plans
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
        where m.id = member_plans.member_id
          and m.coach_id = auth.uid()
      )
      or exists (
        select 1
        from public.members m
        where m.id = member_plans.member_id
          and (
            m.user_id = auth.uid()
            or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
          )
      )
    );

  drop policy if exists "member_plans: insert scoped" on public.member_plans;
  create policy "member_plans: insert scoped"
    on public.member_plans
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
    );

  drop policy if exists "member_plans: update scoped" on public.member_plans;
  create policy "member_plans: update scoped"
    on public.member_plans
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
        where m.id = member_plans.member_id
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

  drop policy if exists "member_plans: delete scoped" on public.member_plans;
  create policy "member_plans: delete scoped"
    on public.member_plans
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
        where m.id = member_plans.member_id
          and m.coach_id = auth.uid()
      )
    );
end $$;

-- ---------------------------------------------------------------------------
-- 8) exercises (live catalog — standard library + coach custom)
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.exercises') is null then
    raise notice 'skip exercises RLS: table does not exist';
    return;
  end if;

  alter table public.exercises enable row level security;
end $$;

-- Remove orphan custom policies (superseded by scoped coach-custom policies).
drop policy if exists "Users can create custom exercises" on public.exercises;
drop policy if exists "Users can update own custom exercises" on public.exercises;
drop policy if exists "Users can delete own custom exercises" on public.exercises;

drop policy if exists "exercises: read authenticated" on public.exercises;
create policy "exercises: read authenticated"
  on public.exercises
  for select
  to authenticated
  using (
    is_custom = false
    or created_by = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

drop policy if exists "exercises: insert admin" on public.exercises;
create policy "exercises: insert admin"
  on public.exercises
  for insert
  to authenticated
  with check (
    is_custom = false
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

drop policy if exists "exercises: insert coach custom" on public.exercises;
create policy "exercises: insert coach custom"
  on public.exercises
  for insert
  to authenticated
  with check (
    is_custom = true
    and created_by = auth.uid()
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'coach'
    )
  );

drop policy if exists "exercises: update admin" on public.exercises;
create policy "exercises: update admin"
  on public.exercises
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

drop policy if exists "exercises: update coach custom" on public.exercises;
create policy "exercises: update coach custom"
  on public.exercises
  for update
  to authenticated
  using (
    is_custom = true
    and created_by = auth.uid()
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'coach'
    )
  )
  with check (
    is_custom = true
    and created_by = auth.uid()
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'coach'
    )
  );

drop policy if exists "exercises: delete admin" on public.exercises;
create policy "exercises: delete admin"
  on public.exercises
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

drop policy if exists "exercises: delete coach custom" on public.exercises;
create policy "exercises: delete coach custom"
  on public.exercises
  for delete
  to authenticated
  using (
    is_custom = true
    and created_by = auth.uid()
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'coach'
    )
  );
