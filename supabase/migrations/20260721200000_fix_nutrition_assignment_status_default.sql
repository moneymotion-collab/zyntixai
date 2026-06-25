-- Ensure nutrition assignment status default matches check constraint (active | completed | paused).
-- Fixes inserts that omit status when column default was still 'pending' from an older schema.

alter table public.member_nutrition_assignments
  drop constraint if exists member_nutrition_assignments_status_check;

update public.member_nutrition_assignments
set status = 'active'
where status is null
   or status not in ('active', 'completed', 'paused');

alter table public.member_nutrition_assignments
  alter column status set default 'active';

alter table public.member_nutrition_assignments
  add constraint member_nutrition_assignments_status_check
  check (status in ('active', 'completed', 'paused'));
