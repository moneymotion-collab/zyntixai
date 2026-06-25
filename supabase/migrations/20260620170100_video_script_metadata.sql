alter table public.video_scenes
  add column if not exists visual text not null default '';

alter table public.video_projects
  add column if not exists caption text,
  add column if not exists hashtags text[] not null default '{}',
  add column if not exists mascot_name text,
  add column if not exists mascot_description text;
