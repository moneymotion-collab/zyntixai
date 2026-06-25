-- workouts: user-created workout entries

create table if not exists public.workouts (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  created_by   uuid references auth.users (id) on delete set null,
  created_at   timestamptz not null default now()
);

create index if not exists workouts_created_by_idx on public.workouts (created_by);
create index if not exists workouts_created_at_idx on public.workouts (created_at desc);

alter table public.workouts enable row level security;

drop policy if exists "workouts: read all authenticated" on public.workouts;
create policy "workouts: read all authenticated"
  on public.workouts
  for select
  to authenticated
  using (true);

drop policy if exists "workouts: insert own" on public.workouts;
create policy "workouts: insert own"
  on public.workouts
  for insert
  to authenticated
  with check (auth.uid() = created_by);

drop policy if exists "workouts: update own" on public.workouts;
create policy "workouts: update own"
  on public.workouts
  for update
  to authenticated
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

drop policy if exists "workouts: delete own" on public.workouts;
create policy "workouts: delete own"
  on public.workouts
  for delete
  to authenticated
  using (auth.uid() = created_by);
