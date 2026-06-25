alter table public.content_performance
  add column if not exists shares integer not null default 0 check (shares >= 0);
