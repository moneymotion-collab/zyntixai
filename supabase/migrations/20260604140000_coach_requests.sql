-- Member requests to link with a coach (pending until coach approves)

create table if not exists public.coach_requests (
  id         uuid primary key default gen_random_uuid(),
  member_id  uuid not null references public.members (id) on delete cascade,
  coach_id   uuid not null references public.profiles (id) on delete cascade,
  status     text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coach_requests_member_id_idx on public.coach_requests (member_id);
create index if not exists coach_requests_coach_id_idx on public.coach_requests (coach_id);

create unique index if not exists coach_requests_pending_unique
  on public.coach_requests (member_id, coach_id)
  where status = 'pending';

drop trigger if exists coach_requests_updated_at on public.coach_requests;
create trigger coach_requests_updated_at
  before update on public.coach_requests
  for each row execute function public.set_updated_at();

alter table public.coach_requests enable row level security;

-- Members: create and read their own requests
drop policy if exists "coach_requests: member insert own" on public.coach_requests;
create policy "coach_requests: member insert own"
  on public.coach_requests
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.members m
      where m.id = member_id
        and lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
    and exists (
      select 1
      from public.profiles p
      where p.id = coach_id
        and p.role = 'coach'
    )
  );

drop policy if exists "coach_requests: member select own" on public.coach_requests;
create policy "coach_requests: member select own"
  on public.coach_requests
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.members m
      where m.id = coach_requests.member_id
        and lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
    or coach_id = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

-- Coaches: read and update requests addressed to them
drop policy if exists "coach_requests: coach update incoming" on public.coach_requests;
create policy "coach_requests: coach update incoming"
  on public.coach_requests
  for update
  to authenticated
  using (coach_id = auth.uid())
  with check (coach_id = auth.uid());
