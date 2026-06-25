-- Role system: admin | coach | member + coach ownership columns

-- Normalize legacy role values
update public.profiles set role = 'coach' where role = 'trainer';
update public.profiles set role = 'member' where role = 'client';

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('admin', 'coach', 'member'));

alter table public.profiles
  alter column role set default 'member';

-- Coach ownership on members
alter table public.members
  add column if not exists coach_id uuid references public.profiles (id) on delete set null;

create index if not exists members_coach_id_idx on public.members (coach_id);

-- Coach ownership on workout plans
alter table public.workout_plans
  add column if not exists created_by uuid references public.profiles (id) on delete set null;

create index if not exists workout_plans_created_by_idx on public.workout_plans (created_by);

-- Secure profile bootstrap: only member/coach self-registration
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'member')
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.ensure_profile(
  p_email text default null,
  p_role text default 'member'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  v_role := coalesce(p_role, 'member');

  if v_role not in ('member', 'coach') then
    raise exception 'Invalid role for self-registration';
  end if;

  insert into public.profiles (id, email, role)
  values (
    auth.uid(),
    coalesce(p_email, auth.jwt() ->> 'email'),
    v_role
  )
  on conflict (id) do update
    set email = excluded.email,
        role = case
          when public.profiles.role = 'admin' then public.profiles.role
          else excluded.role
        end;
end;
$$;

revoke all on function public.ensure_profile(text, text) from public;
grant execute on function public.ensure_profile(text, text) to authenticated;
