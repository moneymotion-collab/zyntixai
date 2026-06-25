-- Flag demo workout assignments and allow paused status.

alter table public.workout_assignments
  add column if not exists is_demo boolean not null default false;

create index if not exists workout_assignments_is_demo_idx
  on public.workout_assignments (is_demo)
  where is_demo = true;

alter table public.workout_assignments
  drop constraint if exists workout_assignments_status_check;

alter table public.workout_assignments
  add constraint workout_assignments_status_check
  check (status in ('active', 'completed', 'paused'));

comment on column public.workout_assignments.is_demo is
  'True for demo assignments generated for product demos and screenshots.';
