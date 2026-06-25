alter table public.client_goals
  add column if not exists unit text,
  add column if not exists notes text,
  add column if not exists deadline date,
  add column if not exists updated_at timestamptz not null default now();

update public.client_goals
set
  deadline = target_date,
  updated_at = created_at
where deadline is null;
