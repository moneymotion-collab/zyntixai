alter table public.members
  add column if not exists phone text,
  add column if not exists age integer,
  add column if not exists gender text,
  add column if not exists height_cm numeric,
  add column if not exists activity_level text,
  add column if not exists intake_summary text,
  add column if not exists coach_notes text;

drop policy if exists "members: update coach roster" on public.members;
create policy "members: update coach roster"
  on public.members
  for update
  to authenticated
  using (
    coach_id = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  )
  with check (
    coach_id = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );
