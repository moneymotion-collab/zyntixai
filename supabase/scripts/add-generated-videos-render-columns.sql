-- Quick fix: PGRST204 missing render columns on generated_videos
-- Run in Supabase Dashboard → SQL Editor, then retry Render.

alter table public.generated_videos
  add column if not exists render_error text;

alter table public.generated_videos
  add column if not exists render_type text default 'preview';

alter table public.generated_videos
  add column if not exists render_started_at timestamptz;

alter table public.generated_videos
  add column if not exists render_finished_at timestamptz;

alter table public.generated_videos
  add column if not exists storage_path text;

alter table public.generated_videos
  add column if not exists video_url text;

notify pgrst, 'reload schema';
