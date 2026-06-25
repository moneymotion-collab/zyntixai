-- Workflow intelligence metadata on video projects and scenes.

alter table public.video_projects
  add column if not exists workflow_type text not null default '',
  add column if not exists workflow_summary text not null default '';

alter table public.video_scenes
  add column if not exists workflow_type text not null default '',
  add column if not exists workflow_step text not null default '';

create index if not exists video_projects_workflow_type_idx
  on public.video_projects (workflow_type)
  where workflow_type <> '';

create index if not exists video_scenes_workflow_step_idx
  on public.video_scenes (workflow_step)
  where workflow_step <> '';
