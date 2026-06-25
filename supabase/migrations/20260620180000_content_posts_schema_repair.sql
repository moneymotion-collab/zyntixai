-- Repair content_posts columns for environments that diverged from migration history.

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'content_posts'
      and column_name = 'viral_score_reason'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'content_posts'
      and column_name = 'viral_reason'
  ) then
    alter table public.content_posts
      rename column viral_score_reason to viral_reason;
  end if;
end $$;

alter table public.content_posts
  add column if not exists viral_reason text not null default '',
  add column if not exists viral_status text not null default '',
  add column if not exists optimized_hashtags text,
  add column if not exists retry_count integer not null default 0;

do $$
begin
  if to_regclass('public.brand_profiles') is not null
     and not exists (
       select 1
       from information_schema.columns
       where table_schema = 'public'
         and table_name = 'content_posts'
         and column_name = 'brand_id'
     ) then
    alter table public.content_posts
      add column brand_id uuid references public.brand_profiles (id) on delete set null;

    create index if not exists content_posts_brand_id_idx
      on public.content_posts (brand_id);
  end if;
end $$;

do $$
begin
  if to_regclass('public.content_plans') is not null then
    alter table public.content_posts
      add column if not exists content_plan_id uuid references public.content_plans (id) on delete cascade,
      add column if not exists plan_day integer check (plan_day is null or plan_day >= 1),
      add column if not exists plan_id uuid references public.content_plans (id) on delete set null;

    create index if not exists content_posts_content_plan_id_idx
      on public.content_posts (content_plan_id);

    create index if not exists content_posts_plan_id_idx
      on public.content_posts (plan_id);
  end if;
end $$;

do $$
begin
  if to_regclass('public.marketing_videos') is not null then
    alter table public.content_posts
      add column if not exists marketing_video_id uuid references public.marketing_videos (id) on delete set null;

    create index if not exists content_posts_marketing_video_id_idx
      on public.content_posts (marketing_video_id);
  end if;
end $$;
