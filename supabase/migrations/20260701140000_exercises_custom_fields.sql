-- Custom exercises: structured coaching fields, image gallery, coach-owned catalog entries.

-- ---------------------------------------------------------------------------
-- 1) New columns
-- ---------------------------------------------------------------------------

alter table public.exercises
  add column if not exists form_steps jsonb not null default '[]'::jsonb,
  add column if not exists common_mistakes jsonb not null default '[]'::jsonb,
  add column if not exists coach_tips jsonb not null default '[]'::jsonb,
  add column if not exists image_urls text[] not null default '{}',
  add column if not exists is_custom boolean not null default false,
  add column if not exists created_by uuid references auth.users (id) on delete set null;

-- Backfill image_urls from legacy singular image_url.
update public.exercises
set image_urls = array[image_url]
where image_url is not null
  and nullif(trim(image_url), '') is not null
  and coalesce(array_length(image_urls, 1), 0) = 0;

-- Migrate legacy flat tips into coach_tips when coach_tips is empty.
update public.exercises
set coach_tips = jsonb_build_array(jsonb_build_object('tip', tips))
where coalesce(jsonb_array_length(coach_tips), 0) = 0
  and nullif(trim(tips), '') is not null;

-- ---------------------------------------------------------------------------
-- 2) Unique name constraints (standard catalog vs per-coach custom)
-- ---------------------------------------------------------------------------

drop index if exists public.exercises_name_key;

create unique index if not exists exercises_name_standard_key
  on public.exercises (name)
  where is_custom = false;

create unique index if not exists exercises_name_custom_key
  on public.exercises (created_by, lower(name))
  where is_custom = true;

create index if not exists exercises_is_custom_idx
  on public.exercises (is_custom);

create index if not exists exercises_created_by_idx
  on public.exercises (created_by)
  where created_by is not null;

-- ---------------------------------------------------------------------------
-- 3) RLS: standard visible to all; custom visible only to creator (+ admin)
-- ---------------------------------------------------------------------------

drop policy if exists "exercises: read authenticated" on public.exercises;
create policy "exercises: read authenticated"
  on public.exercises
  for select
  to authenticated
  using (
    is_custom = false
    or created_by = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

drop policy if exists "exercises: insert admin" on public.exercises;
create policy "exercises: insert admin"
  on public.exercises
  for insert
  to authenticated
  with check (
    is_custom = false
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

drop policy if exists "exercises: insert coach custom" on public.exercises;
create policy "exercises: insert coach custom"
  on public.exercises
  for insert
  to authenticated
  with check (
    is_custom = true
    and created_by = auth.uid()
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'coach'
    )
  );

drop policy if exists "exercises: update admin" on public.exercises;
create policy "exercises: update admin"
  on public.exercises
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

drop policy if exists "exercises: update coach custom" on public.exercises;
create policy "exercises: update coach custom"
  on public.exercises
  for update
  to authenticated
  using (
    is_custom = true
    and created_by = auth.uid()
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'coach'
    )
  )
  with check (
    is_custom = true
    and created_by = auth.uid()
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'coach'
    )
  );

drop policy if exists "exercises: delete admin" on public.exercises;
create policy "exercises: delete admin"
  on public.exercises
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

drop policy if exists "exercises: delete coach custom" on public.exercises;
create policy "exercises: delete coach custom"
  on public.exercises
  for delete
  to authenticated
  using (
    is_custom = true
    and created_by = auth.uid()
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'coach'
    )
  );

-- ---------------------------------------------------------------------------
-- 4) Storage bucket: exercise-images
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'exercise-images',
  'exercise-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "exercise_images: select public" on storage.objects;
create policy "exercise_images: select public"
  on storage.objects
  for select
  to public
  using (bucket_id = 'exercise-images');

drop policy if exists "exercise_images: insert coach" on storage.objects;
create policy "exercise_images: insert coach"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'exercise-images'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('coach', 'admin')
    )
  );

drop policy if exists "exercise_images: update owner" on storage.objects;
create policy "exercise_images: update owner"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'exercise-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'exercise-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "exercise_images: delete owner" on storage.objects;
create policy "exercise_images: delete owner"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'exercise-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
