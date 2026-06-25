-- Link content posts back to plan days

alter table public.content_posts
  add column if not exists content_plan_id uuid references public.content_plans (id) on delete cascade,
  add column if not exists plan_day integer check (plan_day is null or plan_day >= 1);

create index if not exists content_posts_content_plan_id_idx
  on public.content_posts (content_plan_id);

create unique index if not exists content_posts_plan_day_unique_idx
  on public.content_posts (content_plan_id, plan_day)
  where content_plan_id is not null and plan_day is not null;
