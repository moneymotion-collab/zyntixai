-- Reject a pending coach request (does not change members.coach_id)

create or replace function public.reject_coach_request(p_request_id uuid)
returns public.coach_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.coach_requests;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select *
  into v_request
  from public.coach_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Request not found';
  end if;

  if v_request.status <> 'pending' then
    raise exception 'Request is not pending';
  end if;

  if v_request.coach_id <> auth.uid()
     and not exists (
       select 1
       from public.profiles p
       where p.id = auth.uid()
         and p.role = 'admin'
     ) then
    raise exception 'Access denied';
  end if;

  update public.coach_requests
  set status = 'rejected'
  where id = p_request_id
  returning * into v_request;

  return v_request;
end;
$$;

revoke all on function public.reject_coach_request(uuid) from public;
grant execute on function public.reject_coach_request(uuid) to authenticated;
