-- Track last publish error message on content_posts

alter table public.content_posts
  add column if not exists publish_error text;

