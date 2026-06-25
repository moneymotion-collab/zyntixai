-- AI credit tracking per brand

alter table public.brand_profiles
  add column if not exists ai_credits integer not null default 100
    check (ai_credits >= 0),
  add column if not exists credits_used integer not null default 0
    check (credits_used >= 0);

create table if not exists public.ai_usage_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  brand_id     uuid not null references public.brand_profiles (id) on delete cascade,
  endpoint     text not null default '',
  credits_used integer not null check (credits_used > 0),
  created_at   timestamptz not null default now()
);

create index if not exists ai_usage_logs_brand_id_idx
  on public.ai_usage_logs (brand_id);

create index if not exists ai_usage_logs_user_id_idx
  on public.ai_usage_logs (user_id);

alter table public.ai_usage_logs enable row level security;

drop policy if exists "ai_usage_logs: select own" on public.ai_usage_logs;
create policy "ai_usage_logs: select own"
  on public.ai_usage_logs
  for select
  to authenticated
  using (user_id = auth.uid());

create or replace function public.consume_brand_credits(
  p_brand_id uuid,
  p_amount integer,
  p_endpoint text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if p_amount <= 0 then
    raise exception 'Credit amount must be positive';
  end if;

  update public.brand_profiles
  set credits_used = credits_used + p_amount
  where id = p_brand_id
    and owner_id = auth.uid()
    and (ai_credits - credits_used) >= p_amount
  returning owner_id into v_owner_id;

  if v_owner_id is null then
    if not exists (
      select 1
      from public.brand_profiles
      where id = p_brand_id
        and owner_id = auth.uid()
    ) then
      raise exception 'Brand not found';
    end if;

    raise exception 'Not enough AI credits';
  end if;

  insert into public.ai_usage_logs (user_id, brand_id, endpoint, credits_used)
  values (v_owner_id, p_brand_id, coalesce(p_endpoint, ''), p_amount);

  return true;
end;
$$;

revoke all on function public.consume_brand_credits(uuid, integer, text) from public;
grant execute on function public.consume_brand_credits(uuid, integer, text) to authenticated;
