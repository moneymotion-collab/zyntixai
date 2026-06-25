-- Per-post social metrics scoped to a brand

create table if not exists public.analytics (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid references public.content_posts (id) on delete set null,
  brand_id   uuid not null references public.brand_profiles (id) on delete cascade,
  platform   text not null default '',
  views      integer not null default 0 check (views >= 0),
  likes      integer not null default 0 check (likes >= 0),
  comments   integer not null default 0 check (comments >= 0),
  shares     integer not null default 0 check (shares >= 0),
  saves      integer not null default 0 check (saves >= 0),
  created_at timestamptz not null default now()
);

create index if not exists analytics_post_id_idx
  on public.analytics (post_id);

create index if not exists analytics_brand_id_idx
  on public.analytics (brand_id);

create index if not exists analytics_platform_idx
  on public.analytics (platform);

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
