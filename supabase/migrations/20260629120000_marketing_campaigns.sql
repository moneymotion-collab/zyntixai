-- Store AI-generated marketing campaigns for FitCore AI

create table if not exists public.marketing_campaigns (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null references public.profiles (id) on delete cascade,
  brand_id         uuid references public.brand_profiles (id) on delete set null,
  name             text not null,
  target_audience  text not null default '',
  platform         text not null default '',
  campaign_goal    text not null default '',
  duration_days    integer not null check (duration_days in (7, 14, 30, 60)),
  campaign_json    jsonb not null default '{}'::jsonb,
  status           text not null default 'saved' check (status in ('draft', 'saved', 'active', 'completed')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.marketing_campaigns
  add column if not exists owner_id uuid references public.profiles (id) on delete cascade,
  add column if not exists brand_id uuid references public.brand_profiles (id) on delete set null,
  add column if not exists name text,
  add column if not exists target_audience text not null default '',
  add column if not exists platform text not null default '',
  add column if not exists campaign_goal text not null default '',
  add column if not exists duration_days integer,
  add column if not exists campaign_json jsonb not null default '{}'::jsonb,
  add column if not exists status text not null default 'saved',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists marketing_campaigns_owner_id_idx
  on public.marketing_campaigns (owner_id);

create index if not exists marketing_campaigns_brand_id_idx
  on public.marketing_campaigns (brand_id);

alter table public.marketing_campaigns enable row level security;

drop policy if exists "marketing_campaigns: select own" on public.marketing_campaigns;
create policy "marketing_campaigns: select own"
  on public.marketing_campaigns
  for select
  to authenticated
  using (owner_id = auth.uid());

drop policy if exists "marketing_campaigns: insert own" on public.marketing_campaigns;
create policy "marketing_campaigns: insert own"
  on public.marketing_campaigns
  for insert
  to authenticated
  with check (owner_id = auth.uid());

drop policy if exists "marketing_campaigns: update own" on public.marketing_campaigns;
create policy "marketing_campaigns: update own"
  on public.marketing_campaigns
  for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "marketing_campaigns: delete own" on public.marketing_campaigns;
create policy "marketing_campaigns: delete own"
  on public.marketing_campaigns
  for delete
  to authenticated
  using (owner_id = auth.uid());
