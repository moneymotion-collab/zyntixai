-- Fix scheduled_posts: columns, RLS policies (table may exist from dashboard)

alter table public.scheduled_posts
  add column if not exists post_type text not null default '';

alter table public.scheduled_posts
  add column if not exists scheduled_date timestamptz;

alter table public.scheduled_posts
  add column if not exists created_at timestamptz not null default now();

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
