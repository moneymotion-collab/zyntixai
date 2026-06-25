-- Viral potential score for generated content posts

alter table public.content_posts
  add column if not exists viral_score smallint
    check (viral_score is null or (viral_score >= 0 and viral_score <= 100)),
  add column if not exists viral_reason text not null default '';
