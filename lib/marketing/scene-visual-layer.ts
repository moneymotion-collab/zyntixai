import {
  getShowcaseVisualPreset,
  getShowcaseVisualPresetForAsset,
} from "@/lib/marketing/showcase-scene-visual-presets"
import { SHOWCASE_WORKFLOW_BEATS } from "@/lib/marketing/showcase-workflow-beats"
import {
  moduleToAssetKey,
  type FitCoreShowcaseAssetKey,
} from "@/lib/marketing/workflow-scene-asset-resolver"
import type { VideoScriptScene } from "@/lib/marketing/video-script-types"

export const SCENE_LAYOUT_STYLES = [
  "premium_saas",
  "glass_card",
  "floating_dashboard",
  "split_story",
  "dark_commercial",
] as const

export type SceneLayoutStyle = (typeof SCENE_LAYOUT_STYLES)[number]

export type NormalizedCropFocus = {
  /** Human-readable focus description */
  label: string
  /** Normalized focal point 0–1 */
  x: number
  y: number
}

export type NormalizedHighlightArea = {
  /** Human-readable element description */
  label: string
  /** Normalized bounding box 0–1 */
  x: number
  y: number
  width: number
  height: number
}

export type SceneVisualLayer = {
  crop_focus: string
  highlight_area: string
  blur_background: boolean
  zoom_level: number
  layout_style: SceneLayoutStyle
  crop: NormalizedCropFocus
  highlight: NormalizedHighlightArea
}

const LAYOUT_CYCLE: SceneLayoutStyle[] = [
  "premium_saas",
  "glass_card",
  "floating_dashboard",
  "split_story",
  "dark_commercial",
]

/** Default highlight regions per screenshot asset (normalized 0–1). */
const ASSET_HIGHLIGHT_PRESETS: Record<
  string,
  { x: number; y: number; width: number; height: number }
> = {
  dashboard: { x: 0.52, y: 0.22, width: 0.36, height: 0.14 },
  members: { x: 0.08, y: 0.28, width: 0.42, height: 0.16 },
  workouts: { x: 0.55, y: 0.18, width: 0.32, height: 0.12 },
  nutrition: { x: 0.5, y: 0.2, width: 0.34, height: 0.13 },
  sessions: { x: 0.12, y: 0.35, width: 0.38, height: 0.14 },
  "marketing-ai": { x: 0.1, y: 0.42, width: 0.45, height: 0.18 },
  "content-ideas": { x: 0.15, y: 0.3, width: 0.4, height: 0.15 },
  "video-generator": { x: 0.2, y: 0.38, width: 0.42, height: 0.16 },
  calendar: { x: 0.1, y: 0.25, width: 0.5, height: 0.2 },
  published: { x: 0.15, y: 0.32, width: 0.38, height: 0.14 },
  analytics: { x: 0.08, y: 0.28, width: 0.55, height: 0.22 },
  progress: { x: 0.12, y: 0.3, width: 0.44, height: 0.16 },
}

const FOCUS_KEYWORD_OFFSETS: Array<{
  pattern: RegExp
  box: { x: number; y: number; width: number; height: number }
}> = [
  {
    pattern: /sidebar|nav|menu/i,
    box: { x: 0.02, y: 0.15, width: 0.18, height: 0.5 },
  },
  {
    pattern: /header|top bar|navbar/i,
    box: { x: 0.15, y: 0.04, width: 0.7, height: 0.1 },
  },
  {
    pattern: /chart|graph|analytics|metric/i,
    box: { x: 0.08, y: 0.25, width: 0.55, height: 0.28 },
  },
  {
    pattern: /button|cta|create|add|assign/i,
    box: { x: 0.55, y: 0.16, width: 0.32, height: 0.12 },
  },
  {
    pattern: /list|table|row|member/i,
    box: { x: 0.1, y: 0.3, width: 0.45, height: 0.2 },
  },
  {
    pattern: /calendar|schedule|session/i,
    box: { x: 0.1, y: 0.22, width: 0.5, height: 0.25 },
  },
  {
    pattern: /editor|builder|form|input/i,
    box: { x: 0.2, y: 0.2, width: 0.55, height: 0.35 },
  },
]

export function parseSceneLayoutStyle(value: unknown): SceneLayoutStyle {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, "_")
    if (SCENE_LAYOUT_STYLES.includes(normalized as SceneLayoutStyle)) {
      return normalized as SceneLayoutStyle
    }
  }
  return "premium_saas"
}

export function clampZoomLevel(
  value: unknown,
  fallback = 1.1,
  max = 1.25,
): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseFloat(value)
        : Number.NaN

  if (!Number.isFinite(parsed)) return fallback
  return Math.min(max, Math.max(1.05, Math.round(parsed * 100) / 100))
}

export function parseBlurBackground(
  value: unknown,
  fallback = true,
): boolean {
  if (typeof value === "boolean") return value
  if (typeof value === "string") {
    const lower = value.trim().toLowerCase()
    if (lower === "true" || lower === "yes" || lower === "1") return true
    if (lower === "false" || lower === "no" || lower === "0") return false
  }
  return fallback
}

function inferHighlightBox(
  assetKey: string | undefined,
  uiFocusArea: string | undefined,
  highlightLabel: string,
): { x: number; y: number; width: number; height: number } {
  const combined = `${uiFocusArea ?? ""} ${highlightLabel}`.trim()

  for (const rule of FOCUS_KEYWORD_OFFSETS) {
    if (rule.pattern.test(combined)) {
      return rule.box
    }
  }

  if (assetKey && ASSET_HIGHLIGHT_PRESETS[assetKey]) {
    return ASSET_HIGHLIGHT_PRESETS[assetKey]
  }

  return { x: 0.35, y: 0.3, width: 0.3, height: 0.14 }
}

function boxToCropFocus(box: {
  x: number
  y: number
  width: number
  height: number
}): { x: number; y: number } {
  return {
    x: box.x + box.width / 2,
    y: box.y + box.height / 2,
  }
}

function zoomFromCameraMotion(cameraMotion: string | undefined): number {
  const motion = (cameraMotion ?? "").toLowerCase()
  if (motion.includes("punch") || motion.includes("quick zoom")) return 1.22
  if (motion.includes("push") || motion.includes("dolly")) return 1.18
  if (motion.includes("slow zoom") || motion.includes("ken burns")) return 1.12
  if (motion.includes("pan")) return 1.08
  return 1.1
}

function defaultBlurForLayout(layout: SceneLayoutStyle): boolean {
  return (
    layout === "glass_card" ||
    layout === "floating_dashboard" ||
    layout === "dark_commercial"
  )
}

function defaultLayoutForIndex(index: number): SceneLayoutStyle {
  return LAYOUT_CYCLE[index % LAYOUT_CYCLE.length]
}

function buildCropFocusLabel(
  uiFocusArea: string | undefined,
  assetKey: string | undefined,
): string {
  if (uiFocusArea?.trim()) {
    return `Center on ${uiFocusArea.trim()}`
  }
  if (assetKey) {
    return `Emphasize primary action on ${assetKey.replace(/-/g, " ")} screen`
  }
  return "Center on primary UI action area"
}

export type SceneVisualLayerInput = {
  crop_focus?: string
  highlight_area?: string
  blur_background?: boolean
  zoom_level?: number
  layout_style?: SceneLayoutStyle | string
  ui_focus_area?: string
  camera_motion?: string
  asset_key?: string
  workflow_step?: string
  module?: string
}

export function deriveSceneVisualLayer(
  scene: SceneVisualLayerInput,
  index = 0,
): SceneVisualLayer {
  const preset =
    getShowcaseVisualPreset({
      module: scene.module,
      asset_key: scene.asset_key,
    }) ?? getShowcaseVisualPresetForAsset(scene.asset_key)

  const layout_style = scene.layout_style
    ? parseSceneLayoutStyle(scene.layout_style)
    : preset?.layout_style ?? defaultLayoutForIndex(index)

  const uiFocusArea = scene.ui_focus_area?.trim()

  const highlight_area =
    scene.highlight_area?.trim() ||
    uiFocusArea ||
    preset?.highlight_area ||
    "Primary action button"

  const crop_focus =
    scene.crop_focus?.trim() ||
    (uiFocusArea ? buildCropFocusLabel(uiFocusArea, scene.asset_key) : "") ||
    preset?.crop_focus ||
    buildCropFocusLabel(scene.ui_focus_area, scene.asset_key) ||
    "Center on primary UI action area"

  const highlightBox =
    preset?.highlight ??
    inferHighlightBox(scene.asset_key, scene.ui_focus_area, highlight_area)
  const cropPoint = boxToCropFocus(highlightBox)

  return {
    crop_focus,
    highlight_area,
    blur_background:
      scene.blur_background !== undefined
        ? parseBlurBackground(scene.blur_background, preset?.blur_background)
        : preset?.blur_background ?? defaultBlurForLayout(layout_style),
    zoom_level: clampZoomLevel(
      scene.zoom_level ?? preset?.zoom_level,
      preset?.zoom_level ?? zoomFromCameraMotion(scene.camera_motion),
    ),
    layout_style,
    crop: {
      label: crop_focus,
      x: cropPoint.x,
      y: cropPoint.y,
    },
    highlight: {
      label: highlight_area,
      ...highlightBox,
    },
  }
}

/** Generate the full professional visual layer for a showcase scene. */
export function generateSceneVisualLayer(
  scene: SceneVisualLayerInput,
  index = 0,
): SceneVisualLayer {
  return deriveSceneVisualLayer(scene, index)
}

export function enrichSceneWithVisualLayer(
  scene: VideoScriptScene,
  index: number,
): VideoScriptScene {
  const layer = deriveSceneVisualLayer(scene, index)
  return {
    ...scene,
    crop_focus: layer.crop_focus,
    highlight_area: layer.highlight_area,
    blur_background: layer.blur_background,
    zoom_level: layer.zoom_level,
    layout_style: layer.layout_style,
  }
}

export function enrichScenesWithVisualLayer(
  scenes: VideoScriptScene[],
): VideoScriptScene[] {
  return scenes.map(enrichSceneWithVisualLayer)
}

export function getLayoutBackgroundGradient(
  layout: SceneLayoutStyle,
  sceneIndex = 0,
): string {
  const palettes: Record<SceneLayoutStyle, [string, string, string]> = {
    premium_saas: ["#0f172a", "#1e1b4b", "#312e81"],
    glass_card: ["#0c1222", "#1a2744", "#0f3460"],
    floating_dashboard: ["#111827", "#1f2937", "#374151"],
    split_story: ["#0a0a0f", "#18181b", "#27272a"],
    dark_commercial: ["#030712", "#0f172a", "#1e1b4b"],
  }

  const [a, b, c] = palettes[layout]
  const angle = 135 + (sceneIndex % 3) * 15
  return `linear-gradient(${angle}deg, ${a} 0%, ${b} 55%, ${c} 100%)`
}

export function buildVisualLayerDirectorRules(): string {
  return `Professional visual layer (REQUIRED for every scene):
- crop_focus: describe which part of the screenshot to emphasize (e.g. "Center on Create Workout button in top-right toolbar")
- highlight_area: exact UI element to visually highlight (e.g. "Create Workout Plan button")
- blur_background: true or false — use true for glass_card and floating_dashboard layouts
- zoom_level: number between 1.05 and 1.25 — subtle Ken Burns zoom on the UI (1.05 = subtle, 1.25 = punch-in)
- layout_style: one of ${SCENE_LAYOUT_STYLES.join(", ")} — vary across scenes for commercial polish
  - premium_saas: browser chrome frame, gradient backdrop, headline overlay
  - glass_card: frosted glass card with blurred ambient background
  - floating_dashboard: elevated dashboard card with soft shadow
  - split_story: headline band on top, framed UI below
  - dark_commercial: cinematic dark backdrop, high-contrast UI frame, dramatic vignette

Composition rules (never violate):
- Never show raw full-page screenshots without a device/browser frame, gradient backdrop, headline overlay, and UI highlight
- Wrap every screenshot in premium browser chrome with app.fitcorecoach.com URL bar
- Add overlay headline text (overlay_text) on a gradient scrim or split-story band
- Add subtle indigo gradient background behind the framed UI
- Highlight the important UI area with a pulsing cyan focus ring
- Use zoom/crop to focus on the action — zoom_level 1.05–1.25 with object-position on crop focal point
- Keep layout clean and commercial — alternate layout_style across scenes`
}

export function visualLayerFromAssetKey(
  assetKey: FitCoreShowcaseAssetKey | string,
  index: number,
): Pick<
  SceneVisualLayer,
  "layout_style" | "blur_background" | "zoom_level"
> {
  const preset = getShowcaseVisualPresetForAsset(assetKey)
  if (preset) {
    return {
      layout_style: preset.layout_style,
      blur_background: preset.blur_background,
      zoom_level: preset.zoom_level,
    }
  }

  const layout_style = defaultLayoutForIndex(index)
  return {
    layout_style,
    blur_background: defaultBlurForLayout(layout_style),
    zoom_level: 1.1 + (index % 3) * 0.04,
  }
}

/** Per-scene visual layer spec for the 7-scene app showcase tour. */
export type ShowcaseSceneVisualSpec = {
  sceneIndex: number
  module: string
  asset_key: string
  crop_focus: string
  highlight_area: string
  blur_background: boolean
  zoom_level: number
  layout_style: SceneLayoutStyle
}

/** Generate curated visual layer metadata for every app showcase scene. */
export function buildShowcaseVisualLayerCatalog(): ShowcaseSceneVisualSpec[] {
  return SHOWCASE_WORKFLOW_BEATS.map((beat, index) => {
    const asset_key = moduleToAssetKey(beat.module) ?? beat.module.toLowerCase()
    const layer = deriveSceneVisualLayer(
      {
        module: beat.module,
        asset_key,
        ui_focus_area: beat.purpose.split(" — ")[0],
        camera_motion: beat.cameraMotion,
      },
      index,
    )

    return {
      sceneIndex: index,
      module: beat.module,
      asset_key,
      crop_focus: layer.crop_focus,
      highlight_area: layer.highlight_area,
      blur_background: layer.blur_background,
      zoom_level: layer.zoom_level,
      layout_style: layer.layout_style,
    }
  })
}

export const PROFESSIONAL_VISUAL_LAYER_RULES = {
  neverPlainScreenshot: true,
  requireBrowserFrame: true,
  requireHeadlineOverlay: true,
  requireBackgroundGradient: true,
  requireUiHighlight: true,
  zoomRange: { min: 1.05, max: 1.25 },
  layoutStyles: SCENE_LAYOUT_STYLES,
} as const
