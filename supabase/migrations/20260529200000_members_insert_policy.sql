-- Allow authenticated users to add members

drop policy if exists "Users can insert members" on public.members;
drop policy if exists "dev: authenticated insert members" on public.members;

create policy "Users can insert members"
  on public.members
  for insert
  with check (auth.role() = 'authenticated');
