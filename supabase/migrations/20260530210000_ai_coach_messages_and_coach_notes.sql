-- AI Coach messages (per thread) + coach notes

create table if not exists public.ai_coach_messages (
  id            uuid primary key default gen_random_uuid(),
  thread_id     uuid not null references public.ai_coach_threads(id) on delete cascade,
  role          text not null check (role in ('user', 'assistant')),
  content       text not null,
  content_type  text not null default 'general'
    check (content_type in ('general', 'workout', 'nutrition', 'progress')),
  created_at    timestamptz not null default now()
);

create index if not exists ai_coach_messages_thread_created_idx
  on public.ai_coach_messages (thread_id, created_at asc);

create table if not exists public.coach_notes (
  id                 uuid primary key default gen_random_uuid(),
  member_id          uuid not null references public.members(id) on delete cascade,
  coach_id           uuid references public.profiles(id) on delete set null,
  content            text not null,
  source_message_id  uuid references public.ai_coach_messages(id) on delete set null,
  created_at         timestamptz not null default now()
);

create index if not exists coach_notes_member_id_idx on public.coach_notes (member_id);
create index if not exists coach_notes_coach_id_idx on public.coach_notes (coach_id);

-- Backfill assistant messages from existing thread previews
insert into public.ai_coach_messages (thread_id, role, content, content_type)
select t.id, 'assistant', t.last_message, 'general'
from public.ai_coach_threads t
where t.last_message is not null
  and not exists (
    select 1 from public.ai_coach_messages m where m.thread_id = t.id
  );

alter table public.ai_coach_messages enable row level security;
alter table public.coach_notes enable row level security;

-- ai_coach_messages: same member scope as threads via thread join
drop policy if exists "ai_coach_messages: select scoped" on public.ai_coach_messages;
create policy "ai_coach_messages: select scoped"
  on public.ai_coach_messages for select to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
    or exists (
      select 1
      from public.ai_coach_threads t
      join public.members m on m.id = t.member_id
      where t.id = ai_coach_messages.thread_id
        and m.coach_id = auth.uid()
    )
  );

drop policy if exists "ai_coach_messages: insert scoped" on public.ai_coach_messages;
create policy "ai_coach_messages: insert scoped"
  on public.ai_coach_messages for insert to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
    or exists (
      select 1
      from public.ai_coach_threads t
      join public.members m on m.id = t.member_id
      where t.id = thread_id
        and m.coach_id = auth.uid()
    )
  );

-- coach_notes
drop policy if exists "coach_notes: select scoped" on public.coach_notes;
create policy "coach_notes: select scoped"
  on public.coach_notes for select to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
    or exists (
      select 1 from public.members m
      where m.id = coach_notes.member_id and m.coach_id = auth.uid()
    )
  );

drop policy if exists "coach_notes: insert scoped" on public.coach_notes;
create policy "coach_notes: insert scoped"
  on public.coach_notes for insert to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
    or exists (
      select 1 from public.members m
      where m.id = member_id and m.coach_id = auth.uid()
    )
  );

-- sessions write access for coaches/admins
drop policy if exists "sessions: insert authenticated" on public.sessions;
create policy "sessions: insert authenticated"
  on public.sessions for insert to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'coach')
    )
  );

drop policy if exists "sessions: update authenticated" on public.sessions;
create policy "sessions: update authenticated"
  on public.sessions for update to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'coach')
    )
  );
