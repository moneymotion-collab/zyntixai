-- Project-level voiceover generation (OpenAI TTS + Supabase Storage).

alter table public.video_projects
  add column if not exists voiceover_status text not null default 'pending',
  add column if not exists voiceover_url text,
  add column if not exists voiceover_script text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'voiceovers',
  'voiceovers',
  true,
  52428800,
  array['audio/mpeg', 'audio/mp3', 'audio/wav']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
