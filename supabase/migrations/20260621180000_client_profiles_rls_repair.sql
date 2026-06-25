-- Repair client_profiles RLS: allow coaches (by role) and ensure policies exist.

alter table public.client_profiles enable row level security;

drop policy if exists "client_profiles: read scoped" on public.client_profiles;
create policy "client_profiles: read scoped"
  on public.client_profiles
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.members m
      where m.id = client_profiles.member_id
        and (
          m.user_id = auth.uid()
          or m.coach_id = auth.uid()
          or exists (
            select 1
            from public.profiles p
            where p.id = auth.uid()
              and p.role in ('admin', 'coach')
          )
        )
    )
  );

drop policy if exists "client_profiles: insert scoped" on public.client_profiles;
create policy "client_profiles: insert scoped"
  on public.client_profiles
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.members m
      where m.id = client_profiles.member_id
        and (
          m.user_id = auth.uid()
          or m.coach_id = auth.uid()
          or exists (
            select 1
            from public.profiles p
            where p.id = auth.uid()
              and p.role in ('admin', 'coach')
          )
        )
    )
  );

drop policy if exists "client_profiles: update scoped" on public.client_profiles;
create policy "client_profiles: update scoped"
  on public.client_profiles
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.members m
      where m.id = client_profiles.member_id
        and (
          m.user_id = auth.uid()
          or m.coach_id = auth.uid()
          or exists (
            select 1
            from public.profiles p
            where p.id = auth.uid()
              and p.role in ('admin', 'coach')
          )
        )
    )
  )
  with check (
    exists (
      select 1
      from public.members m
      where m.id = client_profiles.member_id
        and (
          m.user_id = auth.uid()
          or m.coach_id = auth.uid()
          or exists (
            select 1
            from public.profiles p
            where p.id = auth.uid()
              and p.role in ('admin', 'coach')
          )
        )
    )
  );
