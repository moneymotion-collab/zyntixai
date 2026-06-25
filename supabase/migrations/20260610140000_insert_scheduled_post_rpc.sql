-- Insert scheduled_posts via security definer (fixes RLS for Save to Calendar)

create or replace function public.insert_scheduled_post(
  p_platform text,
  p_content text,
  p_hook text,
  p_post_type text,
  p_scheduled_date timestamptz default null
)
returns public.scheduled_posts
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.scheduled_posts;
  caller uuid;
begin
  caller := auth.uid();

  if caller is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = caller
      and p.role in ('admin', 'coach', 'trainer')
  ) then
    raise exception 'Only coaches and admins can schedule posts';
  end if;

  insert into public.scheduled_posts (
    user_id,
    platform,
    content,
    hook,
    post_type,
    scheduled_date
  )
  values (
    caller,
    coalesce(p_platform, ''),
    coalesce(p_content, ''),
    coalesce(p_hook, ''),
    coalesce(p_post_type, ''),
    p_scheduled_date
  )
  returning * into result;

  return result;
end;
$$;

revoke all on function public.insert_scheduled_post(text, text, text, text, timestamptz) from public;
grant execute on function public.insert_scheduled_post(text, text, text, text, timestamptz) to authenticated;
