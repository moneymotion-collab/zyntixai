-- Gyms and team invites

create table if not exists public.gyms (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  owner_id    uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now()
);

create index if not exists gyms_owner_id_idx on public.gyms (owner_id);

create table if not exists public.invites (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  gym_id       uuid not null references public.gyms (id) on delete cascade,
  role         text not null check (role in ('coach', 'member')),
  token        text not null unique default encode(gen_random_bytes(32), 'hex'),
  created_at   timestamptz not null default now(),
  accepted_at  timestamptz
);

create index if not exists invites_gym_id_idx on public.invites (gym_id);
create index if not exists invites_email_idx on public.invites (lower(email));

alter table public.gyms enable row level security;
alter table public.invites enable row level security;

drop policy if exists "Gym owners can read own gyms" on public.gyms;
create policy "Gym owners can read own gyms"
  on public.gyms for select to authenticated
  using (owner_id = auth.uid());

drop policy if exists "Coaches can create gyms" on public.gyms;
create policy "Coaches can create gyms"
  on public.gyms for insert to authenticated
  with check (owner_id = auth.uid());

drop policy if exists "Gym owners can update own gyms" on public.gyms;
create policy "Gym owners can update own gyms"
  on public.gyms for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "Gym owners can read invites" on public.invites;
create policy "Gym owners can read invites"
  on public.invites for select to authenticated
  using (
    exists (
      select 1 from public.gyms g
      where g.id = invites.gym_id
        and g.owner_id = auth.uid()
    )
  );

drop policy if exists "Gym owners can create invites" on public.invites;
create policy "Gym owners can create invites"
  on public.invites for insert to authenticated
  with check (
    exists (
      select 1 from public.gyms g
      where g.id = gym_id
        and g.owner_id = auth.uid()
    )
  );

drop policy if exists "Gym owners can delete invites" on public.invites;
create policy "Gym owners can delete invites"
  on public.invites for delete to authenticated
  using (
    exists (
      select 1 from public.gyms g
      where g.id = invites.gym_id
        and g.owner_id = auth.uid()
    )
  );
