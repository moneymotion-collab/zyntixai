-- Quick fix: PGRST204 "Could not find the 'video_project_id' column"
-- Run in Supabase Dashboard → SQL Editor, then retry Generate / Render.

alter table public.generated_videos
  add column if not exists video_project_id uuid references public.video_projects (id) on delete cascade;

alter table public.generated_videos
  alter column video_project_id drop not null;

create index if not exists generated_videos_video_project_id_idx
  on public.generated_videos (video_project_id);

notify pgrst, 'reload schema';
