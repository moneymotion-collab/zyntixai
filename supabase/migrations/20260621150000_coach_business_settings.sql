-- Coach business settings for revenue estimates and future Stripe integration

create table if not exists public.coach_business_settings (
  id                  uuid primary key default gen_random_uuid(),
  owner_id            uuid not null unique references public.profiles (id) on delete cascade,
  revenue_per_member  numeric(10, 2) not null default 150.00,
  currency            text not null default 'USD',
  -- Reserved for future Stripe integration (not wired yet)
  stripe_account_id   text,
  stripe_connected    boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists coach_business_settings_owner_id_idx
  on public.coach_business_settings (owner_id);

drop trigger if exists coach_business_settings_updated_at on public.coach_business_settings;
create trigger coach_business_settings_updated_at
  before update on public.coach_business_settings
  for each row execute function public.set_updated_at();

alter table public.coach_business_settings enable row level security;

drop policy if exists "coach_business_settings: select own" on public.coach_business_settings;
create policy "coach_business_settings: select own"
  on public.coach_business_settings
  for select
  to authenticated
  using (owner_id = auth.uid());

drop policy if exists "coach_business_settings: insert own" on public.coach_business_settings;
create policy "coach_business_settings: insert own"
  on public.coach_business_settings
  for insert
  to authenticated
  with check (owner_id = auth.uid());

drop policy if exists "coach_business_settings: update own" on public.coach_business_settings;
create policy "coach_business_settings: update own"
  on public.coach_business_settings
  for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
