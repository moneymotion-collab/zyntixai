-- Optional coach notes on sessions (Today's Agenda / session overview)
alter table public.sessions
  add column if not exists notes text;
