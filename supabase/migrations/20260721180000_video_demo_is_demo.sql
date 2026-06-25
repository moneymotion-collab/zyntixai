alter table video_projects add column if not exists is_demo boolean default false;
alter table video_scenes add column if not exists is_demo boolean default false;
