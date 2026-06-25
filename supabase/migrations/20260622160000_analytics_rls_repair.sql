-- Repair analytics RLS policies on environments where the table exists without policies.

alter table public.analytics enable row level security;

drop policy if exists "analytics: select own brand" on public.analytics;
create policy "analytics: select own brand"
  on public.analytics
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.brand_profiles b
      where b.id = analytics.brand_id
        and b.owner_id = auth.uid()
    )
  );

drop policy if exists "analytics: insert own brand" on public.analytics;
create policy "analytics: insert own brand"
  on public.analytics
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.brand_profiles b
      where b.id = analytics.brand_id
        and b.owner_id = auth.uid()
    )
  );

drop policy if exists "analytics: update own brand" on public.analytics;
create policy "analytics: update own brand"
  on public.analytics
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.brand_profiles b
      where b.id = analytics.brand_id
        and b.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.brand_profiles b
      where b.id = analytics.brand_id
        and b.owner_id = auth.uid()
    )
  );

drop policy if exists "analytics: delete own brand" on public.analytics;
create policy "analytics: delete own brand"
  on public.analytics
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.brand_profiles b
      where b.id = analytics.brand_id
        and b.owner_id = auth.uid()
    )
  );
