-- Production exercise library: expanded catalog + plan junction table with secure RLS.

-- ---------------------------------------------------------------------------
-- 1) Expand exercises catalog
-- ---------------------------------------------------------------------------

alter table public.exercises
  add column if not exists category text,
  add column if not exists primary_muscle text,
  add column if not exists secondary_muscles text[] not null default '{}',
  add column if not exists equipment text,
  add column if not exists difficulty text,
  add column if not exists instructions text,
  add column if not exists tips text,
  add column if not exists video_url text,
  add column if not exists image_url text;

-- Backfill from legacy muscle_group column when present.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'exercises'
      and column_name = 'muscle_group'
  ) then
    update public.exercises
    set primary_muscle = coalesce(nullif(trim(primary_muscle), ''), nullif(trim(muscle_group), ''))
    where coalesce(nullif(trim(primary_muscle), ''), '') = '';
  end if;
end;
$$;

update public.exercises
set
  category = coalesce(nullif(trim(category), ''), 'Strength'),
  primary_muscle = coalesce(nullif(trim(primary_muscle), ''), 'General'),
  equipment = coalesce(nullif(trim(equipment), ''), 'Varies'),
  difficulty = coalesce(nullif(trim(difficulty), ''), 'Intermediate'),
  instructions = coalesce(instructions, ''),
  tips = coalesce(tips, '')
where category is null
   or primary_muscle is null
   or equipment is null
   or difficulty is null
   or instructions is null
   or tips is null;

alter table public.exercises
  alter column category set default 'Strength',
  alter column category set not null,
  alter column primary_muscle set default 'General',
  alter column primary_muscle set not null,
  alter column equipment set default 'Varies',
  alter column equipment set not null,
  alter column difficulty set default 'Intermediate',
  alter column difficulty set not null,
  alter column instructions set default '',
  alter column instructions set not null,
  alter column tips set default '',
  alter column tips set not null;

alter table public.exercises
  drop column if exists muscle_group;

drop index if exists public.exercises_muscle_group_idx;

create index if not exists exercises_category_idx
  on public.exercises (category);

create index if not exists exercises_primary_muscle_idx
  on public.exercises (primary_muscle);

create index if not exists exercises_name_idx
  on public.exercises (name);

-- Enrich seeded catalog entries.
update public.exercises as e
set
  category = v.category,
  primary_muscle = v.primary_muscle,
  secondary_muscles = v.secondary_muscles,
  equipment = v.equipment,
  difficulty = v.difficulty,
  instructions = v.instructions,
  tips = v.tips
from (
  values
    (
      'Bench Press',
      'Strength',
      'Chest',
      array['Triceps', 'Shoulders']::text[],
      'Barbell',
      'Intermediate',
      'Lie on a flat bench, grip the bar slightly wider than shoulder width, lower to mid-chest, and press up.',
      'Keep shoulder blades retracted and feet planted.'
    ),
    (
      'Incline Dumbbell Press',
      'Strength',
      'Chest',
      array['Shoulders', 'Triceps']::text[],
      'Dumbbells',
      'Intermediate',
      'Set bench to 30-45 degrees, press dumbbells from chest level to full extension.',
      'Use a controlled eccentric and avoid flaring elbows excessively.'
    ),
    (
      'Barbell Row',
      'Strength',
      'Back',
      array['Biceps', 'Rear Delts']::text[],
      'Barbell',
      'Intermediate',
      'Hinge at the hips, pull the bar toward the lower ribs while keeping a neutral spine.',
      'Lead with elbows and squeeze at the top.'
    ),
    (
      'Lat Pulldown',
      'Strength',
      'Back',
      array['Biceps']::text[],
      'Cable Machine',
      'Beginner',
      'Pull the bar to upper chest while keeping torso upright and shoulder blades depressed.',
      'Avoid leaning too far back or using momentum.'
    ),
    (
      'Barbell Squat',
      'Strength',
      'Legs',
      array['Glutes', 'Core']::text[],
      'Barbell',
      'Intermediate',
      'Sit hips back and down, keep knees tracking over toes, and drive through mid-foot to stand.',
      'Brace core before each rep and maintain even foot pressure.'
    ),
    (
      'Romanian Deadlift',
      'Strength',
      'Legs',
      array['Glutes', 'Lower Back']::text[],
      'Barbell',
      'Intermediate',
      'Hinge at hips with soft knees, lower bar along thighs until hamstrings stretch, then return.',
      'Keep bar close and spine neutral throughout.'
    ),
    (
      'Overhead Press',
      'Strength',
      'Shoulders',
      array['Triceps', 'Upper Chest']::text[],
      'Barbell',
      'Intermediate',
      'Press bar overhead from shoulder height to lockout without excessive back lean.',
      'Squeeze glutes and brace core for stability.'
    ),
    (
      'Lateral Raise',
      'Strength',
      'Shoulders',
      array[]::text[],
      'Dumbbells',
      'Beginner',
      'Raise dumbbells out to the sides until upper arms are parallel to the floor.',
      'Use light weight and control the lowering phase.'
    ),
    (
      'Barbell Curl',
      'Strength',
      'Arms',
      array['Forearms']::text[],
      'Barbell',
      'Beginner',
      'Curl bar from full extension to shoulder level without swinging.',
      'Keep elbows pinned at your sides.'
    ),
    (
      'Tricep Pushdown',
      'Strength',
      'Arms',
      array[]::text[],
      'Cable Machine',
      'Beginner',
      'Push attachment down to full elbow extension while keeping upper arms fixed.',
      'Avoid letting shoulders roll forward.'
    )
) as v(name, category, primary_muscle, secondary_muscles, equipment, difficulty, instructions, tips)
where e.name = v.name;

-- ---------------------------------------------------------------------------
-- 2) workout_plan_exercises junction table
-- ---------------------------------------------------------------------------

create table if not exists public.workout_plan_exercises (
  id              uuid primary key default gen_random_uuid(),
  workout_plan_id uuid not null references public.workout_plans (id) on delete cascade,
  exercise_id     uuid not null references public.exercises (id) on delete restrict,
  sets            integer not null default 3 check (sets > 0),
  reps            text not null default '10',
  rest_seconds    integer not null default 60 check (rest_seconds >= 0),
  notes           text not null default '',
  order_index     integer not null default 0,
  created_at      timestamptz not null default now(),
  unique (workout_plan_id, order_index)
);

create index if not exists workout_plan_exercises_plan_idx
  on public.workout_plan_exercises (workout_plan_id);

create index if not exists workout_plan_exercises_exercise_idx
  on public.workout_plan_exercises (exercise_id);

create index if not exists workout_plan_exercises_plan_order_idx
  on public.workout_plan_exercises (workout_plan_id, order_index);

-- ---------------------------------------------------------------------------
-- 3) Migrate legacy workout_exercises rows (if table exists)
-- ---------------------------------------------------------------------------

do $$
declare
  v_has_legacy boolean;
  v_plan_col text;
begin
  select exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'workout_exercises'
      and table_type = 'BASE TABLE'
  ) into v_has_legacy;

  if not v_has_legacy then
    return;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'workout_exercises'
      and column_name = 'workout_plan_id'
  ) then
    v_plan_col := 'workout_plan_id';
  elsif exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'workout_exercises'
      and column_name = 'workout_id'
  ) then
    v_plan_col := 'workout_id';
  else
    return;
  end if;

  -- Ensure every legacy exercise name exists in the catalog.
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'workout_exercises'
      and column_name = 'exercise_name'
  ) then
    insert into public.exercises (name, category, primary_muscle, equipment, difficulty, instructions, tips)
    select distinct
      trim(we.exercise_name) as name,
      'Strength',
      'General',
      'Varies',
      'Intermediate',
      '',
      ''
    from public.workout_exercises we
    where nullif(trim(we.exercise_name), '') is not null
      and not exists (
        select 1
        from public.exercises e
        where lower(e.name) = lower(trim(we.exercise_name))
      );
  elsif exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'workout_exercises'
      and column_name = 'name'
  ) then
    insert into public.exercises (name, category, primary_muscle, equipment, difficulty, instructions, tips)
    select distinct
      trim(we.name) as name,
      'Strength',
      'General',
      'Varies',
      'Intermediate',
      '',
      ''
    from public.workout_exercises we
    where nullif(trim(we.name), '') is not null
      and not exists (
        select 1
        from public.exercises e
        where lower(e.name) = lower(trim(we.name))
      );
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'workout_exercises'
      and column_name = 'exercise_name'
  ) then
    execute format($sql$
      insert into public.workout_plan_exercises (
        id,
        workout_plan_id,
        exercise_id,
        sets,
        reps,
        rest_seconds,
        notes,
        order_index,
        created_at
      )
      select
        we.id,
        we.%1$I,
        e.id,
        greatest(coalesce(we.sets, 3), 1),
        coalesce(nullif(trim(we.reps::text), ''), '10'),
        60,
        '',
        row_number() over (
          partition by we.%1$I
          order by we.created_at nulls last, we.id
        ) - 1,
        coalesce(we.created_at, now())
      from public.workout_exercises we
      join public.exercises e
        on lower(e.name) = lower(trim(we.exercise_name))
      where not exists (
        select 1
        from public.workout_plan_exercises wpe
        where wpe.id = we.id
      )
      on conflict (id) do nothing
    $sql$, v_plan_col);
  elsif exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'workout_exercises'
      and column_name = 'name'
  ) then
    execute format($sql$
      insert into public.workout_plan_exercises (
        id,
        workout_plan_id,
        exercise_id,
        sets,
        reps,
        rest_seconds,
        notes,
        order_index,
        created_at
      )
      select
        we.id,
        we.%1$I,
        e.id,
        greatest(coalesce(we.sets, 3), 1),
        coalesce(nullif(trim(we.reps::text), ''), '10'),
        60,
        '',
        row_number() over (
          partition by we.%1$I
          order by we.created_at nulls last, we.id
        ) - 1,
        coalesce(we.created_at, now())
      from public.workout_exercises we
      join public.exercises e
        on lower(e.name) = lower(trim(we.name))
      where not exists (
        select 1
        from public.workout_plan_exercises wpe
        where wpe.id = we.id
      )
      on conflict (id) do nothing
    $sql$, v_plan_col);
  end if;

  drop table public.workout_exercises cascade;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4) RLS: exercises
-- ---------------------------------------------------------------------------

alter table public.exercises enable row level security;

drop policy if exists "exercises: read authenticated" on public.exercises;
create policy "exercises: read authenticated"
  on public.exercises
  for select
  to authenticated
  using (true);

drop policy if exists "exercises: insert authenticated" on public.exercises;
drop policy if exists "exercises: insert admin" on public.exercises;
create policy "exercises: insert admin"
  on public.exercises
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
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

-- ---------------------------------------------------------------------------
-- 5) RLS: workout_plan_exercises
-- ---------------------------------------------------------------------------

alter table public.workout_plan_exercises enable row level security;

drop policy if exists "workout_plan_exercises: select scoped" on public.workout_plan_exercises;
create policy "workout_plan_exercises: select scoped"
  on public.workout_plan_exercises
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
      where wp.id = workout_plan_exercises.workout_plan_id
        and wp.created_by = auth.uid()
    )
    or exists (
      select 1
      from public.workout_assignments wa
      join public.members m on m.id = wa.member_id
      where wa.workout_plan_id = workout_plan_exercises.workout_plan_id
        and lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
    )
  );

drop policy if exists "workout_plan_exercises: insert coach owner" on public.workout_plan_exercises;
create policy "workout_plan_exercises: insert coach owner"
  on public.workout_plan_exercises
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
      where wp.id = workout_plan_exercises.workout_plan_id
        and wp.created_by = auth.uid()
        and exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'coach'
        )
    )
  );

drop policy if exists "workout_plan_exercises: update coach owner" on public.workout_plan_exercises;
create policy "workout_plan_exercises: update coach owner"
  on public.workout_plan_exercises
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
      where wp.id = workout_plan_exercises.workout_plan_id
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
      where wp.id = workout_plan_exercises.workout_plan_id
        and wp.created_by = auth.uid()
        and exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'coach'
        )
    )
  );

drop policy if exists "workout_plan_exercises: delete coach owner" on public.workout_plan_exercises;
create policy "workout_plan_exercises: delete coach owner"
  on public.workout_plan_exercises
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
      where wp.id = workout_plan_exercises.workout_plan_id
        and wp.created_by = auth.uid()
        and exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'coach'
        )
    )
  );
