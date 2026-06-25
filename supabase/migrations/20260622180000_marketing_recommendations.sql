-- Persisted marketing recommendations generated from analytics + content_posts

create table if not exists public.marketing_recommendations (
  id                 uuid primary key default gen_random_uuid(),
  brand_id           uuid not null references public.brand_profiles (id) on delete cascade,
  user_id            uuid not null references public.profiles (id) on delete cascade,
  run_id             uuid not null,
  recommendation_key text not null,
  category           text not null default '',
  title              text not null default '',
  message            text not null,
  priority           integer not null default 0,
  metrics            jsonb not null default '{}'::jsonb,
  patterns           jsonb not null default '{}'::jsonb,
  created_at         timestamptz not null default now()
);

alter table public.marketing_recommendations
  add column if not exists run_id uuid,
  add column if not exists recommendation_key text,
  add column if not exists category text not null default '',
  add column if not exists title text not null default '',
  add column if not exists message text,
  add column if not exists priority integer not null default 0,
  add column if not exists metrics jsonb not null default '{}'::jsonb,
  add column if not exists patterns jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now();

-- Assign one legacy run_id per brand for rows missing run_id.
update public.marketing_recommendations mr
set run_id = brand_runs.run_id
from (
  select brand_id, gen_random_uuid() as run_id
  from public.marketing_recommendations
  where run_id is null
  group by brand_id
) brand_runs
where mr.brand_id = brand_runs.brand_id
  and mr.run_id is null;

update public.marketing_recommendations
set recommendation_key = coalesce(nullif(recommendation_key, ''), id::text)
where recommendation_key is null or recommendation_key = '';

update public.marketing_recommendations
set message = coalesce(message, '')
where message is null;

alter table public.marketing_recommendations
  alter column run_id set not null,
  alter column recommendation_key set not null,
  alter column message set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'marketing_recommendations_run_key_unique'
  ) then
    alter table public.marketing_recommendations
      add constraint marketing_recommendations_run_key_unique
      unique (run_id, recommendation_key);
  end if;
end $$;

create index if not exists marketing_recommendations_brand_id_idx
  on public.marketing_recommendations (brand_id);

create index if not exists marketing_recommendations_run_id_idx
  on public.marketing_recommendations (run_id);

create index if not exists marketing_recommendations_created_at_idx
  on public.marketing_recommendations (created_at desc);

alter table public.marketing_recommendations enable row level security;

drop policy if exists "marketing_recommendations: select own brand" on public.marketing_recommendations;
create policy "marketing_recommendations: select own brand"
  on public.marketing_recommendations
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.brand_profiles b
      where b.id = marketing_recommendations.brand_id
        and b.owner_id = auth.uid()
    )
  );

drop policy if exists "marketing_recommendations: insert own brand" on public.marketing_recommendations;
create policy "marketing_recommendations: insert own brand"
  on public.marketing_recommendations
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.brand_profiles b
      where b.id = marketing_recommendations.brand_id
        and b.owner_id = auth.uid()
    )
  );

drop policy if exists "marketing_recommendations: delete own brand" on public.marketing_recommendations;
create policy "marketing_recommendations: delete own brand"
  on public.marketing_recommendations
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.brand_profiles b
      where b.id = marketing_recommendations.brand_id
        and b.owner_id = auth.uid()
    )
  );
