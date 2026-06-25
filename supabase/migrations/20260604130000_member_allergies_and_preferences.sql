create table if not exists public.member_allergies (
  id         uuid primary key default gen_random_uuid(),
  member_id  uuid not null references public.members (id) on delete cascade,
  allergy    text not null,
  created_at timestamptz not null default now(),
  unique (member_id, allergy)
);

create table if not exists public.member_food_preferences (
  id         uuid primary key default gen_random_uuid(),
  member_id  uuid not null references public.members (id) on delete cascade,
  preference text not null,
  created_at timestamptz not null default now(),
  unique (member_id, preference)
);

create index if not exists member_allergies_member_id_idx
  on public.member_allergies (member_id);

create index if not exists member_food_preferences_member_id_idx
  on public.member_food_preferences (member_id);

alter table public.member_allergies enable row level security;
alter table public.member_food_preferences enable row level security;

drop policy if exists "member_allergies: read authenticated" on public.member_allergies;
create policy "member_allergies: read authenticated"
  on public.member_allergies for select to authenticated using (true);

drop policy if exists "member_allergies: insert authenticated" on public.member_allergies;
create policy "member_allergies: insert authenticated"
  on public.member_allergies for insert to authenticated with check (true);

drop policy if exists "member_allergies: delete authenticated" on public.member_allergies;
create policy "member_allergies: delete authenticated"
  on public.member_allergies for delete to authenticated using (true);

drop policy if exists "member_food_preferences: read authenticated" on public.member_food_preferences;
create policy "member_food_preferences: read authenticated"
  on public.member_food_preferences for select to authenticated using (true);

drop policy if exists "member_food_preferences: insert authenticated" on public.member_food_preferences;
create policy "member_food_preferences: insert authenticated"
  on public.member_food_preferences for insert to authenticated with check (true);

drop policy if exists "member_food_preferences: delete authenticated" on public.member_food_preferences;
create policy "member_food_preferences: delete authenticated"
  on public.member_food_preferences for delete to authenticated using (true);
