-- Per-post marketing performance metrics

create table if not exists public.content_performance (
  id          uuid primary key default gen_random_uuid(),
  created_by  uuid not null references public.profiles (id) on delete cascade,
  post_id     uuid references public.marketing_posts (id) on delete set null,
  title       text not null default '',
  platform    text not null default '',
  views       integer not null default 0 check (views >= 0),
  likes       integer not null default 0 check (likes >= 0),
  comments    integer not null default 0 check (comments >= 0),
  shares      integer not null default 0 check (shares >= 0),
  content_type text not null default 'educational'
                check (content_type in ('educational', 'promotional')),
  recorded_at timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

create index if not exists content_performance_created_by_idx
  on public.content_performance (created_by);

create index if not exists content_performance_post_id_idx
  on public.content_performance (post_id);

alter table public.content_performance enable row level security;

drop policy if exists "content_performance: select coach admin" on public.content_performance;
create policy "content_performance: select coach admin"
  on public.content_performance
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'coach')
    )
    and (
      created_by = auth.uid()
      or exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role = 'admin'
      )
    )
  );

drop policy if exists "content_performance: insert coach admin" on public.content_performance;
create policy "content_performance: insert coach admin"
  on public.content_performance
  for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'coach')
    )
  );

drop policy if exists "content_performance: update coach admin" on public.content_performance;
create policy "content_performance: update coach admin"
  on public.content_performance
  for update
  to authenticated
  using (
    created_by = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  )
  with check (
    created_by = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

drop policy if exists "content_performance: delete coach admin" on public.content_performance;
create policy "content_performance: delete coach admin"
  on public.content_performance
  for delete
  to authenticated
  using (
    created_by = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );
