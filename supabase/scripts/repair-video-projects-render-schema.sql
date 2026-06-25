-- Repair video_projects render pipeline columns (run if render fails with PGRST204).
-- Run in Supabase Dashboard → SQL Editor, then retry Generate / Render.

alter table public.video_projects
  add column if not exists render_error text;

alter table public.video_projects
  add column if not exists render_started_at timestamptz;

alter table public.video_projects
  add column if not exists render_finished_at timestamptz;

alter table public.video_projects
  add column if not exists generated_video_id uuid references public.generated_videos (id) on delete set null;

create index if not exists video_projects_generated_video_id_idx
  on public.video_projects (generated_video_id);

notify pgrst, 'reload schema';
