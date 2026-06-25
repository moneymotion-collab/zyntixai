alter table public.content_posts
  add column if not exists viral_reason text not null default '';

alter table public.content_posts
  add column if not exists viral_status text not null default '';

alter table public.content_posts
  add column if not exists optimized_hashtags text;

alter table public.content_posts
  add column if not exists retry_count integer not null default 0;

do $$
begin
  if not exists (
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
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'content_posts'
      and column_name = 'viral_score_reason'
  ) then
    update public.content_posts
    set viral_reason = viral_score_reason
    where viral_reason = ''
      and viral_score_reason <> '';

    alter table public.content_posts
      drop column viral_score_reason;
  end if;
end $$;

NOTIFY pgrst, 'reload schema';
