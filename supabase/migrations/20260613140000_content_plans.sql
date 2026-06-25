-- Store AI-generated marketing content plans

create table if not exists public.content_plans (
  id             uuid primary key default gen_random_uuid(),
  brand_id       uuid not null references public.brand_profiles (id) on delete cascade,
  goal           text not null default '',
  platform       text not null default '',
  duration_days  integer not null check (duration_days >= 1 and duration_days <= 90),
  plan_json      jsonb not null default '[]'::jsonb,
  created_at     timestamptz not null default now()
);

create index if not exists content_plans_brand_id_idx
  on public.content_plans (brand_id);

alter table public.content_plans enable row level security;

drop policy if exists "content_plans: select own brand" on public.content_plans;
create policy "content_plans: select own brand"
  on public.content_plans
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.brand_profiles b
      where b.id = content_plans.brand_id
        and b.owner_id = auth.uid()
    )
  );

drop policy if exists "content_plans: insert own brand" on public.content_plans;
create policy "content_plans: insert own brand"
  on public.content_plans
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.brand_profiles b
      where b.id = content_plans.brand_id
        and b.owner_id = auth.uid()
    )
  );

drop policy if exists "content_plans: update own brand" on public.content_plans;
create policy "content_plans: update own brand"
  on public.content_plans
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.brand_profiles b
      where b.id = content_plans.brand_id
        and b.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.brand_profiles b
      where b.id = content_plans.brand_id
        and b.owner_id = auth.uid()
    )
  );

drop policy if exists "content_plans: delete own brand" on public.content_plans;
create policy "content_plans: delete own brand"
  on public.content_plans
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.brand_profiles b
      where b.id = content_plans.brand_id
        and b.owner_id = auth.uid()
    )
  );
