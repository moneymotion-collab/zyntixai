-- Seed: Push Day workout with structured exercises
-- Idempotent: supports legacy workout_id or current workout_plan_id schema.

insert into public.workouts (id, title, description)
values (
  '88888888-0000-0000-0000-000000000001',
  'Push Day',
  'Chest, shoulders, and triceps — horizontal and vertical pressing.'
)
on conflict (id) do update
set
  title = excluded.title,
  description = excluded.description;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'workout_exercises'
      and column_name = 'workout_id'
  ) then
    delete from public.workout_exercises
    where workout_id = '88888888-0000-0000-0000-000000000001';

    insert into public.workout_exercises (workout_id, name, sets, reps, sort_order)
    values
      ('88888888-0000-0000-0000-000000000001', 'Bench Press', 4, 8, 0),
      ('88888888-0000-0000-0000-000000000001', 'Shoulder Press', 3, 10, 1),
      ('88888888-0000-0000-0000-000000000001', 'Tricep Pushdown', 3, 12, 2);
  elsif exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'workout_exercises'
      and column_name = 'workout_plan_id'
  ) then
    delete from public.workout_exercises
    where workout_plan_id = '88888888-0000-0000-0000-000000000001';

    insert into public.workout_exercises (workout_plan_id, exercise_name, sets, reps)
    values
      ('88888888-0000-0000-0000-000000000001', 'Bench Press', 4, 8),
      ('88888888-0000-0000-0000-000000000001', 'Shoulder Press', 3, 10),
      ('88888888-0000-0000-0000-000000000001', 'Tricep Pushdown', 3, 12);
  end if;
end;
$$;
