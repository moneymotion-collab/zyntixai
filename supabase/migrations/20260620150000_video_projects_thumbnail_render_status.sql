alter table public.video_projects
  add column if not exists thumbnail_url text;

alter table public.video_projects
  add column if not exists render_status text default 'draft';
