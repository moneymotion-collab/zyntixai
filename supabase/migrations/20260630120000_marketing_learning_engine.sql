-- M10 Marketing Learning Engine: persisted profiles and insights

create table if not exists public.marketing_learning_profiles (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references public.profiles (id) on delete cascade,
  run_id                   uuid not null,
  post_count               integer not null default 0 check (post_count >= 0),
  average_engagement_rate  numeric not null default 0,
  best_platform            text,
  best_content_type        text,
  best_posting_time        text,
  profile_json             jsonb not null default '{}'::jsonb,
  created_at               timestamptz not null default now()
);

create table if not exists public.marketing_learning_insights (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  profile_id   uuid not null references public.marketing_learning_profiles (id) on delete cascade,
  run_id       uuid not null,
  insight_key  text not null,
  category     text not null default '',
  title        text not null default '',
  message      text not null,
  metrics      jsonb not null default '{}'::jsonb,
  patterns     jsonb not null default '{}'::jsonb,
  priority     integer not null default 0,
  created_at   timestamptz not null default now()
);

create unique index if not exists marketing_learning_insights_run_key_idx
  on public.marketing_learning_insights (run_id, insight_key);

create index if not exists marketing_learning_profiles_user_id_idx
  on public.marketing_learning_profiles (user_id);

create index if not exists marketing_learning_profiles_created_at_idx
  on public.marketing_learning_profiles (created_at desc);

create index if not exists marketing_learning_insights_profile_id_idx
  on public.marketing_learning_insights (profile_id);

create index if not exists marketing_learning_insights_user_id_idx
  on public.marketing_learning_insights (user_id);

alter table public.marketing_learning_profiles enable row level security;
alter table public.marketing_learning_insights enable row level security;

drop policy if exists "marketing_learning_profiles: select own" on public.marketing_learning_profiles;
create policy "marketing_learning_profiles: select own"
  on public.marketing_learning_profiles
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "marketing_learning_profiles: insert own" on public.marketing_learning_profiles;
create policy "marketing_learning_profiles: insert own"
  on public.marketing_learning_profiles
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "marketing_learning_insights: select own" on public.marketing_learning_insights;
create policy "marketing_learning_insights: select own"
  on public.marketing_learning_insights
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "marketing_learning_insights: insert own" on public.marketing_learning_insights;
create policy "marketing_learning_insights: insert own"
  on public.marketing_learning_insights
  for insert
  to authenticated
  with check (user_id = auth.uid());
