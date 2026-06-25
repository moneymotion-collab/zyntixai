-- Fix 42501 "new row violates row-level security policy" on generated_videos.
-- Run in Supabase Dashboard → SQL Editor, then retry Generate.

alter table public.generated_videos enable row level security;

drop policy if exists "generated_videos: select own or admin" on public.generated_videos;
create policy "generated_videos: select own or admin"
  on public.generated_videos
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

drop policy if exists "generated_videos: insert own" on public.generated_videos;
create policy "generated_videos: insert own"
  on public.generated_videos
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "generated_videos: update own or admin" on public.generated_videos;
create policy "generated_videos: update own or admin"
  on public.generated_videos
  for update
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  )
  with check (
    user_id = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

grant select, insert, update on public.generated_videos to authenticated;
grant all on public.generated_videos to service_role;

notify pgrst, 'reload schema';
