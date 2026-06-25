-- Repair generated_videos when migrations were not pushed.
-- Run in Supabase Dashboard → SQL Editor, then retry Generate / Render.

create table if not exists public.generated_videos (
  id                 uuid primary key default gen_random_uuid(),
  video_project_id   uuid references public.video_projects (id) on delete cascade,
  user_id            uuid not null references public.profiles (id) on delete cascade,
  title              text,
  prompt             text,
  script             jsonb,
  video_type         text,
  video_url          text,
  status             text not null default 'draft',
  render_error       text,
  render_type        text default 'preview',
  render_started_at  timestamptz,
  render_finished_at timestamptz,
  storage_path       text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

alter table public.generated_videos
  add column if not exists video_project_id uuid references public.video_projects (id) on delete cascade,
  add column if not exists title text,
  add column if not exists prompt text,
  add column if not exists script jsonb,
  add column if not exists video_type text,
  add column if not exists video_url text,
  add column if not exists render_error text,
  add column if not exists render_type text default 'preview',
  add column if not exists render_started_at timestamptz,
  add column if not exists render_finished_at timestamptz,
  add column if not exists storage_path text;

alter table public.generated_videos
  alter column video_project_id drop not null;

alter table public.video_projects
  add column if not exists generated_video_id uuid references public.generated_videos (id) on delete set null;

alter table public.generated_videos
  drop constraint if exists generated_videos_status_check;

alter table public.generated_videos
  add constraint generated_videos_status_check
  check (
    status in (
      'draft',
      'creating',
      'created',
      'rendering',
      'processing',
      'completed',
      'failed'
    )
  );

alter table public.generated_videos
  alter column status set default 'draft';

create index if not exists generated_videos_video_project_id_idx
  on public.generated_videos (video_project_id);

create index if not exists generated_videos_user_id_idx
  on public.generated_videos (user_id);

create index if not exists generated_videos_status_idx
  on public.generated_videos (status);

create index if not exists video_projects_generated_video_id_idx
  on public.video_projects (generated_video_id);

drop trigger if exists generated_videos_updated_at on public.generated_videos;
create trigger generated_videos_updated_at
  before update on public.generated_videos
  for each row execute function public.set_updated_at();

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

-- Refresh PostgREST schema cache (fixes PGRST204 after adding columns)
notify pgrst, 'reload schema';
