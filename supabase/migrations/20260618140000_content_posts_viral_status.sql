-- AI recommendation after viral analysis (approve | optimize | reject)

alter table public.content_posts
  add column if not exists viral_status text not null default '';
