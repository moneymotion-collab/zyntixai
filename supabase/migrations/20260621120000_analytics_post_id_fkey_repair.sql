-- Repair analytics.post_id → content_posts FK when missing from remote schema.

do $$
begin
  if to_regclass('public.analytics') is not null
     and to_regclass('public.content_posts') is not null
     and exists (
       select 1
       from information_schema.columns
       where table_schema = 'public'
         and table_name = 'analytics'
         and column_name = 'post_id'
     )
     and not exists (
       select 1
       from pg_constraint
       where conname = 'analytics_post_id_fkey'
         and conrelid = 'public.analytics'::regclass
     ) then
    update public.analytics a
    set post_id = null
    where a.post_id is not null
      and not exists (
        select 1
        from public.content_posts cp
        where cp.id = a.post_id
      );

    alter table public.analytics
      add constraint analytics_post_id_fkey
      foreign key (post_id) references public.content_posts (id) on delete set null;
  end if;
end $$;
