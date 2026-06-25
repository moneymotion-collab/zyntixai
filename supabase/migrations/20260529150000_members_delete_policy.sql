-- Allow authenticated users to delete members (dev policy; tighten per coach later)

drop policy if exists "dev: authenticated delete members" on public.members;
create policy "dev: authenticated delete members"
  on public.members
  for delete
  to authenticated
  using (true);
