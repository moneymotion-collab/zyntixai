-- Marketing content posts with workflow status

create table if not exists public.marketing_posts (
  id            uuid primary key default gen_random_uuid(),
  created_by    uuid not null references public.profiles (id) on delete cascade,
  title         text not null,
  caption       text not null default '',
  hashtags      text not null default '',
  status        text not null default 'draft'
                check (status in ('draft', 'approved', 'scheduled', 'published')),
  scheduled_at  timestamptz,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists marketing_posts_created_by_idx
  on public.marketing_posts (created_by);

create index if not exists marketing_posts_status_idx
  on public.marketing_posts (status);

alter table public.marketing_posts enable row level security;

drop policy if exists "marketing_posts: select coach admin" on public.marketing_posts;
create policy "marketing_posts: select coach admin"
  on public.marketing_posts
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

drop policy if exists "marketing_posts: insert coach admin" on public.marketing_posts;
create policy "marketing_posts: insert coach admin"
  on public.marketing_posts
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

drop policy if exists "marketing_posts: update coach admin" on public.marketing_posts;
create policy "marketing_posts: update coach admin"
  on public.marketing_posts
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

drop policy if exists "marketing_posts: delete coach admin" on public.marketing_posts;
create policy "marketing_posts: delete coach admin"
  on public.marketing_posts
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
