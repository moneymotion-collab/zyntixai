-- Instagram publish pipeline fields for scheduled_posts

alter table public.scheduled_posts
  add column if not exists media_url text,
  add column if not exists media_type text,
  add column if not exists instagram_container_id text,
  add column if not exists instagram_media_id text,
  add column if not exists publish_status text not null default 'draft',
  add column if not exists publish_error text,
  add column if not exists published_at timestamptz;

alter table public.scheduled_posts
  drop constraint if exists scheduled_posts_media_type_check;

alter table public.scheduled_posts
  add constraint scheduled_posts_media_type_check
  check (media_type is null or media_type in ('IMAGE', 'VIDEO', 'REEL'));

alter table public.scheduled_posts
  drop constraint if exists scheduled_posts_publish_status_check;

alter table public.scheduled_posts
  add constraint scheduled_posts_publish_status_check
  check (
    publish_status in (
      'draft',
      'approved',
      'scheduled',
      'processing',
      'published',
      'failed'
    )
  );

-- Backfill publish_status from legacy status column
update public.scheduled_posts
set publish_status = status
where publish_status = 'draft'
  and status in ('scheduled', 'published', 'failed');

create index if not exists scheduled_posts_publish_status_idx
  on public.scheduled_posts (publish_status);
