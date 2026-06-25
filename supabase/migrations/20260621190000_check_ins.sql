create table if not exists public.check_ins (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid not null references public.members (id) on delete cascade,
  weight_kg   numeric,
  energy      integer,
  sleep       integer,
  motivation  integer,
  notes       text,
  created_at  timestamptz not null default now()
);

create index if not exists check_ins_member_id_idx
  on public.check_ins (member_id);

create index if not exists check_ins_created_at_idx
  on public.check_ins (created_at desc);

alter table public.check_ins enable row level security;

drop policy if exists "check_ins: read scoped" on public.check_ins;
create policy "check_ins: read scoped"
  on public.check_ins
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.members m
      where m.id = check_ins.member_id
        and (
          m.user_id = auth.uid()
          or m.coach_id = auth.uid()
          or exists (
            select 1
            from public.profiles p
            where p.id = auth.uid()
              and p.role in ('admin', 'coach')
          )
        )
    )
  );

drop policy if exists "check_ins: insert scoped" on public.check_ins;
create policy "check_ins: insert scoped"
  on public.check_ins
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.members m
      where m.id = check_ins.member_id
        and (
          m.user_id = auth.uid()
          or m.coach_id = auth.uid()
          or exists (
            select 1
            from public.profiles p
            where p.id = auth.uid()
              and p.role in ('admin', 'coach')
          )
        )
    )
  );
