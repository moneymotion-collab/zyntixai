-- A1 Profiles billing security: block user self-service writes to billing/privilege columns.

alter table public.profiles
  add column if not exists billing_plan text;

-- ---------------------------------------------------------------------------
-- 1) Guard trigger: only service_role may mutate sensitive profile columns
-- ---------------------------------------------------------------------------
create or replace function public.profiles_guard_sensitive_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  jwt_role text;
  billing_repair text;
begin
  jwt_role := coalesce(
    current_setting('request.jwt.claim.role', true),
    auth.jwt() ->> 'role',
    ''
  );
  billing_repair := coalesce(current_setting('app.profile_billing_repair', true), '');

  -- Service role (webhooks, admin jobs) may change anything
  if jwt_role = 'service_role' then
    return new;
  end if;

  -- System paths (e.g. handle_new_user) run without an authenticated JWT
  if tg_op = 'INSERT' and auth.uid() is null then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.subscription_status := null;
    new.trial_ends_at := null;
    new.stripe_customer_id := null;
    new.stripe_subscription_id := null;
    new.billing_plan := null;
    new.role := coalesce(new.role, 'member');
    if new.role not in ('member', 'coach') then
      new.role := 'member';
    end if;
    new.coach_status := case when new.role = 'coach' then 'pending' else null end;
    return new;
  end if;

  -- UPDATE: allow status-only repair RPC; freeze everything else for self-service
  if billing_repair = '1' then
    new.trial_ends_at := old.trial_ends_at;
    new.stripe_customer_id := old.stripe_customer_id;
    new.stripe_subscription_id := old.stripe_subscription_id;
    new.billing_plan := old.billing_plan;
    new.role := old.role;
    new.coach_status := old.coach_status;
    return new;
  end if;

  new.subscription_status := old.subscription_status;
  new.trial_ends_at := old.trial_ends_at;
  new.stripe_customer_id := old.stripe_customer_id;
  new.stripe_subscription_id := old.stripe_subscription_id;
  new.billing_plan := old.billing_plan;
  new.role := old.role;
  new.coach_status := old.coach_status;
  return new;
end;
$$;

drop trigger if exists profiles_guard_sensitive_columns on public.profiles;
create trigger profiles_guard_sensitive_columns
  before insert or update on public.profiles
  for each row
  execute function public.profiles_guard_sensitive_columns();

-- ---------------------------------------------------------------------------
-- 2) Narrow self-service RLS policies
-- ---------------------------------------------------------------------------
drop policy if exists "profiles: update own row" on public.profiles;
create policy "profiles: update own email"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles: insert own row" on public.profiles;
create policy "profiles: insert own row"
  on public.profiles
  for insert
  to authenticated
  with check (
    auth.uid() = id
    and role in ('member', 'coach')
    and subscription_status is null
    and trial_ends_at is null
    and stripe_customer_id is null
    and stripe_subscription_id is null
    and billing_plan is null
  );

-- ---------------------------------------------------------------------------
-- 3) ensure_profile: email + role only; billing set by signup trigger / service role
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- 4) Status-only repair RPC (trial <-> expired corruption); never grants active
-- ---------------------------------------------------------------------------
create or replace function public.repair_profile_subscription_status()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles%rowtype;
  v_new_status text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select *
  into v_profile
  from public.profiles
  where id = auth.uid()
  for update;

  if not found then
    return;
  end if;

  if v_profile.role = 'admin' then
    return;
  end if;

  if v_profile.subscription_status in ('active', 'past_due', 'cancelled') then
    return;
  end if;

  v_new_status := null;

  if v_profile.trial_ends_at is not null
    and v_profile.trial_ends_at > now()
    and v_profile.subscription_status in ('expired', null)
  then
    v_new_status := 'trial';
  elsif v_profile.trial_ends_at is not null
    and v_profile.trial_ends_at <= now()
    and v_profile.subscription_status in ('trial', null)
  then
    v_new_status := 'expired';
  elsif v_profile.trial_ends_at is null
    and v_profile.subscription_status = 'trial'
  then
    v_new_status := 'expired';
  end if;

  if v_new_status is null then
    return;
  end if;

  perform set_config('app.profile_billing_repair', '1', true);

  update public.profiles
  set subscription_status = v_new_status
  where id = auth.uid();
end;
$$;

revoke all on function public.repair_profile_subscription_status() from public;
grant execute on function public.repair_profile_subscription_status() to authenticated;

-- ---------------------------------------------------------------------------
-- 5) Service-role-only billing updater (webhooks / admin jobs)
-- ---------------------------------------------------------------------------
drop function if exists public.set_profile_billing(uuid, text, text, text, text, timestamptz);
drop function if exists public.set_profile_billing(uuid, text, text, text, text);
drop function if exists public.set_profile_billing(uuid, text);

create or replace function public.set_profile_billing(
  p_user_id uuid,
  p_subscription_status text,
  p_stripe_customer_id text default null,
  p_stripe_subscription_id text default null,
  p_billing_plan text default null,
  p_trial_ends_at timestamptz default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(
    current_setting('request.jwt.claim.role', true),
    auth.jwt() ->> 'role',
    ''
  ) <> 'service_role' then
    raise exception 'Forbidden';
  end if;

  update public.profiles
  set
    subscription_status = p_subscription_status,
    stripe_customer_id = coalesce(p_stripe_customer_id, stripe_customer_id),
    stripe_subscription_id = coalesce(p_stripe_subscription_id, stripe_subscription_id),
    billing_plan = coalesce(p_billing_plan, billing_plan),
    trial_ends_at = coalesce(p_trial_ends_at, trial_ends_at)
  where id = p_user_id;
end;
$$;

revoke all on function public.set_profile_billing(uuid, text, text, text, text, timestamptz) from public;
grant execute on function public.set_profile_billing(uuid, text, text, text, text, timestamptz) to service_role;
