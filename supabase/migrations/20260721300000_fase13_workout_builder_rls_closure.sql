-- Fase 1.3: Close remaining open RLS on workout builder tables (Fase 1.2 audit).
-- Scope: workout_exercises, workout_templates, workout_template_exercises, workouts.
-- Patterns: admin full access, coach own data / roster, member own rows via plan assignment.

-- ---------------------------------------------------------------------------
-- workout_exercises (legacy plan rows; skip if table not deployed on this DB)
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.workout_exercises') is null then
    raise notice 'skip workout_exercises RLS: table does not exist';
    return;
  end if;

  execute 'alter table public.workout_exercises enable row level security';

  execute 'drop policy if exists "workout_exercises: read authenticated" on public.workout_exercises';
  execute 'drop policy if exists "workout_exercises: insert authenticated" on public.workout_exercises';
  execute 'drop policy if exists "workout_exercises: update authenticated" on public.workout_exercises';
  execute 'drop policy if exists "workout_exercises: delete authenticated" on public.workout_exercises';
  execute 'drop policy if exists "workout_exercises: select scoped" on public.workout_exercises';
  execute 'drop policy if exists "workout_exercises: insert scoped" on public.workout_exercises';
  execute 'drop policy if exists "workout_exercises: update scoped" on public.workout_exercises';
  execute 'drop policy if exists "workout_exercises: delete scoped" on public.workout_exercises';
end $$;

-- Policies below require the table; created only when present.
do $$
begin
  if to_regclass('public.workout_exercises') is null then
    return;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'workout_exercises'
      and policyname = 'workout_exercises: select scoped'
  ) then
    create policy "workout_exercises: select scoped"
      on public.workout_exercises
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
          from public.workout_plans wp
          where wp.id = workout_exercises.workout_plan_id
            and wp.created_by = auth.uid()
        )
        or exists (
          select 1
          from public.workout_assignments wa
          join public.members m on m.id = wa.member_id
          where wa.workout_plan_id = workout_exercises.workout_plan_id
            and m.coach_id = auth.uid()
        )
        or exists (
          select 1
          from public.member_workout_assignments mwa
          join public.members m on m.id = mwa.member_id
          where mwa.workout_plan_id = workout_exercises.workout_plan_id
            and m.coach_id = auth.uid()
        )
        or exists (
          select 1
          from public.workout_assignments wa
          join public.members m on m.id = wa.member_id
          where wa.workout_plan_id = workout_exercises.workout_plan_id
            and (
              m.user_id = auth.uid()
              or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
            )
        )
        or exists (
          select 1
          from public.member_workout_assignments mwa
          join public.members m on m.id = mwa.member_id
          where mwa.workout_plan_id = workout_exercises.workout_plan_id
            and (
              m.user_id = auth.uid()
              or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
            )
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'workout_exercises'
      and policyname = 'workout_exercises: insert scoped'
  ) then
    create policy "workout_exercises: insert scoped"
      on public.workout_exercises
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
          from public.workout_plans wp
          where wp.id = workout_plan_id
            and wp.created_by = auth.uid()
            and exists (
              select 1
              from public.profiles p
              where p.id = auth.uid()
                and p.role = 'coach'
            )
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'workout_exercises'
      and policyname = 'workout_exercises: update scoped'
  ) then
    create policy "workout_exercises: update scoped"
      on public.workout_exercises
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
          from public.workout_plans wp
          where wp.id = workout_exercises.workout_plan_id
            and wp.created_by = auth.uid()
            and exists (
              select 1
              from public.profiles p
              where p.id = auth.uid()
                and p.role = 'coach'
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
          from public.workout_plans wp
          where wp.id = workout_plan_id
            and wp.created_by = auth.uid()
            and exists (
              select 1
              from public.profiles p
              where p.id = auth.uid()
                and p.role = 'coach'
            )
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'workout_exercises'
      and policyname = 'workout_exercises: delete scoped'
  ) then
    create policy "workout_exercises: delete scoped"
      on public.workout_exercises
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
          from public.workout_plans wp
          where wp.id = workout_exercises.workout_plan_id
            and wp.created_by = auth.uid()
            and exists (
              select 1
              from public.profiles p
              where p.id = auth.uid()
                and p.role = 'coach'
            )
        )
      );
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- workout_templates
-- ---------------------------------------------------------------------------
alter table public.workout_templates enable row level security;

drop policy if exists "workout_templates: read authenticated" on public.workout_templates;
drop policy if exists "workout_templates: select scoped" on public.workout_templates;
create policy "workout_templates: select scoped"
  on public.workout_templates
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

-- insert / update / delete: workout_templates_rls_repair policies remain (owner-scoped).

-- ---------------------------------------------------------------------------
-- workout_template_exercises
-- ---------------------------------------------------------------------------
alter table public.workout_template_exercises enable row level security;

drop policy if exists "workout_template_exercises: read authenticated" on public.workout_template_exercises;
drop policy if exists "workout_template_exercises: select scoped" on public.workout_template_exercises;
create policy "workout_template_exercises: select scoped"
  on public.workout_template_exercises
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
      from public.workout_templates wt
      where wt.id = workout_template_exercises.template_id
        and wt.created_by = auth.uid()
    )
  );

-- insert / update / delete: template-owner policies from prior migrations remain.

-- ---------------------------------------------------------------------------
-- workouts (legacy table; no app queries — owner-scoped read)
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.workouts') is null then
    raise notice 'skip workouts RLS: table does not exist';
    return;
  end if;

  execute 'alter table public.workouts enable row level security';
  execute 'drop policy if exists "workouts: read all authenticated" on public.workouts';
  execute 'drop policy if exists "workouts: select scoped" on public.workouts';
end $$;

do $$
begin
  if to_regclass('public.workouts') is null then
    return;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'workouts'
      and policyname = 'workouts: select scoped'
  ) then
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
  end if;
end $$;

-- insert / update / delete: existing owner-scoped policies remain.
