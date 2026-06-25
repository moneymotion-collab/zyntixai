-- Progress goals for member metric targets and milestones

create table if not exists public.progress_goals (
  id            uuid primary key default gen_random_uuid(),
  member_id     uuid not null references public.members (id) on delete cascade,
  metric        text not null,
  target_value  numeric not null,
  current_value numeric not null default 0,
  start_value   numeric not null default 0,
  deadline      timestamptz not null,
  status        text not null default 'active'
    check (status in ('active', 'completed', 'overdue')),
  created_at    timestamptz not null default now()
);

create index if not exists progress_goals_member_id_idx
  on public.progress_goals (member_id);

create index if not exists progress_goals_status_idx
  on public.progress_goals (status);

alter table public.progress_goals enable row level security;

drop policy if exists "progress_goals: select scoped" on public.progress_goals;
create policy "progress_goals: select scoped"
  on public.progress_goals
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or exists (
      select 1
      from public.members m
      where m.id = progress_goals.member_id
        and m.coach_id = auth.uid()
    )
    or exists (
      select 1
      from public.members m
      where m.id = progress_goals.member_id
        and (
          m.user_id = auth.uid()
          or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        )
    )
  );

drop policy if exists "progress_goals: insert scoped" on public.progress_goals;
create policy "progress_goals: insert scoped"
  on public.progress_goals
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'coach')
    )
    or exists (
      select 1
      from public.members m
      where m.id = member_id
        and m.coach_id = auth.uid()
    )
    or exists (
      select 1
      from public.members m
      where m.id = member_id
        and (
          m.user_id = auth.uid()
          or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        )
    )
  );

drop policy if exists "progress_goals: update scoped" on public.progress_goals;
create policy "progress_goals: update scoped"
  on public.progress_goals
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'coach')
    )
    or exists (
      select 1
      from public.members m
      where m.id = progress_goals.member_id
        and m.coach_id = auth.uid()
    )
    or exists (
      select 1
      from public.members m
      where m.id = progress_goals.member_id
        and (
          m.user_id = auth.uid()
          or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        )
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'coach')
    )
    or exists (
      select 1
      from public.members m
      where m.id = member_id
        and m.coach_id = auth.uid()
    )
    or exists (
      select 1
      from public.members m
      where m.id = member_id
        and (
          m.user_id = auth.uid()
          or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        )
    )
  );
