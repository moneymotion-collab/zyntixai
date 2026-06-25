-- C6 Habit Tracker (required for C7 reminders and C8 timeline)

create table if not exists public.client_habits (
  id          uuid primary key default gen_random_uuid(),
  coach_id    uuid not null references auth.users (id) on delete cascade,
  member_id   uuid not null references public.members (id) on delete cascade,
  habit_name  text not null,
  habit_type  text not null default 'general',
  logged_at   date not null default current_date,
  notes       text,
  created_at  timestamptz not null default now(),
  constraint client_habits_habit_type_check
    check (habit_type in ('general', 'nutrition', 'sleep', 'movement', 'mindset', 'recovery', 'other'))
);

alter table public.client_habits
  add column if not exists logged_at date not null default current_date;

create index if not exists client_habits_coach_id_idx
  on public.client_habits (coach_id);

create index if not exists client_habits_member_id_idx
  on public.client_habits (member_id);

create index if not exists client_habits_logged_at_idx
  on public.client_habits (member_id, logged_at desc);

alter table public.client_habits enable row level security;

drop policy if exists "client_habits: select scoped" on public.client_habits;
create policy "client_habits: select scoped"
  on public.client_habits
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

drop policy if exists "client_habits: insert scoped" on public.client_habits;
create policy "client_habits: insert scoped"
  on public.client_habits
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

drop policy if exists "client_habits: update scoped" on public.client_habits;
create policy "client_habits: update scoped"
  on public.client_habits
  for update
  to authenticated
  using (coach_id = auth.uid())
  with check (coach_id = auth.uid());

drop policy if exists "client_habits: delete scoped" on public.client_habits;
create policy "client_habits: delete scoped"
  on public.client_habits
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
