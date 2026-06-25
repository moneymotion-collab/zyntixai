-- Repair marketing_recommendations.run_id for environments where the table
-- predates the column (create table if not exists skipped the full schema).

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

create index if not exists marketing_recommendations_run_id_idx
  on public.marketing_recommendations (run_id);
