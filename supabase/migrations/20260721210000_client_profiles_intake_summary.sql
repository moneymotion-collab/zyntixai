alter table public.client_profiles
  add column if not exists intake_summary text;
