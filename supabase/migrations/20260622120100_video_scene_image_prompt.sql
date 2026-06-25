alter table public.video_scenes
  add column if not exists image_prompt text not null default '';

update public.video_scenes
set image_prompt = visual
where image_prompt = ''
  and visual is not null
  and visual <> '';
