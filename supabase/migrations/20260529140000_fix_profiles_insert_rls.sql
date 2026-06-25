-- Bypass RLS for profile creation via trusted function (called after sign-up)

create or replace function public.ensure_profile(
  p_email text default null,
  p_role text default 'admin'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.profiles (id, email, role)
  values (
    auth.uid(),
    coalesce(p_email, auth.jwt() ->> 'email'),
    coalesce(p_role, 'admin')
  )
  on conflict (id) do update
    set email = excluded.email,
        role = excluded.role;
end;
$$;

revoke all on function public.ensure_profile(text, text) from public;
grant execute on function public.ensure_profile(text, text) to authenticated;
