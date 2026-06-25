-- Auto-link members rows to auth accounts when emails match (profile signup or coach refresh).

create or replace function public.link_members_for_profile(
  p_user_id uuid,
  p_email text,
  p_role text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
begin
  if p_user_id is null or p_role is distinct from 'member' then
    return;
  end if;

  v_email := lower(trim(coalesce(p_email, '')));
  if v_email = '' then
    return;
  end if;

  update public.members
  set
    user_id = p_user_id,
    email = v_email
  where user_id is null
    and lower(trim(email)) = v_email;
end;
$$;

create or replace function public.link_member_on_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.link_members_for_profile(new.id, new.email, new.role);
  return new;
end;
$$;

drop trigger if exists profiles_link_member on public.profiles;
create trigger profiles_link_member
  after insert or update of email, role
  on public.profiles
  for each row
  execute function public.link_member_on_profile();

-- Backfill all existing member profiles → members rows
update public.members m
set
  user_id = p.id,
  email = lower(trim(p.email))
from public.profiles p
where m.user_id is null
  and p.role = 'member'
  and lower(trim(m.email)) = lower(trim(coalesce(p.email, '')));

create or replace function public.link_member_account()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_email text;
  v_member_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select lower(trim(coalesce(email, auth.jwt() ->> 'email', '')))
  into v_email
  from public.profiles
  where id = v_user_id;

  if v_email is null or v_email = '' then
    v_email := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  end if;

  if v_email = '' then
    return null;
  end if;

  select m.id
  into v_member_id
  from public.members m
  where lower(trim(m.email)) = v_email
  order by m.created_at asc nulls last
  limit 1;

  if v_member_id is null then
    return null;
  end if;

  update public.members
  set
    user_id = v_user_id,
    email = v_email
  where id = v_member_id
    and (user_id is null or user_id = v_user_id);

  return v_member_id;
end;
$$;

revoke all on function public.link_member_account() from public;
grant execute on function public.link_member_account() to authenticated;

-- Coach (or admin) refreshes links when loading the Members page.
create or replace function public.refresh_coach_member_links()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_is_admin boolean;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ) into v_is_admin;

  if v_is_admin then
    update public.members m
    set
      user_id = p.id,
      email = lower(trim(p.email))
    from public.profiles p
    where m.user_id is null
      and p.role = 'member'
      and lower(trim(m.email)) = lower(trim(coalesce(p.email, '')));
  else
    update public.members m
    set
      user_id = p.id,
      email = lower(trim(p.email))
    from public.profiles p
    where m.coach_id = auth.uid()
      and m.user_id is null
      and p.role = 'member'
      and lower(trim(m.email)) = lower(trim(coalesce(p.email, '')));
  end if;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.refresh_coach_member_links() from public;
grant execute on function public.refresh_coach_member_links() to authenticated;
