-- Extra metadata for generated content ideas (platform, category, goal)

alter table public.marketing_posts
  add column if not exists platform text not null default '',
  add column if not exists category text not null default '',
  add column if not exists goal text not null default '';
