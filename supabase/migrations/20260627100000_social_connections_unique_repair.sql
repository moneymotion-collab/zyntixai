-- Repair drifted social_connections schemas missing the upsert target constraint.

do $$
begin
  if to_regclass('public.social_connections') is not null then
    delete from public.social_connections
    where id in (
      select id
      from (
        select
          id,
          row_number() over (
            partition by user_id, provider
            order by created_at asc nulls last, id asc
          ) as rn
        from public.social_connections
      ) duplicates
      where rn > 1
    );

    if not exists (
      select 1
      from pg_constraint
      where conrelid = 'public.social_connections'::regclass
        and contype in ('u', 'p')
        and pg_get_constraintdef(oid) like '%(user_id, provider)%'
    ) then
      alter table public.social_connections
        add constraint social_connections_user_id_provider_key unique (user_id, provider);
    end if;
  end if;
end $$;
