-- Match scheduled_posts: authenticated users insert own rows (API checks coach/admin)

drop policy if exists "content_ideas: insert coach admin" on public.content_ideas;

create policy "content_ideas: insert own"
  on public.content_ideas
  for insert
  to authenticated
  with check (user_id::text = auth.uid()::text);
