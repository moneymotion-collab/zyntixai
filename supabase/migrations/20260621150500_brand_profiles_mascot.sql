-- Brand mascot fields for marketing AI and video generation

alter table public.brand_profiles
  add column if not exists mascot_name text not null default '',
  add column if not exists mascot_description text not null default '',
  add column if not exists mascot_style text not null default '',
  add column if not exists mascot_voice_tone text not null default '';
