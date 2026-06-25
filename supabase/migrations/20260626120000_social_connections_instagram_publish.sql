-- Per-user social platform connections and Instagram publish metadata on content_posts

create table if not exists public.social_connections (
  id                             uuid primary key default gen_random_uuid(),
  user_id                        uuid not null references public.profiles (id) on delete cascade,
  provider                       text not null,
  access_token                   text not null,
  instagram_business_account_id  text not null default '',
  created_at                     timestamptz not null default now(),
  updated_at                     timestamptz not null default now(),
  unique (user_id, provider)
);

create index if not exists social_connections_user_id_idx
  on public.social_connections (user_id);

create index if not exists social_connections_provider_idx
  on public.social_connections (provider);

drop trigger if exists social_connections_updated_at on public.social_connections;
create trigger social_connections_updated_at
  before update on public.social_connections
  for each row execute function public.set_updated_at();

alter table public.social_connections enable row level security;

drop policy if exists "social_connections: select own" on public.social_connections;
create policy "social_connections: select own"
  on public.social_connections
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "social_connections: insert own" on public.social_connections;
create policy "social_connections: insert own"
  on public.social_connections
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "social_connections: update own" on public.social_connections;
create policy "social_connections: update own"
  on public.social_connections
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "social_connections: delete own" on public.social_connections;
create policy "social_connections: delete own"
  on public.social_connections
  for delete
  to authenticated
  using (user_id = auth.uid());

alter table public.content_posts
  add column if not exists image_url text,
  add column if not exists external_post_id text;

create index if not exists content_posts_external_post_id_idx
  on public.content_posts (external_post_id)
  where external_post_id is not null;
