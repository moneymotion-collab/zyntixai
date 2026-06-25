-- P1.4: Allow linked members to insert/update their own client_checkins rows.

drop policy if exists "client_checkins: insert scoped" on public.client_checkins;
create policy "client_checkins: insert scoped"
  on public.client_checkins
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      coach_id = auth.uid()
      and exists (
        select 1
        from public.members m
        where m.id = member_id
          and m.coach_id = auth.uid()
      )
    )
    or exists (
      select 1
      from public.members m
      where m.id = member_id
        and m.coach_id = coach_id
        and (
          m.user_id = auth.uid()
          or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        )
    )
  );

drop policy if exists "client_checkins: update scoped" on public.client_checkins;
create policy "client_checkins: update scoped"
  on public.client_checkins
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      coach_id = auth.uid()
      and exists (
        select 1
        from public.members m
        where m.id = client_checkins.member_id
          and m.coach_id = auth.uid()
      )
    )
    or exists (
      select 1
      from public.members m
      where m.id = client_checkins.member_id
        and (
          m.user_id = auth.uid()
          or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        )
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      coach_id = auth.uid()
      and exists (
        select 1
        from public.members m
        where m.id = member_id
          and m.coach_id = auth.uid()
      )
    )
    or exists (
      select 1
      from public.members m
      where m.id = member_id
        and m.coach_id = coach_id
        and (
          m.user_id = auth.uid()
          or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        )
    )
  );
