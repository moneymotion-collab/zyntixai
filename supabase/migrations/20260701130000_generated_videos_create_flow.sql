-- Extend generated_videos for Video Generator create flow.

alter table public.generated_videos
  add column if not exists title text;

alter table public.generated_videos
  add column if not exists prompt text;

alter table public.generated_videos
  add column if not exists script jsonb;

alter table public.generated_videos
  add column if not exists video_type text;

alter table public.video_projects
  add column if not exists generated_video_id uuid references public.generated_videos (id) on delete set null;

create index if not exists video_projects_generated_video_id_idx
  on public.video_projects (generated_video_id);

alter table public.generated_videos
  alter column video_project_id drop not null;

alter table public.generated_videos
  alter column status set default 'draft';

alter table public.generated_videos
  drop constraint if exists generated_videos_status_check;

alter table public.generated_videos
  add constraint generated_videos_status_check
  check (
    status in (
      'draft',
      'creating',
      'created',
      'rendering',
      'processing',
      'completed',
      'failed'
    )
  );

alter table public.generated_videos
  alter column render_type drop not null;

alter table public.generated_videos
  alter column render_type set default 'preview';

grant select, insert, update on public.generated_videos to authenticated;
grant all on public.generated_videos to service_role;

notify pgrst, 'reload schema';
