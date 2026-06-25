-- Platform coach approval on profiles (separate from member coach_requests)

alter table public.profiles
  add column if not exists coach_status text;

alter table public.profiles
  drop constraint if exists profiles_coach_status_check;

update public.profiles
set coach_status = null
where coach_status = 'none';

update public.profiles
set coach_status = 'approved'
where role = 'coach'
  and coach_status is null;

alter table public.profiles
  add constraint profiles_coach_status_check
  check (
    coach_status is null
    or coach_status in ('pending', 'approved', 'rejected')
  );

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

  insert into public.profiles (id, email, role, trial_ends_at, subscription_status, coach_status)
  values (
    auth.uid(),
    coalesce(p_email, auth.jwt() ->> 'email'),
    v_role,
    case when v_role = 'member' then now() + interval '7 days' else null end,
    case when v_role = 'coach' then 'trialing' else null end,
    case when v_role = 'coach' then 'pending' else null end
  )
  on conflict (id) do update
    set email = excluded.email,
        role = case
          when public.profiles.role = 'admin' then public.profiles.role
          else excluded.role
        end,
        trial_ends_at = case
          when excluded.role = 'member' and public.profiles.trial_ends_at is null
            then now() + interval '7 days'
          else public.profiles.trial_ends_at
        end,
        subscription_status = case
          when excluded.role = 'coach'
            and public.profiles.subscription_status is null
            then 'trialing'
          else public.profiles.subscription_status
        end,
        coach_status = case
          when excluded.role = 'coach' and public.profiles.coach_status is null
            then 'pending'
          else public.profiles.coach_status
        end;
end;
$$;
