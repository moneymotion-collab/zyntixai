-- Workflow status for coach-generated scheduled posts

alter table public.scheduled_posts
  add column if not exists status text not null default 'draft';

alter table public.scheduled_posts
  drop constraint if exists scheduled_posts_status_check;

alter table public.scheduled_posts
  add constraint scheduled_posts_status_check
  check (status in ('draft', 'approved', 'scheduled', 'published'));

create index if not exists scheduled_posts_status_idx
  on public.scheduled_posts (status);
