import type { VideoStyle } from "@/lib/marketing/video-styles"
import type { SceneLayoutStyle } from "@/lib/marketing/scene-visual-layer"

export type VideoScriptScene = {
  text: string
  visual: string
  /** Detailed DALL·E / image-model prompt for the Visual Engine */
  image_prompt: string
  camera_motion: string
  transition: string
  duration: number
  /** Workflow intelligence: snake_case step id (e.g. dashboard, workout_builder) */
  workflow_step?: string
  /** SaaS showcase: narrative beat label (e.g. "Morning command center") */
  story_beat?: string
  /** SaaS showcase: platform module name (e.g. "Dashboard") */
  module?: string
  /** SaaS showcase: mascot gestures and on-screen actions */
  character_action?: string
  /** App showcase: mapped FitCore screenshot key (e.g. dashboard) */
  asset_key?: string
  /** App showcase: public URL to the mapped screenshot */
  asset_url?: string
  /** Workflow director: UI element to highlight */
  ui_focus_area?: string
  /** Workflow director: cursor/mouse action direction */
  cursor_action?: string
  /** Workflow director: short on-screen headline */
  overlay_text?: string
  /** Workflow director: voiceover narration line */
  narration?: string
  /** Workflow director: why this scene matters in the demo */
  professional_purpose?: string
  /** Visual layer: which part of the screenshot to emphasize */
  crop_focus?: string
  /** Visual layer: UI element to visually highlight */
  highlight_area?: string
  /** Visual layer: blur ambient background behind framed UI */
  blur_background?: boolean
  /** Visual layer: Ken Burns zoom level (1.05–1.25) */
  zoom_level?: number
  /** Visual layer: premium layout preset */
  layout_style?: SceneLayoutStyle | string
  /** Scene animation: camera motion preset for Remotion render */
  animation_type?: string
  /** Scene animation: duration in seconds (2–4) */
  animation_duration?: number
  /** Scene animation: on-screen caption placement */
  caption_position?: string
  /** Scene animation: UI highlight treatment */
  highlight_style?: string
  /** Public URL for AI-generated or uploaded scene image */
  image_url?: string
  imageUrl?: string
  /** App screenshot URL (showcase / capture) */
  screenshot_url?: string
  /** Human-readable visual direction for fallback card copy */
  visual_description?: string
  image_status?: string
  narrationAudioUrl?: string
  audio_status?: string
}

export type VideoScriptMascot = {
  name: string
  description: string
  style: string
  personality: string
}

export type VideoScript = {
  hook: string
  scenes: VideoScriptScene[]
  cta: string
  style: VideoStyle | string
  /** Selected workflow type from Workflow Intelligence Engine */
  workflow_type?: string
  /** Human-readable workflow purpose and scene path */
  workflow_summary?: string
  thumbnail_title: string
  thumbnail_text: string
  thumbnail_visual: string
  mascot?: VideoScriptMascot
  musicMood?: string
  caption?: string
  hashtags?: string[]
}

export type MarketingVideo = {
  id: string
  user_id: string
  brand_name: string
  prompt: string
  platform: string
  status: MarketingVideoStatus
  hook: string | null
  cta: string | null
  style: string | null
  music_mood: string | null
  thumbnail_title?: string | null
  thumbnail_text?: string | null
  thumbnail_visual?: string | null
  thumbnail_url: string | null
  render_status: string
  render_error?: string | null
  render_started_at?: string | null
  render_finished_at?: string | null
  video_url: string | null
  final_render_status?: string
  final_render_url?: string | null
  final_render_error?: string | null
  voiceover_status?: string | null
  voiceover_url?: string | null
  voiceover_script?: string | null
  content_post_id: string | null
  created_at: string
  updated_at: string
}

export const MARKETING_VIDEO_STATUSES = [
  "draft",
  "processing",
  "completed",
  "ready",
  "failed",
  "scheduled",
  "published",
] as const

export type MarketingVideoStatus = (typeof MARKETING_VIDEO_STATUSES)[number]

export function isMarketingVideoStatus(
  value: string,
): value is MarketingVideoStatus {
  return MARKETING_VIDEO_STATUSES.includes(value as MarketingVideoStatus)
}
