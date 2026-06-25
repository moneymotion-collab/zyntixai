-- Quick fix: PGRST204 missing columns on generated_videos
-- Run in Supabase Dashboard → SQL Editor

alter table public.generated_videos
  add column if not exists video_project_id uuid references public.video_projects (id) on delete cascade;

alter table public.generated_videos
  add column if not exists render_type text default 'preview';

alter table public.generated_videos
  add column if not exists title text;

alter table public.generated_videos
  add column if not exists prompt text;

alter table public.generated_videos
  add column if not exists script jsonb;

alter table public.generated_videos
  add column if not exists video_type text;

alter table public.generated_videos
  alter column render_type set default 'preview';

notify pgrst, 'reload schema';
