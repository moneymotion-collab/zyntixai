-- Store selected Stripe plan tier on profiles (basic | pro | business).

alter table public.profiles
  add column if not exists billing_plan text;

alter table public.profiles
  drop constraint if exists profiles_billing_plan_check;

alter table public.profiles
  add constraint profiles_billing_plan_check
  check (
    billing_plan is null
    or billing_plan in ('basic', 'pro', 'business')
  );
