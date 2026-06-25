import type { PlatformModule } from "@/lib/marketing/showcase-workflow-beats"
import type { SceneLayoutStyle } from "@/lib/marketing/scene-visual-layer"
import type { FitCoreShowcaseAssetKey } from "@/lib/marketing/workflow-scene-asset-resolver"

export type ShowcaseVisualPreset = {
  crop_focus: string
  highlight_area: string
  blur_background: boolean
  zoom_level: number
  layout_style: SceneLayoutStyle
  highlight: { x: number; y: number; width: number; height: number }
}

/** Curated premium SaaS visual layer per platform showcase module. */
export const SHOWCASE_MODULE_VISUAL_PRESETS: Record<
  PlatformModule,
  ShowcaseVisualPreset
> = {
  Dashboard: {
    crop_focus: "Full-screen dashboard — hold wide, then slow zoom toward KPI cards",
    highlight_area: "KPI cards",
    blur_background: false,
    zoom_level: 1.06,
    layout_style: "premium_saas",
    highlight: { x: 0.48, y: 0.16, width: 0.44, height: 0.2 },
  },
  Members: {
    crop_focus: "Focus on the member list with profile cards and status badges",
    highlight_area: "Active member row with goals and status badge",
    blur_background: true,
    zoom_level: 1.1,
    layout_style: "glass_card",
    highlight: { x: 0.08, y: 0.28, width: 0.44, height: 0.18 },
  },
  Workouts: {
    crop_focus: "Emphasize the workout plan editor toolbar and exercise blocks",
    highlight_area: "Create Workout Plan button",
    blur_background: true,
    zoom_level: 1.18,
    layout_style: "floating_dashboard",
    highlight: { x: 0.55, y: 0.14, width: 0.34, height: 0.12 },
  },
  Nutrition: {
    crop_focus: "Center on macro rings and meal template cards in the plan workspace",
    highlight_area: "Macro target rings and meal template drop zone",
    blur_background: true,
    zoom_level: 1.14,
    layout_style: "glass_card",
    highlight: { x: 0.48, y: 0.22, width: 0.36, height: 0.2 },
  },
  "Progress Tracking": {
    crop_focus: "Focus on member progress charts and milestone badges",
    highlight_area: "Progress trend chart and completion badge",
    blur_background: true,
    zoom_level: 1.14,
    layout_style: "glass_card",
    highlight: { x: 0.1, y: 0.28, width: 0.48, height: 0.2 },
  },
  Sessions: {
    crop_focus: "Focus on the sessions calendar grid with booked time blocks",
    highlight_area: "Session slot being dragged onto the calendar",
    blur_background: false,
    zoom_level: 1.1,
    layout_style: "premium_saas",
    highlight: { x: 0.12, y: 0.24, width: 0.52, height: 0.24 },
  },
  "Marketing AI": {
    crop_focus: "Center on the AI content generation panel and calendar preview",
    highlight_area: "Generate content button and AI copy output",
    blur_background: true,
    zoom_level: 1.15,
    layout_style: "split_story",
    highlight: { x: 0.1, y: 0.38, width: 0.46, height: 0.2 },
  },
  Analytics: {
    crop_focus:
      "Full-screen analytics — slow reveal on growth metrics and trend charts",
    highlight_area: "Growth metrics and charts",
    blur_background: false,
    zoom_level: 1.06,
    layout_style: "premium_saas",
    highlight: { x: 0.06, y: 0.2, width: 0.62, height: 0.28 },
  },
  "AI Coach": {
    crop_focus: "Center on the AI coaching chat panel and suggested workout prompts",
    highlight_area: "AI coach reply and recommended next action",
    blur_background: true,
    zoom_level: 1.12,
    layout_style: "split_story",
    highlight: { x: 0.12, y: 0.32, width: 0.5, height: 0.22 },
  },
}

/** Asset-key presets for workflow-specific screenshots beyond the 7-module tour. */
export const ASSET_VISUAL_PRESETS: Partial<
  Record<FitCoreShowcaseAssetKey, ShowcaseVisualPreset>
> = {
  dashboard: SHOWCASE_MODULE_VISUAL_PRESETS.Dashboard,
  members: SHOWCASE_MODULE_VISUAL_PRESETS.Members,
  workouts: SHOWCASE_MODULE_VISUAL_PRESETS.Workouts,
  nutrition: SHOWCASE_MODULE_VISUAL_PRESETS.Nutrition,
  sessions: SHOWCASE_MODULE_VISUAL_PRESETS.Sessions,
  "marketing-ai": SHOWCASE_MODULE_VISUAL_PRESETS["Marketing AI"],
  analytics: SHOWCASE_MODULE_VISUAL_PRESETS.Analytics,
  "marketing-ai-idea-cards": {
    crop_focus:
      "Full-screen content ideas grid — center on populated AI-generated idea cards",
    highlight_area: "Generated ideas",
    blur_background: false,
    zoom_level: 1.06,
    layout_style: "premium_saas",
    highlight: { x: 0.12, y: 0.24, width: 0.5, height: 0.28 },
  },
  "marketing-ai-idea-generator-selected": {
    crop_focus:
      "Full-screen viral score panel — gentle zoom on score card and progress bars",
    highlight_area: "Score card and progress bars",
    blur_background: false,
    zoom_level: 1.06,
    layout_style: "premium_saas",
    highlight: { x: 0.1, y: 0.2, width: 0.55, height: 0.32 },
  },
  "marketing-ai-calendar-scheduled": {
    crop_focus:
      "Full-screen monthly calendar — slow zoom across the planned month grid",
    highlight_area: "Planned month",
    blur_background: false,
    zoom_level: 1.06,
    layout_style: "premium_saas",
    highlight: { x: 0.08, y: 0.18, width: 0.58, height: 0.3 },
  },
  "marketing-ai-calendar-draft": {
    crop_focus:
      "Full-screen scheduled posts view — highlight the publishing pipeline cards",
    highlight_area: "Publishing pipeline",
    blur_background: false,
    zoom_level: 1.06,
    layout_style: "premium_saas",
    highlight: { x: 0.1, y: 0.22, width: 0.52, height: 0.28 },
  },
  "video-generator": {
    crop_focus: "Focus on the video script editor and generation controls",
    highlight_area: "Generate video script button",
    blur_background: true,
    zoom_level: 1.16,
    layout_style: "split_story",
    highlight: { x: 0.18, y: 0.34, width: 0.44, height: 0.16 },
  },
  calendar: {
    crop_focus: "Full-screen monthly calendar grid with scheduled post chips",
    highlight_area: "Scheduled post chips on the week view",
    blur_background: false,
    zoom_level: 1.06,
    layout_style: "premium_saas",
    highlight: { x: 0.08, y: 0.18, width: 0.58, height: 0.3 },
  },
  published: {
    crop_focus: "Full-screen scheduled post cards with pipeline status badges",
    highlight_area: "Post cards with Draft → Approved → Scheduled pipeline",
    blur_background: false,
    zoom_level: 1.06,
    layout_style: "premium_saas",
    highlight: { x: 0.1, y: 0.22, width: 0.52, height: 0.28 },
  },
  progress: {
    crop_focus: "Focus on member progress charts and milestone badges",
    highlight_area: "Progress trend chart and completion badge",
    blur_background: true,
    zoom_level: 1.14,
    layout_style: "glass_card",
    highlight: { x: 0.1, y: 0.28, width: 0.48, height: 0.2 },
  },
}

export function getShowcaseVisualPresetForModule(
  module: PlatformModule | string,
): ShowcaseVisualPreset | null {
  if (module in SHOWCASE_MODULE_VISUAL_PRESETS) {
    return SHOWCASE_MODULE_VISUAL_PRESETS[module as PlatformModule]
  }
  return null
}

export function getShowcaseVisualPresetForAsset(
  assetKey: string | undefined,
): ShowcaseVisualPreset | null {
  if (!assetKey?.trim()) return null
  return ASSET_VISUAL_PRESETS[assetKey as FitCoreShowcaseAssetKey] ?? null
}

export function getShowcaseVisualPreset(input: {
  module?: string
  asset_key?: string
}): ShowcaseVisualPreset | null {
  return (
    getShowcaseVisualPresetForAsset(input.asset_key) ??
    (input.module ? getShowcaseVisualPresetForModule(input.module) : null)
  )
}
