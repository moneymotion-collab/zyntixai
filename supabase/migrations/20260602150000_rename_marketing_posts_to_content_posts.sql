-- Align table name with /api/content/* routes (idempotent).

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'marketing_posts'
  ) and not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'content_posts'
  ) then
    alter table public.marketing_posts rename to content_posts;
  end if;
end;
$$;
