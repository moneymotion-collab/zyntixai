create table if not exists public.video_outputs (
  id          uuid primary key default gen_random_uuid(),
  video_id    uuid not null references public.video_projects (id) on delete cascade,
  render_url  text not null,
  status      text not null default 'ready'
    check (status in ('draft', 'rendering', 'ready', 'failed')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists video_outputs_video_id_idx
  on public.video_outputs (video_id);

drop trigger if exists video_outputs_updated_at on public.video_outputs;
create trigger video_outputs_updated_at
  before update on public.video_outputs
  for each row execute function public.set_updated_at();

alter table public.video_outputs enable row level security;

drop policy if exists "video_outputs: select own or admin" on public.video_outputs;
create policy "video_outputs: select own or admin"
  on public.video_outputs
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.video_projects vp
      where vp.id = video_outputs.video_id
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

drop policy if exists "video_outputs: insert own" on public.video_outputs;
create policy "video_outputs: insert own"
  on public.video_outputs
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.video_projects vp
      where vp.id = video_outputs.video_id
        and vp.user_id = auth.uid()
    )
  );

drop policy if exists "video_outputs: update own or admin" on public.video_outputs;
create policy "video_outputs: update own or admin"
  on public.video_outputs
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.video_projects vp
      where vp.id = video_outputs.video_id
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
      where vp.id = video_outputs.video_id
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
