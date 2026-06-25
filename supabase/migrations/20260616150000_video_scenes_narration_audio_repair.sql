-- Repair: ensure per-scene narration audio columns exist on video_scenes.

alter table public.video_scenes
  add column if not exists narration_audio_url text,
  add column if not exists audio_status text not null default 'pending';
