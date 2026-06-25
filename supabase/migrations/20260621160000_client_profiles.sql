create table if not exists public.client_profiles (
  member_id        uuid primary key references public.members (id) on delete cascade,
  age              integer,
  gender           text,
  height_cm        numeric,
  weight_kg        numeric,
  goal_weight      numeric,
  fitness_level    text,
  training_days    text,
  primary_goal     text,
  injuries         text,
  mobility_notes   text,
  allergies        text,
  food_preferences text,
  coach_notes      text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.client_profiles enable row level security;

drop policy if exists "client_profiles: read scoped" on public.client_profiles;
create policy "client_profiles: read scoped"
  on public.client_profiles
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.members m
      where m.id = client_profiles.member_id
        and (
          m.user_id = auth.uid()
          or m.coach_id = auth.uid()
          or exists (
            select 1
            from public.profiles p
            where p.id = auth.uid()
              and p.role = 'admin'
          )
        )
    )
  );

drop policy if exists "client_profiles: insert scoped" on public.client_profiles;
create policy "client_profiles: insert scoped"
  on public.client_profiles
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.members m
      where m.id = client_profiles.member_id
        and (
          m.user_id = auth.uid()
          or m.coach_id = auth.uid()
          or exists (
            select 1
            from public.profiles p
            where p.id = auth.uid()
              and p.role = 'admin'
          )
        )
    )
  );

drop policy if exists "client_profiles: update scoped" on public.client_profiles;
create policy "client_profiles: update scoped"
  on public.client_profiles
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.members m
      where m.id = client_profiles.member_id
        and (
          m.user_id = auth.uid()
          or m.coach_id = auth.uid()
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
      from public.members m
      where m.id = client_profiles.member_id
        and (
          m.user_id = auth.uid()
          or m.coach_id = auth.uid()
          or exists (
            select 1
            from public.profiles p
            where p.id = auth.uid()
              and p.role = 'admin'
          )
        )
    )
  );
