-- Marketing demo: content ideas table + is_demo flags

create table if not exists public.content_ideas (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles (id) on delete cascade,
  brand_id       uuid references public.brand_profiles (id) on delete set null,
  title          text not null,
  caption        text not null default '',
  hashtags       text not null default '',
  platform       text not null default '',
  category       text not null default '',
  content_type   text not null default '',
  goal           text not null default '',
  viral_score    integer,
  viral_reason   text not null default '',
  suggested_cta  text not null default '',
  is_demo        boolean not null default false,
  created_at     timestamptz not null default now()
);

create index if not exists content_ideas_user_id_idx
  on public.content_ideas (user_id);

create index if not exists content_ideas_user_id_is_demo_idx
  on public.content_ideas (user_id, is_demo)
  where is_demo = true;

alter table public.content_ideas enable row level security;

drop policy if exists "content_ideas: select own or admin" on public.content_ideas;
create policy "content_ideas: select own or admin"
  on public.content_ideas
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

drop policy if exists "content_ideas: insert coach admin" on public.content_ideas;
create policy "content_ideas: insert coach admin"
  on public.content_ideas
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'coach')
    )
  );

drop policy if exists "content_ideas: update own or admin" on public.content_ideas;
create policy "content_ideas: update own or admin"
  on public.content_ideas
  for update
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  )
  with check (
    user_id = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

drop policy if exists "content_ideas: delete own or admin" on public.content_ideas;
create policy "content_ideas: delete own or admin"
  on public.content_ideas
  for delete
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

alter table public.content_posts
  add column if not exists is_demo boolean not null default false;

alter table public.scheduled_posts
  add column if not exists is_demo boolean not null default false;

alter table public.content_performance
  add column if not exists is_demo boolean not null default false;

alter table public.analytics
  add column if not exists is_demo boolean not null default false;

create index if not exists content_posts_created_by_is_demo_idx
  on public.content_posts (created_by, is_demo)
  where is_demo = true;

create index if not exists scheduled_posts_user_id_is_demo_idx
  on public.scheduled_posts (user_id, is_demo)
  where is_demo = true;

create index if not exists content_performance_created_by_is_demo_idx
  on public.content_performance (created_by, is_demo)
  where is_demo = true;

create index if not exists analytics_brand_id_is_demo_idx
  on public.analytics (brand_id, is_demo)
  where is_demo = true;
