-- Track analytics sync state per published post

alter table public.content_posts
  add column if not exists sync_status text,
  add column if not exists metrics_sync_status text;

create index if not exists content_posts_sync_status_idx
  on public.content_posts (sync_status)
  where sync_status is not null;

create index if not exists content_posts_metrics_sync_status_idx
  on public.content_posts (metrics_sync_status)
  where metrics_sync_status is not null;
