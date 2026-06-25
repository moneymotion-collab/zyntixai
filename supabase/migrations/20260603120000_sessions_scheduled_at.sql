-- Combine session date + time into a single timestamptz column.
alter table public.sessions
  add column if not exists scheduled_at timestamptz;

update public.sessions
set scheduled_at = (
  scheduled_date::text || 'T' || coalesce(scheduled_time, '00:00') || ':00'
)::timestamptz
where scheduled_at is null
  and scheduled_date is not null;

create index if not exists sessions_scheduled_at_idx
  on public.sessions (scheduled_at desc nulls last);
