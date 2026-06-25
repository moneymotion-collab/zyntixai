create table if not exists public.client_goals (
  id            uuid primary key default gen_random_uuid(),
  coach_id      uuid not null references auth.users (id) on delete cascade,
  member_id     uuid not null references public.members (id) on delete cascade,
  member_name   text not null,
  title         text not null,
  goal_type     text not null
    check (goal_type in (
      'weight_loss',
      'weight_gain',
      'muscle_gain',
      'body_fat_reduction',
      'custom'
    )),
  start_value   numeric not null,
  target_value  numeric not null,
  current_value numeric not null,
  target_date   date not null,
  status        text not null default 'on_track'
    check (status in ('on_track', 'behind_schedule', 'completed')),
  created_at    timestamptz not null default now()
);

create index if not exists client_goals_coach_id_idx
  on public.client_goals (coach_id);

create index if not exists client_goals_member_id_idx
  on public.client_goals (member_id);

create index if not exists client_goals_target_date_idx
  on public.client_goals (target_date);

alter table public.client_goals enable row level security;

drop policy if exists "client_goals: select scoped" on public.client_goals;
create policy "client_goals: select scoped"
  on public.client_goals
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

drop policy if exists "client_goals: insert scoped" on public.client_goals;
create policy "client_goals: insert scoped"
  on public.client_goals
  for insert
  to authenticated
  with check (
    coach_id = auth.uid()
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'coach')
    )
  );

drop policy if exists "client_goals: update scoped" on public.client_goals;
create policy "client_goals: update scoped"
  on public.client_goals
  for update
  to authenticated
  using (coach_id = auth.uid())
  with check (coach_id = auth.uid());

drop policy if exists "client_goals: delete scoped" on public.client_goals;
create policy "client_goals: delete scoped"
  on public.client_goals
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
