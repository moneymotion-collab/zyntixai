-- Workflow: draft → scheduled → published (drop approved)

update public.scheduled_posts
set status = 'draft'
where status = 'approved';

update public.content_posts
set status = 'draft'
where status = 'approved';

alter table public.scheduled_posts
  drop constraint if exists scheduled_posts_status_check;

alter table public.scheduled_posts
  add constraint scheduled_posts_status_check
  check (status in ('draft', 'scheduled', 'published'));

alter table public.content_posts
  drop constraint if exists marketing_posts_status_check;

alter table public.content_posts
  drop constraint if exists content_posts_status_check;

alter table public.content_posts
  add constraint content_posts_status_check
  check (status in ('draft', 'scheduled', 'published'));
