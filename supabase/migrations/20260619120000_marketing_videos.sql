-- Short-form video jobs: script → ready → scheduled via content_posts publish queue

create table if not exists public.marketing_videos (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles (id) on delete cascade,
  platform         text not null default 'TikTok',
  status           text not null default 'pending'
    check (status in ('pending', 'processing', 'ready', 'failed', 'scheduled')),
  script_json      jsonb not null default '{}'::jsonb,
  video_url        text,
  content_post_id  uuid references public.content_posts (id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists marketing_videos_user_id_idx
  on public.marketing_videos (user_id);

create index if not exists marketing_videos_status_idx
  on public.marketing_videos (status);

alter table public.content_posts
  add column if not exists video_url text,
  add column if not exists marketing_video_id uuid references public.marketing_videos (id) on delete set null;

create index if not exists content_posts_marketing_video_id_idx
  on public.content_posts (marketing_video_id)
  where marketing_video_id is not null;

drop trigger if exists marketing_videos_updated_at on public.marketing_videos;
create trigger marketing_videos_updated_at
  before update on public.marketing_videos
  for each row execute function public.set_updated_at();

alter table public.marketing_videos enable row level security;

drop policy if exists "marketing_videos: select own or admin" on public.marketing_videos;
create policy "marketing_videos: select own or admin"
  on public.marketing_videos
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

drop policy if exists "marketing_videos: insert coach admin" on public.marketing_videos;
create policy "marketing_videos: insert coach admin"
  on public.marketing_videos
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

drop policy if exists "marketing_videos: update own or admin" on public.marketing_videos;
create policy "marketing_videos: update own or admin"
  on public.marketing_videos
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
