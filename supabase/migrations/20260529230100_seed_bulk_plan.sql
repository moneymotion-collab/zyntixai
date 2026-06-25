-- Bulk Plan: 3200 kcal, 220g protein, 350g carbs, 80g fats

insert into public.nutrition_plans (
  id,
  title,
  goal,
  calories,
  protein,
  carbs,
  fats,
  assigned_members
) values (
  '44444444-0000-0000-0000-000000000005',
  'Bulk Plan',
  'Muscle Gain',
  3200,
  220,
  350,
  80,
  0
)
on conflict (id) do update set
  title = excluded.title,
  goal = excluded.goal,
  calories = excluded.calories,
  protein = excluded.protein,
  carbs = excluded.carbs,
  fats = excluded.fats;
