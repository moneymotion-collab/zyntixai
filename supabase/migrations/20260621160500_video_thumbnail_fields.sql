alter table public.video_projects
  add column if not exists thumbnail_title text not null default '',
  add column if not exists thumbnail_text text not null default '',
  add column if not exists thumbnail_visual text not null default '';

update public.video_projects
set
  thumbnail_title = coalesce(nullif(thumbnail_title, ''), hook, prompt, ''),
  thumbnail_text = coalesce(nullif(thumbnail_text, ''), cta, ''),
  thumbnail_visual = coalesce(
    nullif(thumbnail_visual, ''),
    'Bold scroll-stopping cover frame with high-contrast fitness branding.'
  )
where thumbnail_title = '' or thumbnail_text = '' or thumbnail_visual = '';
