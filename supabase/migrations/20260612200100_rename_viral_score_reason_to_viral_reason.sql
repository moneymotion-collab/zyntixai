-- Align column name with viral_reason (if earlier migration used viral_score_reason)

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'content_posts'
      and column_name = 'viral_score_reason'
  ) then
    alter table public.content_posts
      rename column viral_score_reason to viral_reason;
  end if;
end $$;
