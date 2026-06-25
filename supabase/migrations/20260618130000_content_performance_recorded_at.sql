-- Align content_performance with deployed schemas that use created_at only.
-- Adds recorded_at when missing (backfilled from created_at).

alter table public.content_performance
  add column if not exists recorded_at timestamptz;

update public.content_performance
set recorded_at = created_at
where recorded_at is null;

alter table public.content_performance
  alter column recorded_at set default now();
