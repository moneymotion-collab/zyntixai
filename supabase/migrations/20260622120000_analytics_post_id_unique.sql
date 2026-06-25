-- One analytics row per published content post (post_id may be null after post delete).

delete from public.analytics
where id in (
  select id
  from (
    select
      id,
      row_number() over (
        partition by post_id
        order by created_at asc
      ) as rn
    from public.analytics
    where post_id is not null
  ) duplicates
  where rn > 1
);

create unique index if not exists analytics_post_id_unique_idx
  on public.analytics (post_id)
  where post_id is not null;
