-- plan_id alias for linking posts to content plans

alter table public.content_posts
  add column if not exists plan_id uuid references public.content_plans (id) on delete cascade;

update public.content_posts
set plan_id = content_plan_id
where plan_id is null
  and content_plan_id is not null;

create index if not exists content_posts_plan_id_idx
  on public.content_posts (plan_id);

drop index if exists content_posts_plan_content_type_idx;

create index if not exists content_posts_plan_content_type_idx
  on public.content_posts (brand_id, plan_id, content_type)
  where plan_id is not null and content_type <> '';
