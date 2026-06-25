-- C7 Automated Reminders

create table if not exists public.client_reminders (
  id             uuid primary key default gen_random_uuid(),
  coach_id       uuid not null references auth.users (id) on delete cascade,
  member_id      uuid not null references public.members (id) on delete cascade,
  reminder_type  text not null,
  title          text not null,
  message        text not null,
  due_date       date not null default current_date,
  priority       text not null default 'medium',
  status         text not null default 'open',
  is_automatic   boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint client_reminders_priority_check
    check (priority in ('high', 'medium', 'low')),
  constraint client_reminders_status_check
    check (status in ('open', 'done'))
);

create index if not exists client_reminders_coach_id_idx
  on public.client_reminders (coach_id);

create index if not exists client_reminders_member_id_idx
  on public.client_reminders (member_id);

create unique index if not exists client_reminders_open_type_unique
  on public.client_reminders (member_id, reminder_type)
  where status = 'open';

alter table public.client_reminders enable row level security;

drop policy if exists "client_reminders: select scoped" on public.client_reminders;
create policy "client_reminders: select scoped"
  on public.client_reminders
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

drop policy if exists "client_reminders: insert scoped" on public.client_reminders;
create policy "client_reminders: insert scoped"
  on public.client_reminders
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

drop policy if exists "client_reminders: update scoped" on public.client_reminders;
create policy "client_reminders: update scoped"
  on public.client_reminders
  for update
  to authenticated
  using (coach_id = auth.uid())
  with check (coach_id = auth.uid());

drop policy if exists "client_reminders: delete scoped" on public.client_reminders;
create policy "client_reminders: delete scoped"
  on public.client_reminders
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
