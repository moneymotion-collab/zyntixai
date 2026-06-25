-- Render pipeline: timestamps, errors, and generated_videos output table.

alter table public.video_projects
  add column if not exists render_error text;

alter table public.video_projects
  add column if not exists render_started_at timestamptz;

alter table public.video_projects
  add column if not exists render_finished_at timestamptz;

create table if not exists public.generated_videos (
  id                 uuid primary key default gen_random_uuid(),
  video_project_id   uuid not null references public.video_projects (id) on delete cascade,
  user_id            uuid not null references public.profiles (id) on delete cascade,
  video_url          text,
  status             text not null default 'processing'
    check (status in ('processing', 'completed', 'failed')),
  render_error       text,
  render_type        text not null default 'preview'
    check (render_type in ('preview', 'final')),
  render_started_at  timestamptz,
  render_finished_at timestamptz,
  storage_path       text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists generated_videos_video_project_id_idx
  on public.generated_videos (video_project_id);

create index if not exists generated_videos_user_id_idx
  on public.generated_videos (user_id);

create index if not exists generated_videos_status_idx
  on public.generated_videos (status);

drop trigger if exists generated_videos_updated_at on public.generated_videos;
create trigger generated_videos_updated_at
  before update on public.generated_videos
  for each row execute function public.set_updated_at();

grant select, insert, update on public.generated_videos to authenticated;
grant all on public.generated_videos to service_role;

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
