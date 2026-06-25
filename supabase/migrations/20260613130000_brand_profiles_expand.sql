-- Expand brand_profiles to match marketing brand schema

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'brand_profiles'
      and column_name = 'brand_name'
  ) then
    alter table public.brand_profiles rename column brand_name to name;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'brand_profiles'
      and column_name = 'industry'
  ) then
    alter table public.brand_profiles rename column industry to niche;
  end if;
end $$;

alter table public.brand_profiles
  add column if not exists description text not null default '',
  add column if not exists goals text not null default '',
  add column if not exists platform_focus text not null default '';
