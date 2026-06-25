-- Flag demo/seed workout plans for safe bulk generate and cleanup per coach.

alter table public.workout_plans
  add column if not exists is_demo boolean not null default false;

create index if not exists workout_plans_created_by_is_demo_idx
  on public.workout_plans (created_by, is_demo)
  where is_demo = true;

comment on column public.workout_plans.is_demo is
  'True for demo workout plans generated for product demos and screenshots.';
