-- Extend social_connections with extra Instagram settings fields

alter table public.social_connections
  add column if not exists account_username text not null default '',
  add column if not exists page_id text not null default '';

-- Allow creating a placeholder connection row without a token yet.
alter table public.social_connections
  alter column access_token set default '';

