-- QUICK FIX (dev/demo): run this one line in Supabase SQL Editor
alter table public.scheduled_posts disable row level security;

-- OR add columns if missing:
alter table public.scheduled_posts add column if not exists post_type text default '';
alter table public.scheduled_posts add column if not exists scheduled_date timestamptz;

-- OR production-safe: allow authenticated inserts on own rows
-- alter table public.scheduled_posts enable row level security;
-- drop policy if exists "scheduled_posts: insert own" on public.scheduled_posts;
-- create policy "scheduled_posts: insert own"
--   on public.scheduled_posts for insert to authenticated
--   with check (user_id::text = auth.uid()::text);
