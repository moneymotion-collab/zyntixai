-- Per-owner marketing preferences for AI content generation

create table if not exists public.marketing_settings (
  id                 uuid primary key default gen_random_uuid(),
  owner_id           uuid not null unique references public.profiles (id) on delete cascade,
  gym_type           text not null default '',
  target_audience    text not null default '',
  business_goal      text not null default '',
  posting_frequency  text not null default '',
  content_tone       text not null default '',
  preferred_platform text not null default '',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists marketing_settings_owner_id_idx
  on public.marketing_settings (owner_id);

drop trigger if exists marketing_settings_updated_at on public.marketing_settings;
create trigger marketing_settings_updated_at
  before update on public.marketing_settings
  for each row execute function public.set_updated_at();

alter table public.marketing_settings enable row level security;

drop policy if exists "marketing_settings: select own" on public.marketing_settings;
create policy "marketing_settings: select own"
  on public.marketing_settings
  for select
  to authenticated
  using (owner_id = auth.uid());

drop policy if exists "marketing_settings: insert own" on public.marketing_settings;
create policy "marketing_settings: insert own"
  on public.marketing_settings
  for insert
  to authenticated
  with check (owner_id = auth.uid());

drop policy if exists "marketing_settings: update own" on public.marketing_settings;
create policy "marketing_settings: update own"
  on public.marketing_settings
  for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
