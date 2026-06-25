-- Brand profile for marketing AI content generation

create table if not exists public.brand_profiles (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null unique references public.profiles (id) on delete cascade,
  brand_name       text not null default '',
  industry         text not null default '',
  target_audience  text not null default '',
  tone_of_voice    text not null default '',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists brand_profiles_owner_id_idx
  on public.brand_profiles (owner_id);

drop trigger if exists brand_profiles_updated_at on public.brand_profiles;
create trigger brand_profiles_updated_at
  before update on public.brand_profiles
  for each row execute function public.set_updated_at();

alter table public.brand_profiles enable row level security;

drop policy if exists "brand_profiles: select own" on public.brand_profiles;
create policy "brand_profiles: select own"
  on public.brand_profiles
  for select
  to authenticated
  using (owner_id = auth.uid());

drop policy if exists "brand_profiles: insert own" on public.brand_profiles;
create policy "brand_profiles: insert own"
  on public.brand_profiles
  for insert
  to authenticated
  with check (owner_id = auth.uid());

drop policy if exists "brand_profiles: update own" on public.brand_profiles;
create policy "brand_profiles: update own"
  on public.brand_profiles
  for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
