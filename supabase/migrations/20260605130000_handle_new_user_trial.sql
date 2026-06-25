-- New auth users get a member trial immediately (no null trial_ends_at)

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, trial_ends_at, subscription_status)
  values (
    new.id,
    new.email,
    'member',
    now() + interval '7 days',
    'trial'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
