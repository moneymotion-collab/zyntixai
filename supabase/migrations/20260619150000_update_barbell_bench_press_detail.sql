-- Enrich Barbell Bench Press with canonical coaching copy.

update public.exercises
set
  instructions = 'Keep shoulders retracted, lower the bar controlled, press explosively.',
  tips = 'Focus on full range of motion.'
where lower(name) = lower('Barbell Bench Press');
