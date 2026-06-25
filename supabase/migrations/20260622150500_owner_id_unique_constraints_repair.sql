-- Add missing unique constraints for upsert targets on drifted remote schemas.

do $$
begin
  if to_regclass('public.marketing_settings') is not null then
    delete from public.marketing_settings
    where id in (
      select id
      from (
        select
          id,
          row_number() over (
            partition by owner_id
            order by created_at asc nulls last, id asc
          ) as rn
        from public.marketing_settings
      ) duplicates
      where rn > 1
    );

    if not exists (
      select 1
      from pg_constraint
      where conname = 'marketing_settings_owner_id_key'
        and conrelid = 'public.marketing_settings'::regclass
    ) then
      alter table public.marketing_settings
        add constraint marketing_settings_owner_id_key unique (owner_id);
    end if;
  end if;
end $$;

create unique index if not exists analytics_post_id_unique_idx
  on public.analytics (post_id)
  where post_id is not null;
