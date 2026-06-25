-- Align brand_profiles text column defaults with migration schema.

alter table public.brand_profiles
  alter column name set default '',
  alter column niche set default '',
  alter column target_audience set default '',
  alter column tone_of_voice set default '',
  alter column mascot_name set default '',
  alter column mascot_description set default '',
  alter column mascot_style set default '',
  alter column mascot_voice_tone set default '';

update public.brand_profiles
set
  name = coalesce(name, ''),
  niche = coalesce(niche, ''),
  target_audience = coalesce(target_audience, ''),
  tone_of_voice = coalesce(tone_of_voice, ''),
  mascot_name = coalesce(mascot_name, ''),
  mascot_description = coalesce(mascot_description, ''),
  mascot_style = coalesce(mascot_style, ''),
  mascot_voice_tone = coalesce(mascot_voice_tone, '');

alter table public.brand_profiles
  alter column name set not null,
  alter column niche set not null,
  alter column target_audience set not null,
  alter column tone_of_voice set not null,
  alter column mascot_name set not null,
  alter column mascot_description set not null,
  alter column mascot_style set not null,
  alter column mascot_voice_tone set not null;
