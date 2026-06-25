-- C5 Coach Notes Pro

create table if not exists public.client_notes (
  id          uuid primary key default gen_random_uuid(),
  coach_id    uuid not null references auth.users (id) on delete cascade,
  member_id   uuid not null references public.members (id) on delete cascade,
  note_type   text not null default 'general',
  title       text not null,
  content     text not null,
  is_pinned   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint client_notes_note_type_check
    check (note_type in (
      'general',
      'injury',
      'mindset',
      'nutrition',
      'workout',
      'progress',
      'admin'
    ))
);

create index if not exists client_notes_coach_id_idx
  on public.client_notes (coach_id);

create index if not exists client_notes_member_id_idx
  on public.client_notes (member_id);

create index if not exists client_notes_pinned_created_idx
  on public.client_notes (member_id, is_pinned desc, created_at desc);

alter table public.client_notes enable row level security;

drop policy if exists "client_notes: select scoped" on public.client_notes;
create policy "client_notes: select scoped"
  on public.client_notes
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

drop policy if exists "client_notes: insert scoped" on public.client_notes;
create policy "client_notes: insert scoped"
  on public.client_notes
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

drop policy if exists "client_notes: update scoped" on public.client_notes;
create policy "client_notes: update scoped"
  on public.client_notes
  for update
  to authenticated
  using (coach_id = auth.uid())
  with check (coach_id = auth.uid());

drop policy if exists "client_notes: delete scoped" on public.client_notes;
create policy "client_notes: delete scoped"
  on public.client_notes
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
