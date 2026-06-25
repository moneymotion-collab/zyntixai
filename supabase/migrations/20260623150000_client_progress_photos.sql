-- C4 Before & After Center: progress photos table + storage bucket

create table if not exists public.client_progress_photos (
  id          uuid primary key default gen_random_uuid(),
  coach_id    uuid not null references auth.users (id) on delete cascade,
  member_id   uuid not null references public.members (id) on delete cascade,
  photo_url   text not null,
  photo_type  text not null default 'front',
  taken_at    date not null default current_date,
  notes       text,
  created_at  timestamptz not null default now(),
  constraint client_progress_photos_photo_type_check
    check (photo_type in ('front', 'side', 'back', 'full_body', 'other'))
);

create index if not exists client_progress_photos_coach_id_idx
  on public.client_progress_photos (coach_id);

create index if not exists client_progress_photos_member_id_idx
  on public.client_progress_photos (member_id);

create index if not exists client_progress_photos_taken_at_idx
  on public.client_progress_photos (taken_at desc);

alter table public.client_progress_photos enable row level security;

drop policy if exists "client_progress_photos: select scoped" on public.client_progress_photos;
create policy "client_progress_photos: select scoped"
  on public.client_progress_photos
  for select
  to authenticated
  using (
    coach_id = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or exists (
      select 1
      from public.members m
      where m.id = client_progress_photos.member_id
        and m.user_id = auth.uid()
    )
  );

drop policy if exists "client_progress_photos: insert scoped" on public.client_progress_photos;
create policy "client_progress_photos: insert scoped"
  on public.client_progress_photos
  for insert
  to authenticated
  with check (
    coach_id = auth.uid()
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'coach')
    )
  );

drop policy if exists "client_progress_photos: update scoped" on public.client_progress_photos;
create policy "client_progress_photos: update scoped"
  on public.client_progress_photos
  for update
  to authenticated
  using (coach_id = auth.uid())
  with check (coach_id = auth.uid());

drop policy if exists "client_progress_photos: delete scoped" on public.client_progress_photos;
create policy "client_progress_photos: delete scoped"
  on public.client_progress_photos
  for delete
  to authenticated
  using (
    coach_id = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

-- Storage bucket: progress-photos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'progress-photos',
  'progress-photos',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "progress_photos: select public" on storage.objects;
create policy "progress_photos: select public"
  on storage.objects
  for select
  to public
  using (bucket_id = 'progress-photos');

drop policy if exists "progress_photos: insert coach" on storage.objects;
create policy "progress_photos: insert coach"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('coach', 'admin')
    )
  );

drop policy if exists "progress_photos: update owner" on storage.objects;
create policy "progress_photos: update owner"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "progress_photos: delete owner" on storage.objects;
create policy "progress_photos: delete owner"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
