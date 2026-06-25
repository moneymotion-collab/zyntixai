-- Quick fix: column video_projects.generated_video_id does not exist
-- Run in Supabase Dashboard → SQL Editor, then retry Generate / Render.

alter table public.video_projects
  add column if not exists generated_video_id uuid references public.generated_videos (id) on delete set null;

create index if not exists video_projects_generated_video_id_idx
  on public.video_projects (generated_video_id);

notify pgrst, 'reload schema';
