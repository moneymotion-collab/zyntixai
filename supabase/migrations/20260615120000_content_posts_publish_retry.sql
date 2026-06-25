-- Track publish failures and retries

alter table public.content_posts
  add column if not exists retry_count integer not null default 0;

alter table public.scheduled_posts
  add column if not exists retry_count integer not null default 0;

alter table public.content_posts
  drop constraint if exists content_posts_status_check;

alter table public.content_posts
  add constraint content_posts_status_check
  check (status in ('draft', 'scheduled', 'published', 'failed'));

alter table public.scheduled_posts
  drop constraint if exists scheduled_posts_status_check;

alter table public.scheduled_posts
  add constraint scheduled_posts_status_check
  check (status in ('draft', 'scheduled', 'published', 'failed'));
