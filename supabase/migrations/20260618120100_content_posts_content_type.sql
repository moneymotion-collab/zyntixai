-- Track how content posts were created (e.g. generated_from_plan)

alter table public.content_posts
  add column if not exists content_type text not null default '';

create index if not exists content_posts_plan_content_type_idx
  on public.content_posts (brand_id, content_plan_id, content_type)
  where content_plan_id is not null and content_type <> '';
