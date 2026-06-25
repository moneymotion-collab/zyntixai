-- Store AI viral analysis tips as a JSON string array on content_posts.

alter table public.content_posts
  add column if not exists viral_feedback text not null default '[]';
