-- Repair video_projects / video_scenes schema when migrations were not pushed.
-- Run in Supabase Dashboard → SQL Editor, then retry the app.

-- Base table (safe if already exists)
create table if not exists public.video_projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  brand_name  text not null,
  prompt      text not null,
  platform    text not null default 'instagram',
  status      text not null default 'draft',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.video_projects
  add column if not exists hook text,
  add column if not exists cta text,
  add column if not exists style text,
  add column if not exists video_url text,
  add column if not exists content_post_id uuid references public.content_posts (id) on delete set null,
  add column if not exists music_mood text,
  add column if not exists thumbnail_url text,
  add column if not exists render_status text default 'draft',
  add column if not exists caption text,
  add column if not exists hashtags text[] not null default '{}',
  add column if not exists mascot_name text,
  add column if not exists mascot_description text,
  add column if not exists mascot_style text,
  add column if not exists mascot_image_url text,
  add column if not exists image_generation_status text not null default 'pending',
  add column if not exists thumbnail_title text not null default '',
  add column if not exists thumbnail_text text not null default '',
  add column if not exists thumbnail_visual text not null default '',
  add column if not exists workflow_type text not null default '',
  add column if not exists workflow_summary text not null default '';

alter table public.content_posts
  add column if not exists video_project_id uuid references public.video_projects (id) on delete set null;

create index if not exists video_projects_content_post_id_idx
  on public.video_projects (content_post_id)
  where content_post_id is not null;

create index if not exists content_posts_video_project_id_idx
  on public.content_posts (video_project_id)
  where video_project_id is not null;

alter table public.video_projects
  drop constraint if exists video_projects_status_check;

alter table public.video_projects
  add constraint video_projects_status_check
  check (status in ('draft', 'processing', 'ready', 'failed', 'scheduled', 'published'));

create table if not exists public.video_scenes (
  id           uuid primary key default gen_random_uuid(),
  video_id     uuid not null references public.video_projects (id) on delete cascade,
  scene_index  integer not null check (scene_index > 0),
  text         text not null,
  duration     numeric(6, 2) not null default 2 check (duration > 0),
  style        text,
  created_at   timestamptz not null default now(),
  unique (video_id, scene_index)
);

alter table public.video_scenes
  add column if not exists visual text not null default '',
  add column if not exists image_url text,
  add column if not exists image_prompt text not null default '',
  add column if not exists image_status text not null default 'pending',
  add column if not exists camera_motion text not null default '',
  add column if not exists transition text not null default '',
  add column if not exists workflow_type text not null default '',
  add column if not exists workflow_step text not null default '',
  add column if not exists asset_key text,
  add column if not exists asset_url text,
  add column if not exists ui_focus_area text,
  add column if not exists cursor_action text,
  add column if not exists overlay_text text,
  add column if not exists narration text,
  add column if not exists professional_purpose text;

create index if not exists video_projects_workflow_type_idx
  on public.video_projects (workflow_type)
  where workflow_type <> '';

create index if not exists video_scenes_workflow_step_idx
  on public.video_scenes (workflow_step)
  where workflow_step <> '';

create index if not exists video_scenes_asset_key_idx
  on public.video_scenes (asset_key)
  where asset_key is not null;

NOTIFY pgrst, 'reload schema';
