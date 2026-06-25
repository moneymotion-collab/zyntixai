-- Animated short-form video projects + per-scene timeline rows

create table if not exists public.video_projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  brand_name  text not null,
  prompt      text not null,
  platform    text not null default 'instagram',
  status      text not null default 'draft'
    check (status in ('draft', 'processing', 'ready', 'failed', 'published')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists video_projects_user_id_idx
  on public.video_projects (user_id);

create index if not exists video_projects_status_idx
  on public.video_projects (status);

drop trigger if exists video_projects_updated_at on public.video_projects;
create trigger video_projects_updated_at
  before update on public.video_projects
  for each row execute function public.set_updated_at();

alter table public.video_projects enable row level security;

drop policy if exists "video_projects: select own or admin" on public.video_projects;
create policy "video_projects: select own or admin"
  on public.video_projects
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

drop policy if exists "video_projects: insert own" on public.video_projects;
create policy "video_projects: insert own"
  on public.video_projects
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "video_projects: update own or admin" on public.video_projects;
create policy "video_projects: update own or admin"
  on public.video_projects
  for update
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  )
  with check (
    user_id = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

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

create index if not exists video_scenes_video_id_idx
  on public.video_scenes (video_id);

alter table public.video_scenes enable row level security;

drop policy if exists "video_scenes: select own or admin" on public.video_scenes;
create policy "video_scenes: select own or admin"
  on public.video_scenes
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.video_projects vp
      where vp.id = video_scenes.video_id
        and (
          vp.user_id = auth.uid()
          or exists (
            select 1
            from public.profiles p
            where p.id = auth.uid()
              and p.role = 'admin'
          )
        )
    )
  );

drop policy if exists "video_scenes: insert own" on public.video_scenes;
create policy "video_scenes: insert own"
  on public.video_scenes
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.video_projects vp
      where vp.id = video_scenes.video_id
        and vp.user_id = auth.uid()
    )
  );

drop policy if exists "video_scenes: update own or admin" on public.video_scenes;
create policy "video_scenes: update own or admin"
  on public.video_scenes
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.video_projects vp
      where vp.id = video_scenes.video_id
        and (
          vp.user_id = auth.uid()
          or exists (
            select 1
            from public.profiles p
            where p.id = auth.uid()
              and p.role = 'admin'
          )
        )
    )
  )
  with check (
    exists (
      select 1
      from public.video_projects vp
      where vp.id = video_scenes.video_id
        and (
          vp.user_id = auth.uid()
          or exists (
            select 1
            from public.profiles p
            where p.id = auth.uid()
              and p.role = 'admin'
          )
        )
    )
  );

drop policy if exists "video_scenes: delete own or admin" on public.video_scenes;
create policy "video_scenes: delete own or admin"
  on public.video_scenes
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.video_projects vp
      where vp.id = video_scenes.video_id
        and (
          vp.user_id = auth.uid()
          or exists (
            select 1
            from public.profiles p
            where p.id = auth.uid()
              and p.role = 'admin'
          )
        )
    )
  );
