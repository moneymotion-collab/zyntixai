-- Sessions orphan INSERT policy cleanup: drop permissive WITH CHECK (true) policies
-- that bypass scoped coach-roster / admin insert rules.

-- ---------------------------------------------------------------------------
-- 1) Dynamic drop: permissive INSERT policies on sessions
-- ---------------------------------------------------------------------------
do $$
declare
  r record;
begin
  if to_regclass('public.sessions') is null then
    raise notice 'skip sessions RLS cleanup: table does not exist';
    return;
  end if;

  for r in
    select p.polname as policy_name
    from pg_policy p
    join pg_class c on c.oid = p.polrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'sessions'
      and (
        pg_get_expr(p.polqual, p.polrelid) = 'true'
        or pg_get_expr(p.polwithcheck, p.polrelid) = 'true'
        or pg_get_expr(p.polqual, p.polrelid) = '(auth.role() = ''authenticated''::text)'
        or pg_get_expr(p.polwithcheck, p.polrelid) = '(auth.role() = ''authenticated''::text)'
      )
  loop
    execute format('drop policy if exists %I on public.sessions', r.policy_name);
    raise notice 'dropped permissive sessions policy %', r.policy_name;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 2) Explicit drops (remote orphan names from FINAL2 audit)
-- ---------------------------------------------------------------------------
drop policy if exists "Allow authenticated inserts" on public.sessions;
drop policy if exists "Allow inserts for anon users" on public.sessions;
drop policy if exists "sessions: insert authenticated" on public.sessions;

-- ---------------------------------------------------------------------------
-- 3) Re-assert scoped INSERT (coach roster + admin)
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.sessions') is null then
    return;
  end if;

  alter table public.sessions enable row level security;

  drop policy if exists "sessions: insert scoped" on public.sessions;
  create policy "sessions: insert scoped"
    on public.sessions
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
    );
end $$;
