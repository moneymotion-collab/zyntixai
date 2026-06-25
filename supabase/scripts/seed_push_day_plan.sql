-- Seed canonical Push Day plan with exercises (workout_plans schema)

insert into public.workout_plans (id, title, goal, weeks, assigned_members)
values (
  '88888888-0000-0000-0000-000000000001',
  'Push Day',
  'Chest, shoulders, and triceps — horizontal and vertical pressing.',
  4,
  0
)
on conflict (id) do update
set
  title = excluded.title,
  goal = excluded.goal,
  weeks = excluded.weeks;

delete from public.workout_exercises
where workout_plan_id = '88888888-0000-0000-0000-000000000001';

insert into public.workout_exercises (workout_plan_id, exercise_name, sets, reps)
values
  ('88888888-0000-0000-0000-000000000001', 'Bench Press', 4, 8),
  ('88888888-0000-0000-0000-000000000001', 'Shoulder Press', 3, 10),
  ('88888888-0000-0000-0000-000000000001', 'Tricep Pushdown', 3, 12);
