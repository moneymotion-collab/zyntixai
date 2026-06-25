-- Per-owner gym branding and social settings

create table if not exists public.gym_settings (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null unique references public.profiles (id) on delete cascade,
  gym_name        text not null default '',
  logo_url        text not null default '',
  website         text not null default '',
  instagram_url   text not null default '',
  facebook_url    text not null default '',
  tiktok_url      text not null default '',
  primary_color   text not null default '#000000',
  secondary_color text not null default '#ffffff',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists gym_settings_owner_id_idx
  on public.gym_settings (owner_id);

drop trigger if exists gym_settings_updated_at on public.gym_settings;
create trigger gym_settings_updated_at
  before update on public.gym_settings
  for each row execute function public.set_updated_at();

alter table public.gym_settings enable row level security;

drop policy if exists "gym_settings: select own" on public.gym_settings;
create policy "gym_settings: select own"
  on public.gym_settings
  for select
  to authenticated
  using (owner_id = auth.uid());

drop policy if exists "gym_settings: insert own" on public.gym_settings;
create policy "gym_settings: insert own"
  on public.gym_settings
  for insert
  to authenticated
  with check (owner_id = auth.uid());

drop policy if exists "gym_settings: update own" on public.gym_settings;
create policy "gym_settings: update own"
  on public.gym_settings
  for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
