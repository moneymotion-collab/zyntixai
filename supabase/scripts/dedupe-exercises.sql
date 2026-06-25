-- Deduplicate exercises by name, preserving FK references.

with ranked as (
  select
    id,
    name,
    row_number() over (
      partition by name
      order by created_at nulls last, id::text
    ) as rn
  from public.exercises
),
dupes as (
  select
    r.id as dup_id,
    k.id as keep_id
  from ranked r
  join ranked k
    on k.name = r.name
   and k.rn = 1
  where r.rn > 1
)
update public.workout_plan_exercises wpe
set exercise_id = d.keep_id
from dupes d
where wpe.exercise_id = d.dup_id;

with ranked as (
  select
    id,
    name,
    row_number() over (
      partition by name
      order by created_at nulls last, id::text
    ) as rn
  from public.exercises
)
delete from public.exercises e
using ranked r
where e.id = r.id
  and r.rn > 1;
