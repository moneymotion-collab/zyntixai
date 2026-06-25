alter table public.gym_settings
  add column if not exists is_demo_workspace boolean not null default false;

comment on column public.gym_settings.is_demo_workspace is
  'True when the coach is actively exploring the FitCore AI demo workspace.';
