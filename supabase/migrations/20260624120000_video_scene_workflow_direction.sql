-- Professional workflow direction fields for app showcase / SaaS demo scenes.

alter table public.video_scenes
  add column if not exists ui_focus_area text,
  add column if not exists cursor_action text,
  add column if not exists overlay_text text,
  add column if not exists narration text,
  add column if not exists professional_purpose text;
