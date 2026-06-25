alter table public.content_performance
  add column if not exists content_type text not null default 'educational'
  check (content_type in ('educational', 'promotional'));
