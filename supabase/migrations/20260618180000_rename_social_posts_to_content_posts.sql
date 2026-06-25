-- Legacy rename: some environments used social_posts before content_posts

do $$
begin
  if to_regclass('public.social_posts') is not null
     and to_regclass('public.content_posts') is null then
    alter table public.social_posts rename to content_posts;
  end if;
end $$;
