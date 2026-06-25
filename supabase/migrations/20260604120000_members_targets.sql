-- Member nutrition and weight targets for coach dashboards
alter table public.members
  add column if not exists target_calories integer,
  add column if not exists target_protein integer,
  add column if not exists current_weight numeric,
  add column if not exists target_weight numeric;
