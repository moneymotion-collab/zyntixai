-- Status for member nutrition assignments (mirrors workout assignment flow)

alter table public.member_nutrition_assignments
  add column if not exists status text not null default 'active';

alter table public.member_nutrition_assignments
  drop constraint if exists member_nutrition_assignments_status_check;

update public.member_nutrition_assignments
set status = 'active'
where status is null
   or status not in ('active', 'completed', 'paused');

alter table public.member_nutrition_assignments
  add constraint member_nutrition_assignments_status_check
  check (status in ('active', 'completed', 'paused'));
