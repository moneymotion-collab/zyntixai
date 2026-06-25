-- Coach-scoped read/write for ai_coach_threads

drop policy if exists "dev: public read ai_coach_threads" on public.ai_coach_threads;

drop policy if exists "ai_coach_threads: select scoped" on public.ai_coach_threads;
create policy "ai_coach_threads: select scoped"
  on public.ai_coach_threads
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or exists (
      select 1
      from public.members m
      where m.id = ai_coach_threads.member_id
        and m.coach_id = auth.uid()
    )
  );

drop policy if exists "ai_coach_threads: insert scoped" on public.ai_coach_threads;
create policy "ai_coach_threads: insert scoped"
  on public.ai_coach_threads
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or exists (
      select 1
      from public.members m
      where m.id = member_id
        and m.coach_id = auth.uid()
    )
  );

drop policy if exists "ai_coach_threads: update scoped" on public.ai_coach_threads;
create policy "ai_coach_threads: update scoped"
  on public.ai_coach_threads
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or exists (
      select 1
      from public.members m
      where m.id = ai_coach_threads.member_id
        and m.coach_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or exists (
      select 1
      from public.members m
      where m.id = member_id
        and m.coach_id = auth.uid()
    )
  );
