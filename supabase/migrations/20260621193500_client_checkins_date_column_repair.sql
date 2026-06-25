-- Align date column name with live client_checkins schema (checkin_date).

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'client_checkins'
      and column_name = 'check_in_date'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'client_checkins'
      and column_name = 'checkin_date'
  ) then
    alter table public.client_checkins
      rename column check_in_date to checkin_date;
  end if;
end $$;

create index if not exists client_checkins_checkin_date_idx
  on public.client_checkins (checkin_date desc);
