-- Extend video_projects for marketing video generator + scheduling flow

alter table public.video_projects
  add column if not exists hook text,
  add column if not exists cta text,
  add column if not exists style text,
  add column if not exists video_url text,
  add column if not exists content_post_id uuid references public.content_posts (id) on delete set null;

alter table public.video_projects
  drop constraint if exists video_projects_status_check;

alter table public.video_projects
  add column if not exists updated_at timestamptz not null default now();

update public.video_projects
set status = 'draft'
where status is null
   or status not in ('draft', 'processing', 'ready', 'failed', 'scheduled', 'published');

alter table public.video_projects
  add constraint video_projects_status_check
  check (status in ('draft', 'processing', 'ready', 'failed', 'scheduled', 'published'));

create index if not exists video_projects_content_post_id_idx
  on public.video_projects (content_post_id)
  where content_post_id is not null;

alter table public.content_posts
  add column if not exists video_project_id uuid references public.video_projects (id) on delete set null;

create index if not exists content_posts_video_project_id_idx
  on public.content_posts (video_project_id)
  where video_project_id is not null;
