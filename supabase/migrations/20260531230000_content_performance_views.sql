-- Rename reach → views on content_performance (if upgrading from reach column)

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'content_performance'
      and column_name = 'reach'
  ) then
    alter table public.content_performance
      rename column reach to views;
  end if;
end $$;
