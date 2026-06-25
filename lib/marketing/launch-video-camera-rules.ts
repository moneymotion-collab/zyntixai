/**
 * Camera rules for marketing launch videos.
 * Enforces readable full-screen UI, slow deliberate movement, and metric-focused framing.
 */

export const LAUNCH_VIDEO_ZOOM_LEVEL = 1.06
export const LAUNCH_VIDEO_MIN_ZOOM_LEVEL = 1.05
export const LAUNCH_VIDEO_MAX_ZOOM_LEVEL = 1.08

export const LAUNCH_VIDEO_ALLOWED_CAMERA_MOTIONS = [
  "slow zoom in",
  "lateral pan",
  "pull back reveal",
] as const

export type LaunchVideoCameraMotion =
  (typeof LAUNCH_VIDEO_ALLOWED_CAMERA_MOTIONS)[number]

export const LAUNCH_VIDEO_CAMERA_RULES = [
  {
    id: "no_extreme_zoom",
    rule: "No extreme zoom",
    detail:
      "Use slow zoom only (zoom_level 1.05–1.08). Never punch in past 1.08 or crop so tightly that UI context is lost.",
  },
  {
    id: "no_blurry_text",
    rule: "No blurry text",
    detail:
      "Keep all UI copy, labels, metrics, and badges sharp and legible. blur_background must be false on product UI scenes.",
  },
  {
    id: "no_random_movement",
    rule: "No random movement",
    detail:
      'No orbit pan, tracking follow, whip pans, or aggressive push-ins. Use only: "slow zoom in", "lateral pan", or "pull back reveal".',
  },
  {
    id: "full_screen_first",
    rule: "Show full screen first",
    detail:
      "Open every product scene with the full interface visible, then move slowly toward the focal element.",
  },
  {
    id: "slow_zoom_only",
    rule: "Slow zoom only",
    detail:
      "All zoom must be gradual and coach-paced. animation_type should be \"slow_zoom\" unless the scene is a CTA lockup.",
  },
  {
    id: "focus_cards_metrics",
    rule: "Focus on cards and metrics",
    detail:
      "Highlight KPI cards, idea cards, viral scores, calendar chips, pipeline statuses, and chart values — not paragraph text or hashtags.",
  },
  {
    id: "keep_text_visible",
    rule: "Keep all important text visible",
    detail:
      "Never crop or zoom in a way that hides headlines, labels, day numbers, post titles, or status badges.",
  },
] as const

export type LaunchVideoCameraRule = (typeof LAUNCH_VIDEO_CAMERA_RULES)[number]

export type BuildLaunchVideoCameraRulesOptions = {
  title?: string
  extraRules?: readonly string[]
}

export function formatLaunchVideoCameraRules(
  options: BuildLaunchVideoCameraRulesOptions = {},
): string {
  const title =
    options.title?.trim() || "Launch video — camera & composition rules (STRICT)"

  const coreRules = LAUNCH_VIDEO_CAMERA_RULES.map(
    (entry) => `- ${entry.rule}: ${entry.detail}`,
  )

  const extraRules = (options.extraRules ?? [])
    .map((rule) => rule.trim())
    .filter(Boolean)
    .map((rule) => `- ${rule}`)

  return [title, ...coreRules, ...extraRules].join("\n")
}

/** Default director prompt block for any launch campaign video. */
export const LAUNCH_VIDEO_CAMERA_RULES_TEXT = formatLaunchVideoCameraRules()

export function isAllowedLaunchCameraMotion(motion: string): boolean {
  const normalized = motion.trim().toLowerCase()
  return LAUNCH_VIDEO_ALLOWED_CAMERA_MOTIONS.some(
    (allowed) => allowed === normalized,
  )
}

export function clampLaunchZoomLevel(zoom: number): number {
  return Math.min(
    LAUNCH_VIDEO_MAX_ZOOM_LEVEL,
    Math.max(LAUNCH_VIDEO_MIN_ZOOM_LEVEL, zoom),
  )
}
