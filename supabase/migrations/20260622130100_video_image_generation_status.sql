alter table public.video_scenes
  add column if not exists image_status text not null default 'pending';

alter table public.video_projects
  add column if not exists image_generation_status text not null default 'pending';
