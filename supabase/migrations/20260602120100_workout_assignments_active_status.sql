-- Use "active" for in-progress workout assignments (replaces "pending")

alter table public.workout_assignments
  drop constraint if exists workout_assignments_status_check;

update public.workout_assignments
set status = 'active'
where status = 'pending';

alter table public.workout_assignments
  alter column status set default 'active';

alter table public.workout_assignments
  add constraint workout_assignments_status_check
  check (status in ('active', 'completed'));
