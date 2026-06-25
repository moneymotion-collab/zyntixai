-- Align existing content_plans installs with plan_json column shape

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'content_plans'
      and column_name = 'plan'
  ) then
    alter table public.content_plans
      rename column plan to plan_json;
  end if;
end $$;

alter table public.content_plans
  drop column if exists created_by,
  drop column if exists updated_at;

drop trigger if exists content_plans_updated_at on public.content_plans;

drop index if exists content_plans_created_by_idx;
