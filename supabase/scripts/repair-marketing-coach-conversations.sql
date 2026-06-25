-- Repair: marketing_coach_conversations (M7 Marketing Coach chat history)
-- Run in Supabase Dashboard → SQL Editor when you see:
--   Could not find the table 'public.marketing_coach_conversations' in the schema cache
--
-- Or apply via CLI: supabase db push / supabase migration up

create table if not exists public.marketing_coach_conversations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  role       text not null check (role in ('user', 'assistant')),
  message    text not null,
  created_at timestamptz not null default now()
);

comment on table public.marketing_coach_conversations is
  'Marketing Coach chat log — one row per user/assistant message, scoped per auth user.';

create index if not exists marketing_coach_conversations_user_created_idx
  on public.marketing_coach_conversations (user_id, created_at);

create index if not exists marketing_coach_conversations_user_id_idx
  on public.marketing_coach_conversations (user_id);

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

grant select, insert, delete on public.marketing_coach_conversations to authenticated;

-- ── Verification (run after apply) ──
-- select to_regclass('public.marketing_coach_conversations');
-- select indexname from pg_indexes where tablename = 'marketing_coach_conversations';
-- select policyname, cmd from pg_policies where tablename = 'marketing_coach_conversations';
