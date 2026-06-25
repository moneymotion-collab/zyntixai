-- BETA4: Stripe webhook idempotency — record processed event IDs (service role only).

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null unique,
  event_type text,
  processed_at timestamptz not null default now(),
  payload jsonb
);

create index if not exists webhook_events_provider_processed_at_idx
  on public.webhook_events (provider, processed_at desc);

alter table public.webhook_events enable row level security;

revoke all on public.webhook_events from anon, authenticated;
grant all on public.webhook_events to service_role;
