-- M7 Marketing Coach: persisted chat messages per user

create table if not exists public.marketing_coach_conversations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  role       text not null check (role in ('user', 'assistant')),
  message    text not null,
  created_at timestamptz not null default now()
);

create index if not exists marketing_coach_conversations_user_created_idx
  on public.marketing_coach_conversations (user_id, created_at);

alter table public.marketing_coach_conversations enable row level security;

drop policy if exists "marketing_coach_conversations: select own" on public.marketing_coach_conversations;
create policy "marketing_coach_conversations: select own"
  on public.marketing_coach_conversations
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "marketing_coach_conversations: insert own" on public.marketing_coach_conversations;
create policy "marketing_coach_conversations: insert own"
  on public.marketing_coach_conversations
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "marketing_coach_conversations: delete own" on public.marketing_coach_conversations;
create policy "marketing_coach_conversations: delete own"
  on public.marketing_coach_conversations
  for delete
  to authenticated
  using (user_id = auth.uid());
