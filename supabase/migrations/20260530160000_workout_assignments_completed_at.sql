-- Track when a member completes an assigned workout (dashboard stats)

alter table public.workout_assignments
  add column if not exists completed_at timestamptz;

update public.workout_assignments
set completed_at = assigned_at
where status = 'completed' and completed_at is null;
