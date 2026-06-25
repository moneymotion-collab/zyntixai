-- Run in Supabase SQL Editor if login still shows the paywall.
-- Grants a 7-day trial to members without active subscription.

update public.profiles
set
  trial_ends_at = now() + interval '7 days',
  subscription_status = 'trial'
where role = 'member'
  and coalesce(subscription_status, 'inactive') is distinct from 'active'
  and (
    trial_ends_at is null
    or coalesce(subscription_status, 'inactive') = 'inactive'
  );

update public.profiles
set subscription_status = 'trial'
where role = 'member'
  and trial_ends_at > now()
  and coalesce(subscription_status, 'inactive') in ('inactive', 'expired');

-- Coaches: auto-approve and grant trial (no admin gate)
update public.profiles
set
  coach_status = 'approved',
  trial_ends_at = coalesce(trial_ends_at, now() + interval '7 days'),
  subscription_status = 'trial'
where role = 'coach'
  and coach_status is distinct from 'rejected'
  and coalesce(subscription_status, 'inactive') is distinct from 'active';
