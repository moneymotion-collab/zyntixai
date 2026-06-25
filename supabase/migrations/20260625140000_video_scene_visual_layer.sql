-- Professional visual layer metadata per scene (crop, highlight, layout)
ALTER TABLE public.video_scenes
  ADD COLUMN IF NOT EXISTS crop_focus text,
  ADD COLUMN IF NOT EXISTS highlight_area text,
  ADD COLUMN IF NOT EXISTS blur_background boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS zoom_level numeric(4, 2) DEFAULT 1.10,
  ADD COLUMN IF NOT EXISTS layout_style text DEFAULT 'premium_saas';

COMMENT ON COLUMN public.video_scenes.crop_focus IS 'Which part of the screenshot to emphasize';
COMMENT ON COLUMN public.video_scenes.highlight_area IS 'UI element to visually highlight';
COMMENT ON COLUMN public.video_scenes.blur_background IS 'Whether to blur ambient background behind framed UI';
COMMENT ON COLUMN public.video_scenes.zoom_level IS 'Ken Burns zoom level (1.05–1.25)';
COMMENT ON COLUMN public.video_scenes.layout_style IS 'Premium layout preset: premium_saas, glass_card, floating_dashboard, split_story';
