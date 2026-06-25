-- Quick fix: PGRST204 missing render timestamp columns on video_projects
-- Run in Supabase Dashboard → SQL Editor, then retry Render.

alter table public.video_projects
  add column if not exists render_error text;

alter table public.video_projects
  add column if not exists render_started_at timestamptz;

alter table public.video_projects
  add column if not exists render_finished_at timestamptz;

notify pgrst, 'reload schema';
