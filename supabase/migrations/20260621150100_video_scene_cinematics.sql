alter table public.video_scenes
  add column if not exists camera_motion text not null default '',
  add column if not exists transition text not null default '';

update public.video_scenes
set
  camera_motion = coalesce(nullif(camera_motion, ''), 'slow zoom in'),
  transition = coalesce(nullif(transition, ''), 'motion blur')
where camera_motion = '' or transition = '';
