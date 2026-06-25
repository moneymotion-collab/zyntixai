-- A4 Coach tenant isolation: tighten remaining coach-scoped tables that still allow
-- cross-tenant access (blanket authenticated policies, missing RLS, role-only gates).
-- Builds on 20260721250000_a3_legacy_rls_cleanup.sql.

-- ---------------------------------------------------------------------------
-- members
-- ---------------------------------------------------------------------------
alter table public.members enable row level security;

drop policy if exists "Users can insert members" on public.members;
drop policy if exists "dev: authenticated insert members" on public.members;
drop policy if exists "members: insert scoped" on public.members;
create policy "members: insert scoped"
  on public.members
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or coach_id = auth.uid()
  );

drop policy if exists "dev: authenticated delete members" on public.members;
drop policy if exists "members: delete scoped" on public.members;
create policy "members: delete scoped"
  on public.members
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or coach_id = auth.uid()
  );

-- ---------------------------------------------------------------------------
-- workout_completions (RLS was never enabled)
-- ---------------------------------------------------------------------------
alter table public.workout_completions enable row level security;

drop policy if exists "workout_completions: select scoped" on public.workout_completions;
create policy "workout_completions: select scoped"
  on public.workout_completions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or exists (
      select 1
      from public.members m
      where m.id = workout_completions.member_id
        and m.coach_id = auth.uid()
    )
    or exists (
      select 1
      from public.members m
      where m.id = workout_completions.member_id
        and (
          m.user_id = auth.uid()
          or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        )
    )
  );

drop policy if exists "workout_completions: insert scoped" on public.workout_completions;
create policy "workout_completions: insert scoped"
  on public.workout_completions
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or exists (
      select 1
      from public.members m
      where m.id = member_id
        and m.coach_id = auth.uid()
    )
    or exists (
      select 1
      from public.members m
      where m.id = member_id
        and (
          m.user_id = auth.uid()
          or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        )
    )
  );

drop policy if exists "workout_completions: update scoped" on public.workout_completions;
create policy "workout_completions: update scoped"
  on public.workout_completions
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or exists (
      select 1
      from public.members m
      where m.id = workout_completions.member_id
        and m.coach_id = auth.uid()
    )
    or exists (
      select 1
      from public.members m
      where m.id = workout_completions.member_id
        and (
          m.user_id = auth.uid()
          or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        )
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or exists (
      select 1
      from public.members m
      where m.id = member_id
        and m.coach_id = auth.uid()
    )
    or exists (
      select 1
      from public.members m
      where m.id = member_id
        and (
          m.user_id = auth.uid()
          or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        )
    )
  );

drop policy if exists "workout_completions: delete scoped" on public.workout_completions;
create policy "workout_completions: delete scoped"
  on public.workout_completions
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or exists (
      select 1
      from public.members m
      where m.id = workout_completions.member_id
        and m.coach_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- client_progress_photos (align with A3 client_* patterns)
-- ---------------------------------------------------------------------------
alter table public.client_progress_photos enable row level security;

drop policy if exists "client_progress_photos: select scoped" on public.client_progress_photos;
create policy "client_progress_photos: select scoped"
  on public.client_progress_photos
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or coach_id = auth.uid()
    or exists (
      select 1
      from public.members m
      where m.id = client_progress_photos.member_id
        and (
          m.user_id = auth.uid()
          or lower(trim(m.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        )
    )
  );

drop policy if exists "client_progress_photos: insert scoped" on public.client_progress_photos;
create policy "client_progress_photos: insert scoped"
  on public.client_progress_photos
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      coach_id = auth.uid()
      and exists (
        select 1
        from public.members m
        where m.id = member_id
          and m.coach_id = auth.uid()
      )
    )
  );

drop policy if exists "client_progress_photos: update scoped" on public.client_progress_photos;
create policy "client_progress_photos: update scoped"
  on public.client_progress_photos
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      coach_id = auth.uid()
      and exists (
        select 1
        from public.members m
        where m.id = client_progress_photos.member_id
          and m.coach_id = auth.uid()
      )
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      coach_id = auth.uid()
      and exists (
        select 1
        from public.members m
        where m.id = member_id
          and m.coach_id = auth.uid()
      )
    )
  );

drop policy if exists "client_progress_photos: delete scoped" on public.client_progress_photos;
create policy "client_progress_photos: delete scoped"
  on public.client_progress_photos
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      coach_id = auth.uid()
      and exists (
        select 1
        from public.members m
        where m.id = client_progress_photos.member_id
          and m.coach_id = auth.uid()
      )
    )
  );

-- Storage: folder ownership is sufficient; drop broad coach role gate.
drop policy if exists "progress_photos: insert coach" on storage.objects;
create policy "progress_photos: insert coach"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- content_posts (ownership-based; replaces marketing_posts:* role gates)
-- ---------------------------------------------------------------------------
alter table public.content_posts enable row level security;

drop policy if exists "marketing_posts: select coach admin" on public.content_posts;
drop policy if exists "content_posts: select scoped" on public.content_posts;
create policy "content_posts: select scoped"
  on public.content_posts
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or created_by = auth.uid()
    or user_id = auth.uid()
  );

drop policy if exists "marketing_posts: insert coach admin" on public.content_posts;
drop policy if exists "content_posts: insert scoped" on public.content_posts;
create policy "content_posts: insert scoped"
  on public.content_posts
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      created_by = auth.uid()
      and user_id = auth.uid()
    )
  );

drop policy if exists "marketing_posts: update coach admin" on public.content_posts;
drop policy if exists "content_posts: update scoped" on public.content_posts;
create policy "content_posts: update scoped"
  on public.content_posts
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or created_by = auth.uid()
    or user_id = auth.uid()
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or created_by = auth.uid()
    or user_id = auth.uid()
  );

drop policy if exists "marketing_posts: delete coach admin" on public.content_posts;
drop policy if exists "content_posts: delete scoped" on public.content_posts;
create policy "content_posts: delete scoped"
  on public.content_posts
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or created_by = auth.uid()
    or user_id = auth.uid()
  );

-- ---------------------------------------------------------------------------
-- brand_profiles (add admin read/write; owner isolation unchanged for coaches)
-- ---------------------------------------------------------------------------
alter table public.brand_profiles enable row level security;

drop policy if exists "brand_profiles: select own" on public.brand_profiles;
create policy "brand_profiles: select own"
  on public.brand_profiles
  for select
  to authenticated
  using (
    owner_id = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

drop policy if exists "brand_profiles: insert own" on public.brand_profiles;
create policy "brand_profiles: insert own"
  on public.brand_profiles
  for insert
  to authenticated
  with check (
    owner_id = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

drop policy if exists "brand_profiles: update own" on public.brand_profiles;
create policy "brand_profiles: update own"
  on public.brand_profiles
  for update
  to authenticated
  using (
    owner_id = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  )
  with check (
    owner_id = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- marketing_settings (add admin read/write)
-- ---------------------------------------------------------------------------
alter table public.marketing_settings enable row level security;

drop policy if exists "marketing_settings: select own" on public.marketing_settings;
create policy "marketing_settings: select own"
  on public.marketing_settings
  for select
  to authenticated
  using (
    owner_id = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

drop policy if exists "marketing_settings: insert own" on public.marketing_settings;
create policy "marketing_settings: insert own"
  on public.marketing_settings
  for insert
  to authenticated
  with check (
    owner_id = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

drop policy if exists "marketing_settings: update own" on public.marketing_settings;
create policy "marketing_settings: update own"
  on public.marketing_settings
  for update
  to authenticated
  using (
    owner_id = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  )
  with check (
    owner_id = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- workout_plans insert (replace role-only gate with ownership + coach roster)
-- ---------------------------------------------------------------------------
drop policy if exists "workout_plans: insert coach or admin" on public.workout_plans;
create policy "workout_plans: insert coach or admin"
  on public.workout_plans
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      created_by = auth.uid()
      and exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role = 'coach'
      )
    )
  );

-- ---------------------------------------------------------------------------
-- nutrition_plans insert (ownership-first; role gate only blocks member role)
-- ---------------------------------------------------------------------------
drop policy if exists "nutrition_plans: insert scoped" on public.nutrition_plans;
create policy "nutrition_plans: insert scoped"
  on public.nutrition_plans
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or (
      auth.uid() = created_by
      and exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role = 'coach'
      )
    )
  );
