-- Repair member trial access: backfill missing trials and align subscription_status

update public.profiles
set
  trial_ends_at = now() + interval '7 days',
  subscription_status = 'trial'
where role = 'member'
  and trial_ends_at is null
  and coalesce(subscription_status, 'inactive') is distinct from 'active';

update public.profiles
set subscription_status = 'trial'
where role = 'member'
  and trial_ends_at is not null
  and trial_ends_at > now()
  and coalesce(subscription_status, 'inactive') in ('inactive', 'expired');

update public.profiles
set subscription_status = 'expired'
where role = 'member'
  and trial_ends_at is not null
  and trial_ends_at <= now()
  and coalesce(subscription_status, 'inactive') = 'trial';

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
    case when v_role = 'member' then 'trial' else 'inactive' end,
    case when v_role = 'coach' then 'pending' else null end
  )
  on conflict (id) do update
    set email = excluded.email,
        role = case
          when public.profiles.role = 'admin' then public.profiles.role
          else excluded.role
        end,
        trial_ends_at = case
          when public.profiles.subscription_status = 'active'
            then public.profiles.trial_ends_at
          when public.profiles.role = 'member'
            and public.profiles.trial_ends_at is null
            then now() + interval '7 days'
          when public.profiles.role = 'coach'
            and public.profiles.coach_status = 'approved'
            and public.profiles.trial_ends_at is null
            and public.profiles.subscription_status is distinct from 'active'
            then now() + interval '7 days'
          else public.profiles.trial_ends_at
        end,
        subscription_status = case
          when public.profiles.subscription_status = 'active'
            then 'active'
          when public.profiles.role = 'member'
            and public.profiles.trial_ends_at is not null
            and public.profiles.trial_ends_at <= now()
            then 'expired'
          when public.profiles.role = 'member'
            and (
              public.profiles.trial_ends_at is null
              or public.profiles.trial_ends_at > now()
            )
            then 'trial'
          when public.profiles.subscription_status is null
            then 'inactive'
          else public.profiles.subscription_status
        end,
        coach_status = case
          when excluded.role = 'coach' and public.profiles.coach_status is null
            then 'pending'
          else public.profiles.coach_status
        end;
end;
$$;
