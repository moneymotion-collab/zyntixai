-- Store AI optimization output separately from the original post draft.

alter table public.content_posts
  add column if not exists optimized_title text,
  add column if not exists optimized_content text,
  add column if not exists optimized_score integer
    check (optimized_score is null or (optimized_score >= 0 and optimized_score <= 100));
