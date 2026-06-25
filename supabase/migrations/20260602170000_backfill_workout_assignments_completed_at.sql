-- Backfill completed_at on workout_assignments from workout_completions
-- (e.g. when only workout_completions was inserted without updating the assignment)

update public.workout_assignments wa
set
  completed_at = wc.completed_at,
  status = 'completed'
from (
  select
    member_id,
    workout_plan_id,
    max(completed_at) as completed_at
  from public.workout_completions
  group by member_id, workout_plan_id
) wc
where wa.member_id = wc.member_id
  and wa.workout_plan_id = wc.workout_plan_id
  and wa.completed_at is null;

-- Completed assignments without a completion row: use assigned_at as fallback
update public.workout_assignments
set completed_at = assigned_at
where status = 'completed'
  and completed_at is null;
