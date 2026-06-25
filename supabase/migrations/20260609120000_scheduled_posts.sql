-- Coach marketing posts scheduled from Marketing AI Coach

create table if not exists public.scheduled_posts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles (id) on delete cascade,
  platform        text not null default '',
  content         text not null default '',
  hook            text not null default '',
  post_type       text not null default '',
  scheduled_date  timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists scheduled_posts_user_id_idx
  on public.scheduled_posts (user_id);

create index if not exists scheduled_posts_scheduled_date_idx
  on public.scheduled_posts (scheduled_date);

alter table public.scheduled_posts enable row level security;

drop policy if exists "scheduled_posts: select own or admin" on public.scheduled_posts;
create policy "scheduled_posts: select own or admin"
  on public.scheduled_posts
  for select
  to authenticated
  using (
    user_id::text = auth.uid()::text
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

drop policy if exists "scheduled_posts: insert coach admin" on public.scheduled_posts;
create policy "scheduled_posts: insert coach admin"
  on public.scheduled_posts
  for insert
  to authenticated
  with check (
    user_id::text = auth.uid()::text
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'coach')
    )
  );

drop policy if exists "scheduled_posts: update own or admin" on public.scheduled_posts;
create policy "scheduled_posts: update own or admin"
  on public.scheduled_posts
  for update
  to authenticated
  using (
    user_id::text = auth.uid()::text
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  )
  with check (
    user_id::text = auth.uid()::text
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

drop policy if exists "scheduled_posts: delete own or admin" on public.scheduled_posts;
create policy "scheduled_posts: delete own or admin"
  on public.scheduled_posts
  for delete
  to authenticated
  using (
    user_id::text = auth.uid()::text
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );
