alter table public.video_projects
  add column if not exists mascot_image_url text;

alter table public.video_scenes
  add column if not exists image_url text;
