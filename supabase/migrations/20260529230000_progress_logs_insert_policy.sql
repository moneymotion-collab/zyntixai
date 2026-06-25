-- Allow authenticated users to add progress logs

drop policy if exists "progress_logs: insert authenticated" on public.progress_logs;
drop policy if exists "Users can insert progress logs" on public.progress_logs;

create policy "progress_logs: insert authenticated"
  on public.progress_logs
  for insert
  to authenticated
  with check (true);
