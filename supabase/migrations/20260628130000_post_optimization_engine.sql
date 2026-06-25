-- M6 Optimization Engine: persist scoring and optimization output on both post tables.

alter table public.content_posts
  add column if not exists original_score integer
    check (original_score is null or (original_score >= 0 and original_score <= 100)),
  add column if not exists optimized_caption text,
  add column if not exists optimization_reason text,
  add column if not exists optimization_status text default 'pending';

alter table public.scheduled_posts
  add column if not exists original_score integer
    check (original_score is null or (original_score >= 0 and original_score <= 100)),
  add column if not exists optimized_title text,
  add column if not exists optimized_content text,
  add column if not exists optimized_caption text,
  add column if not exists optimized_hashtags text,
  add column if not exists optimized_score integer
    check (optimized_score is null or (optimized_score >= 0 and optimized_score <= 100)),
  add column if not exists optimization_reason text,
  add column if not exists optimization_status text default 'pending';
