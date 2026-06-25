-- workout_template_exercises may pre-exist without order_index (CREATE TABLE IF NOT EXISTS).

alter table public.workout_template_exercises
  add column if not exists order_index integer;

alter table public.workout_template_exercises
  add column if not exists notes text not null default '';

alter table public.workout_template_exercises
  add column if not exists created_at timestamptz not null default now();

with ranked as (
  select
    id,
    row_number() over (
      partition by template_id
      order by created_at nulls last, id
    ) - 1 as next_order
  from public.workout_template_exercises
)
update public.workout_template_exercises wte
set order_index = ranked.next_order
from ranked
where wte.id = ranked.id
  and wte.order_index is null;

update public.workout_template_exercises
set order_index = 0
where order_index is null;

alter table public.workout_template_exercises
  alter column order_index set default 0;

alter table public.workout_template_exercises
  alter column order_index set not null;

create unique index if not exists workout_template_exercises_template_order_uidx
  on public.workout_template_exercises (template_id, order_index);
