-- Flag demo/seed members for safe bulk generate and cleanup per coach.

alter table public.members
  add column if not exists is_demo boolean not null default false;

create index if not exists members_coach_id_is_demo_idx
  on public.members (coach_id, is_demo)
  where is_demo = true;

comment on column public.members.is_demo is
  'True for demo members generated for product demos and screenshots.';
