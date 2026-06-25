-- Extend content_performance with saves and followers_gained for analytics

alter table public.content_performance
  add column if not exists saves integer not null default 0 check (saves >= 0),
  add column if not exists followers_gained integer not null default 0 check (followers_gained >= 0);
