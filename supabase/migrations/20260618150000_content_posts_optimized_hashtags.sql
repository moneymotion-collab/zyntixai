alter table public.content_posts
  add column if not exists optimized_hashtags text;
