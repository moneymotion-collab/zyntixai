-- Prevent ensure_profile from granting a new trial after natural expiry.
-- Trial extension must be explicit (admin / dedicated API), not automatic repair.

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

  insert into public.profiles (
    id,
    email,
    role,
    trial_ends_at,
    subscription_status,
    coach_status
  )
  values (
    auth.uid(),
    coalesce(p_email, auth.jwt() ->> 'email'),
    v_role,
    now() + interval '7 days',
    'trial',
    case when v_role = 'coach' then 'approved' else null end
  )
  on conflict (id) do update
    set email = excluded.email,
        role = case
          when public.profiles.role = 'admin' then public.profiles.role
          else excluded.role
        end,
        trial_ends_at = case
          when public.profiles.subscription_status in ('active', 'past_due', 'cancelled', 'expired')
            then public.profiles.trial_ends_at
          when public.profiles.trial_ends_at is null
            then now() + interval '7 days'
          else public.profiles.trial_ends_at
        end,
        subscription_status = case
          when public.profiles.subscription_status in ('active', 'past_due', 'cancelled')
            then public.profiles.subscription_status
          when public.profiles.trial_ends_at is not null
            and public.profiles.trial_ends_at <= now()
            then 'expired'
          when public.profiles.trial_ends_at is not null
            and public.profiles.trial_ends_at > now()
            then 'trial'
          else coalesce(public.profiles.subscription_status, 'trial')
        end,
        coach_status = case
          when public.profiles.coach_status = 'rejected'
            then 'rejected'
          when excluded.role = 'coach'
            then 'approved'
          else public.profiles.coach_status
        end;
end;
$$;
