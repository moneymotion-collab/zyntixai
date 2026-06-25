-- Public beta waitlist signups (written via service-role API)

create table if not exists public.beta_waitlist (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  email          text not null,
  business_type  text not null,
  created_at     timestamptz not null default now(),
  constraint beta_waitlist_name_not_empty check (char_length(trim(name)) >= 2),
  constraint beta_waitlist_email_not_empty check (char_length(trim(email)) >= 3),
  constraint beta_waitlist_business_type_not_empty check (char_length(trim(business_type)) >= 2)
);

create unique index if not exists beta_waitlist_email_lower_unique
  on public.beta_waitlist (lower(trim(email)));

create index if not exists beta_waitlist_created_at_idx
  on public.beta_waitlist (created_at desc);

alter table public.beta_waitlist enable row level security;

-- No client policies: inserts go through the server API using the service role.
