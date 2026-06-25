alter table public.client_checkins
  add column if not exists sleep_quality integer
    check (sleep_quality is null or (sleep_quality >= 1 and sleep_quality <= 10)),
  add column if not exists stress integer
    check (stress is null or (stress >= 1 and stress <= 10)),
  add column if not exists hunger integer
    check (hunger is null or (hunger >= 1 and hunger <= 10)),
  add column if not exists mood text,
  add column if not exists wins text,
  add column if not exists struggles text,
  add column if not exists notes text;

update public.client_checkins
set sleep_quality = sleep
where sleep_quality is null
  and sleep is not null;
