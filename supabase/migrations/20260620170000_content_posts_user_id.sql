-- Mirror scheduled_posts ownership: content_posts also stores user_id

alter table public.content_posts
  add column if not exists user_id uuid references public.profiles (id) on delete cascade;

update public.content_posts
  set user_id = created_by
  where user_id is null;

alter table public.content_posts
  alter column user_id set not null;

create index if not exists content_posts_user_id_idx
  on public.content_posts (user_id);

drop policy if exists "marketing_posts: insert coach admin" on public.content_posts;
create policy "marketing_posts: insert coach admin"
  on public.content_posts
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and created_by = auth.uid()
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'coach')
    )
  );
