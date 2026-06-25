-- Viral score for coach-generated scheduled posts

alter table public.scheduled_posts
  add column if not exists viral_score integer;

alter table public.scheduled_posts
  drop constraint if exists scheduled_posts_viral_score_check;

alter table public.scheduled_posts
  add constraint scheduled_posts_viral_score_check
  check (viral_score is null or (viral_score >= 0 and viral_score <= 100));
