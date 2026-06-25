alter table public.client_checkins
  add column if not exists coach_note text,
  add column if not exists action_plan text;
