-- Link coach-created members rows to auth accounts (same email → same person).

alter table public.members
  add column if not exists user_id uuid references auth.users (id) on delete set null;

create index if not exists members_user_id_idx on public.members (user_id);

create unique index if not exists members_user_id_unique
  on public.members (user_id)
  where user_id is not null;

-- Backfill existing matches via profiles (id = auth.users.id).
update public.members m
set user_id = p.id
from public.profiles p
where m.user_id is null
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

  v_email := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
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

-- Scoped read: own account, coach roster, or admin.
drop policy if exists "dev: public read members" on public.members;

drop policy if exists "members: select scoped" on public.members;
create policy "members: select scoped"
  on public.members
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or lower(trim(email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
    or coach_id = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

drop policy if exists "members: update own link" on public.members;
create policy "members: update own link"
  on public.members
  for update
  to authenticated
  using (
    user_id = auth.uid()
    or lower(trim(email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
  )
  with check (
    user_id = auth.uid()
    or lower(trim(email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
  );
