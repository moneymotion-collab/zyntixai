-- Align workout_assignments and workout_completions with workout_plans.
-- Safe to re-run: migrates existing workouts rows first so assignments keep valid FKs.

-- 1) Copy user-created workouts into workout_plans (preserve ids)
insert into public.workout_plans (id, title, goal, weeks, assigned_members, created_at)
select
  w.id,
  w.title,
  nullif(trim(w.description), ''),
  4,
  0,
  w.created_at
from public.workouts w
where not exists (
  select 1 from public.workout_plans wp where wp.id = w.id
);

-- 2) workout_assignments: repoint from workouts -> workout_plans
alter table public.workout_assignments
  drop constraint if exists workout_assignments_workout_id_fkey;

alter table public.workout_assignments
  rename column workout_id to workout_plan_id;

alter table public.workout_assignments
  add constraint workout_assignments_workout_plan_id_fkey
  foreign key (workout_plan_id)
  references public.workout_plans (id)
  on delete cascade;

alter table public.workout_assignments
  drop constraint if exists workout_assignments_member_workout_unique;

alter table public.workout_assignments
  add constraint workout_assignments_member_plan_unique
  unique (member_id, workout_plan_id);

-- 3) workout_completions: repoint from workouts -> workout_plans
alter table public.workout_completions
  drop constraint if exists workout_completions_workout_id_fkey;

alter table public.workout_completions
  rename column workout_id to workout_plan_id;

alter table public.workout_completions
  add constraint workout_completions_workout_plan_id_fkey
  foreign key (workout_plan_id)
  references public.workout_plans (id)
  on delete cascade;
