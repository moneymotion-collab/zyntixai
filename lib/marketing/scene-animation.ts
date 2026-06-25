import type { VideoScriptScene } from "@/lib/marketing/video-script-types"

export const SCENE_ANIMATION_TYPES = [
  "slow_zoom",
  "zoom_highlight",
  "pan_left",
  "pan_right",
  "slide_up",
  "split_reveal",
  "dashboard_focus",
] as const

export const SCENE_CAPTION_POSITIONS = ["top", "middle", "bottom"] as const

export const SCENE_HIGHLIGHT_STYLES = [
  "pulse",
  "glow",
  "border",
  "spotlight",
] as const

export type SceneAnimationType = (typeof SCENE_ANIMATION_TYPES)[number]
export type SceneCaptionPosition = (typeof SCENE_CAPTION_POSITIONS)[number]
export type SceneHighlightStyle = (typeof SCENE_HIGHLIGHT_STYLES)[number]

export type SceneAnimationInstructions = {
  animation_type: SceneAnimationType
  animation_duration: number
  caption_position: SceneCaptionPosition
  highlight_style: SceneHighlightStyle
}

export type SceneAnimationInput = {
  index?: number
  totalScenes?: number
  workflow_step?: string
  asset_key?: string
  layout_style?: string
  cursor_action?: string
  overlay_text?: string
  visual?: string
  story_beat?: string
  professional_purpose?: string
  animation_type?: string
  animation_duration?: number
  caption_position?: string
  highlight_style?: string
}

const UI_ACTION_WORKFLOW_STEPS = new Set([
  "workout_builder",
  "assign_workout",
  "nutrition_builder",
  "assign_nutrition",
  "sessions",
  "marketing_ai",
  "content_ideas",
  "video_generator",
])

const OVERVIEW_WORKFLOW_STEPS = new Set([
  "members",
  "published",
  "calendar",
  "recommendations",
  "workouts",
  "nutrition",
])

const SPLIT_REVEAL_PATTERN =
  /\b(before\/after|before and after|transformation|split reveal|split-screen|compare|versus|vs\.)\b/i

const UI_ACTION_CURSOR_PATTERN =
  /\b(click|tap|drag|select|hover|type|assign|create|open|highlight|drop|submit)\b/i

function normalizeToken(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "_")
}

export function parseSceneAnimationType(value: unknown): SceneAnimationType | "" {
  if (typeof value !== "string") return ""
  const normalized = normalizeToken(value)
  return SCENE_ANIMATION_TYPES.includes(normalized as SceneAnimationType)
    ? (normalized as SceneAnimationType)
    : ""
}

export function parseSceneCaptionPosition(
  value: unknown,
): SceneCaptionPosition | "" {
  if (typeof value !== "string") return ""
  const normalized = value.trim().toLowerCase()
  return SCENE_CAPTION_POSITIONS.includes(normalized as SceneCaptionPosition)
    ? (normalized as SceneCaptionPosition)
    : ""
}

export function parseSceneHighlightStyle(value: unknown): SceneHighlightStyle | "" {
  if (typeof value !== "string") return ""
  const normalized = value.trim().toLowerCase()
  return SCENE_HIGHLIGHT_STYLES.includes(normalized as SceneHighlightStyle)
    ? (normalized as SceneHighlightStyle)
    : ""
}

export function clampAnimationDuration(
  value: number | undefined,
  fallback = 3,
): number {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.min(4, Math.max(2, Math.round(value)))
  }
  return Math.min(4, Math.max(2, Math.round(fallback)))
}

function sceneHaystack(input: SceneAnimationInput): string {
  return [
    input.overlay_text,
    input.visual,
    input.story_beat,
    input.professional_purpose,
    input.cursor_action,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
}

function isSplitRevealScene(input: SceneAnimationInput): boolean {
  if (normalizeToken(input.layout_style ?? "") === "split_story") {
    return true
  }
  return SPLIT_REVEAL_PATTERN.test(sceneHaystack(input))
}

function isDashboardScene(input: SceneAnimationInput): boolean {
  const step = normalizeToken(input.workflow_step ?? "")
  const asset = normalizeToken(input.asset_key ?? "").replace(/-/g, "_")
  return step === "dashboard" || asset === "dashboard"
}

function isAnalyticsScene(input: SceneAnimationInput): boolean {
  const step = normalizeToken(input.workflow_step ?? "")
  const asset = normalizeToken(input.asset_key ?? "").replace(/-/g, "_")
  return step === "analytics" || asset === "analytics"
}

function isUiActionScene(input: SceneAnimationInput): boolean {
  const step = normalizeToken(input.workflow_step ?? "")
  if (step && UI_ACTION_WORKFLOW_STEPS.has(step)) {
    return true
  }
  return UI_ACTION_CURSOR_PATTERN.test(input.cursor_action ?? "")
}

function isOverviewScene(input: SceneAnimationInput): boolean {
  const step = normalizeToken(input.workflow_step ?? "")
  return step ? OVERVIEW_WORKFLOW_STEPS.has(step) : false
}

function isFinaleScene(input: SceneAnimationInput): boolean {
  if (
    typeof input.index === "number" &&
    typeof input.totalScenes === "number" &&
    input.totalScenes > 0
  ) {
    return input.index === input.totalScenes - 1
  }
  return false
}

function resolveAnimationType(input: SceneAnimationInput): SceneAnimationType {
  if (isSplitRevealScene(input)) return "split_reveal"
  if (isDashboardScene(input)) {
    return (input.index ?? 0) % 2 === 0 ? "pan_left" : "pan_right"
  }
  if (isAnalyticsScene(input)) return "dashboard_focus"
  if (isUiActionScene(input)) return "zoom_highlight"
  if (isFinaleScene(input)) return "slide_up"
  if (isOverviewScene(input)) return "slow_zoom"
  return "slow_zoom"
}

function resolveCaptionPosition(
  animationType: SceneAnimationType,
): SceneCaptionPosition {
  switch (animationType) {
    case "split_reveal":
      return "middle"
    case "zoom_highlight":
    case "slide_up":
      return "bottom"
    case "slow_zoom":
    case "pan_left":
    case "pan_right":
    case "dashboard_focus":
    default:
      return "top"
  }
}

function resolveHighlightStyle(
  animationType: SceneAnimationType,
): SceneHighlightStyle {
  switch (animationType) {
    case "zoom_highlight":
      return "pulse"
    case "pan_left":
    case "pan_right":
    case "slide_up":
      return "glow"
    case "slow_zoom":
      return "border"
    case "dashboard_focus":
    case "split_reveal":
      return "spotlight"
    default:
      return "glow"
  }
}

function resolveAnimationDuration(animationType: SceneAnimationType): number {
  switch (animationType) {
    case "zoom_highlight":
      return 2
    case "split_reveal":
      return 4
    case "slow_zoom":
    case "dashboard_focus":
      return 3
    case "pan_left":
    case "pan_right":
      return 3
    case "slide_up":
      return 3
    default:
      return 3
  }
}

export function deriveSceneAnimation(
  input: SceneAnimationInput,
): SceneAnimationInstructions {
  const animation_type =
    parseSceneAnimationType(input.animation_type) || resolveAnimationType(input)
  const animation_duration = clampAnimationDuration(
    input.animation_duration,
    resolveAnimationDuration(animation_type),
  )
  const caption_position =
    parseSceneCaptionPosition(input.caption_position) ||
    resolveCaptionPosition(animation_type)
  const highlight_style =
    parseSceneHighlightStyle(input.highlight_style) ||
    resolveHighlightStyle(animation_type)

  return {
    animation_type,
    animation_duration,
    caption_position,
    highlight_style,
  }
}

export function enrichSceneWithAnimation(
  scene: VideoScriptScene,
  index = 0,
  totalScenes?: number,
): VideoScriptScene {
  const animation = deriveSceneAnimation({
    index,
    totalScenes,
    workflow_step: scene.workflow_step,
    asset_key: scene.asset_key,
    layout_style: scene.layout_style,
    cursor_action: scene.cursor_action,
    overlay_text: scene.overlay_text ?? scene.text,
    visual: scene.visual,
    story_beat: scene.story_beat,
    professional_purpose: scene.professional_purpose,
    animation_type: scene.animation_type,
    animation_duration: scene.animation_duration,
    caption_position: scene.caption_position,
    highlight_style: scene.highlight_style,
  })

  return {
    ...scene,
    ...animation,
  }
}

export function enrichScenesWithAnimation(
  scenes: VideoScriptScene[],
): VideoScriptScene[] {
  return scenes.map((scene, index) =>
    enrichSceneWithAnimation(scene, index, scenes.length),
  )
}

export function buildSceneAnimationDirectorRules(): string {
  return `Scene animation instructions (REQUIRED for every app_showcase, saas_demo, and workflow scene):
- animation_type: one of ${SCENE_ANIMATION_TYPES.join(", ")}
- animation_duration: integer seconds between 2 and 4
- caption_position: one of ${SCENE_CAPTION_POSITIONS.join(", ")}
- highlight_style: one of ${SCENE_HIGHLIGHT_STYLES.join(", ")}

Animation selection rules:
- Use zoom_highlight for UI action scenes (clicks, drags, form fills, builder steps)
- Use slow_zoom for overview scenes (member lists, published content, module browsing)
- Use pan_left or pan_right for dashboard scenes — alternate direction across scenes
- Use split_reveal for before/after or transformation scenes
- Use dashboard_focus for analytics and KPI dashboard scenes
- Use slide_up for finale or CTA beats
- Keep animation_duration between 2 and 4 seconds`
}
