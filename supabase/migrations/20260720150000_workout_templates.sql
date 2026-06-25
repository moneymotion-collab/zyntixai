-- Reusable workout templates saved by coaches/admins.

create table if not exists public.workout_templates (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  goal        text,
  category    text,
  created_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists workout_templates_created_by_idx
  on public.workout_templates (created_by);

create index if not exists workout_templates_created_at_idx
  on public.workout_templates (created_at desc);

create table if not exists public.workout_template_exercises (
  id            uuid primary key default gen_random_uuid(),
  template_id   uuid not null references public.workout_templates (id) on delete cascade,
  exercise_id   uuid not null references public.exercises (id) on delete restrict,
  sets          integer not null default 3 check (sets > 0),
  reps          text not null default '10',
  rest_seconds  integer not null default 60 check (rest_seconds >= 0),
  notes         text not null default '',
  order_index   integer not null default 0,
  created_at    timestamptz not null default now(),
  unique (template_id, order_index)
);

create index if not exists workout_template_exercises_template_idx
  on public.workout_template_exercises (template_id);

create index if not exists workout_template_exercises_exercise_idx
  on public.workout_template_exercises (exercise_id);

alter table public.workout_templates enable row level security;
alter table public.workout_template_exercises enable row level security;

drop policy if exists "workout_templates: read authenticated" on public.workout_templates;
create policy "workout_templates: read authenticated"
  on public.workout_templates
  for select
  to authenticated
  using (true);

drop policy if exists "workout_templates: insert own" on public.workout_templates;
create policy "workout_templates: insert own"
  on public.workout_templates
  for insert
  to authenticated
  with check (auth.uid() = created_by);

drop policy if exists "workout_templates: update own" on public.workout_templates;
create policy "workout_templates: update own"
  on public.workout_templates
  for update
  to authenticated
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

drop policy if exists "workout_templates: delete own" on public.workout_templates;
create policy "workout_templates: delete own"
  on public.workout_templates
  for delete
  to authenticated
  using (auth.uid() = created_by);

drop policy if exists "workout_template_exercises: read authenticated" on public.workout_template_exercises;
create policy "workout_template_exercises: read authenticated"
  on public.workout_template_exercises
  for select
  to authenticated
  using (true);

drop policy if exists "workout_template_exercises: insert via own template" on public.workout_template_exercises;
create policy "workout_template_exercises: insert via own template"
  on public.workout_template_exercises
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.workout_templates wt
      where wt.id = workout_template_exercises.template_id
        and wt.created_by = auth.uid()
    )
  );

drop policy if exists "workout_template_exercises: update via own template" on public.workout_template_exercises;
create policy "workout_template_exercises: update via own template"
  on public.workout_template_exercises
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.workout_templates wt
      where wt.id = workout_template_exercises.template_id
        and wt.created_by = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.workout_templates wt
      where wt.id = workout_template_exercises.template_id
        and wt.created_by = auth.uid()
    )
  );

drop policy if exists "workout_template_exercises: delete via own template" on public.workout_template_exercises;
create policy "workout_template_exercises: delete via own template"
  on public.workout_template_exercises
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.workout_templates wt
      where wt.id = workout_template_exercises.template_id
        and wt.created_by = auth.uid()
    )
  );
