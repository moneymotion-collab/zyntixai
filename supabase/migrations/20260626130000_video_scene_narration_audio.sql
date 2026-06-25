-- TTS voiceover output per scene (OpenAI speech API).

alter table public.video_scenes
  add column if not exists narration_audio_url text,
  add column if not exists audio_status text not null default 'pending';
