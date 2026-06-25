create table if not exists public.client_checkins (
  id             uuid primary key default gen_random_uuid(),
  coach_id       uuid not null references auth.users (id) on delete cascade,
  member_id      uuid references public.members (id) on delete set null,
  member_name    text not null,
  weight         numeric,
  energy         integer check (energy is null or (energy >= 1 and energy <= 10)),
  sleep          integer check (sleep is null or (sleep >= 1 and sleep <= 10)),
  motivation     integer check (motivation is null or (motivation >= 1 and motivation <= 10)),
  checkin_date   date not null,
  created_at     timestamptz not null default now()
);

create index if not exists client_checkins_coach_id_idx
  on public.client_checkins (coach_id);

create index if not exists client_checkins_checkin_date_idx
  on public.client_checkins (checkin_date desc);

create index if not exists client_checkins_member_id_idx
  on public.client_checkins (member_id);

alter table public.client_checkins enable row level security;

drop policy if exists "client_checkins: select scoped" on public.client_checkins;
create policy "client_checkins: select scoped"
  on public.client_checkins
  for select
  to authenticated
  using (
    coach_id = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

drop policy if exists "client_checkins: insert scoped" on public.client_checkins;
create policy "client_checkins: insert scoped"
  on public.client_checkins
  for insert
  to authenticated
  with check (
    coach_id = auth.uid()
    and (
      exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role in ('admin', 'coach')
      )
    )
  );

drop policy if exists "client_checkins: update scoped" on public.client_checkins;
create policy "client_checkins: update scoped"
  on public.client_checkins
  for update
  to authenticated
  using (coach_id = auth.uid())
  with check (coach_id = auth.uid());

drop policy if exists "client_checkins: delete scoped" on public.client_checkins;
create policy "client_checkins: delete scoped"
  on public.client_checkins
  for delete
  to authenticated
  using (
    coach_id = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );
