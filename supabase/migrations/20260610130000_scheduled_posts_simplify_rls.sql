-- Simpler RLS: authenticated users insert own rows (API checks coach/admin)

drop policy if exists "scheduled_posts: insert coach admin" on public.scheduled_posts;
drop policy if exists "scheduled_posts: insert own" on public.scheduled_posts;

create policy "scheduled_posts: insert own"
  on public.scheduled_posts
  for insert
  to authenticated
  with check (user_id::text = auth.uid()::text);
