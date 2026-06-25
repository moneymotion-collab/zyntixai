-- Default profile values: members get 7-day trial; coaches pending + trialing.

alter table public.profiles
  drop constraint if exists profiles_subscription_status_check;

update public.profiles
set subscription_status = 'trialing'
where subscription_status in ('trial', 'inactive');

alter table public.profiles
  add constraint profiles_subscription_status_check
  check (
    subscription_status is null
    or subscription_status in ('trialing', 'active', 'canceled', 'expired')
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
