-- Stripe billing fields on brand_profiles

alter table public.brand_profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists plan text not null default 'free';
