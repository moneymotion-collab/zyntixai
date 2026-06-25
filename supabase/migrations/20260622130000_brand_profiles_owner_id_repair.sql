-- Repair brand_profiles schema drift on environments that use user_id/brand_name/industry.

do $$
begin
  if to_regclass('public.brand_profiles') is null then
    return;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'brand_profiles'
      and column_name = 'user_id'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'brand_profiles'
      and column_name = 'owner_id'
  ) then
    alter table public.brand_profiles
      rename column user_id to owner_id;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'brand_profiles'
      and column_name = 'brand_name'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'brand_profiles'
      and column_name = 'name'
  ) then
    alter table public.brand_profiles
      rename column brand_name to name;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'brand_profiles'
      and column_name = 'industry'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'brand_profiles'
      and column_name = 'niche'
  ) then
    alter table public.brand_profiles
      rename column industry to niche;
  end if;
end $$;

alter table public.brand_profiles
  add column if not exists description text not null default '',
  add column if not exists goals text not null default '',
  add column if not exists platform_focus text not null default '',
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text;

do $$
begin
  if to_regclass('public.brand_profiles') is null then
    return;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'brand_profiles_owner_id_fkey'
      and conrelid = 'public.brand_profiles'::regclass
  ) then
    alter table public.brand_profiles
      add constraint brand_profiles_owner_id_fkey
      foreign key (owner_id) references public.profiles (id) on delete cascade;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'brand_profiles_owner_id_key'
      and conrelid = 'public.brand_profiles'::regclass
  ) then
    alter table public.brand_profiles
      add constraint brand_profiles_owner_id_key unique (owner_id);
  end if;
end $$;

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
