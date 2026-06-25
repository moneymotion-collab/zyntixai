import {
  buildCinematicImagePrompt,
} from "@/lib/marketing/cinematic-visual-prompts"
import {
  clampZoomLevel,
  parseBlurBackground,
  parseSceneLayoutStyle,
  type SceneLayoutStyle,
} from "@/lib/marketing/scene-visual-layer"
import {
  isShowcaseDemoStyle,
  normalizeShowcaseSceneFields,
} from "@/lib/marketing/normalize-showcase-scene-fields"
import { formatShowcaseSceneVisual } from "@/lib/marketing/saas-showcase-engine"
import type { VideoScriptScene } from "@/lib/marketing/video-script-types"
import {
  parseSceneCameraMotion,
  parseSceneTransition,
} from "@/lib/marketing/video-scene-cinematics"
import { isAppShowcaseStyle } from "@/lib/marketing/video-styles"
import type { Database } from "@/lib/database.types"
import type { DemoScenePlan } from "@/lib/workflow-intelligence/types"

export type VideoSceneInsertRow =
  Database["public"]["Tables"]["video_scenes"]["Insert"]

function cleanText(
  value: string | null | undefined,
  fallback = "",
): string {
  if (typeof value === "string" && value.trim()) {
    return value.trim()
  }
  return fallback
}

function firstCleanText(
  ...values: (string | null | undefined)[]
): string {
  for (const value of values) {
    const cleaned = cleanText(value)
    if (cleaned) return cleaned
  }
  return ""
}

function clampDuration(
  value: number | null | undefined,
  fallback = 2,
): number {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.min(8, Math.max(2, Math.round(value)))
  }
  return fallback
}

function resolveAnimationDuration(scene: VideoScriptScene): number {
  if (
    typeof scene.animation_duration === "number" &&
    Number.isFinite(scene.animation_duration) &&
    scene.animation_duration > 0
  ) {
    return scene.animation_duration
  }

  if (typeof scene.duration === "number" && Number.isFinite(scene.duration) && scene.duration > 0) {
    return scene.duration
  }

  return 2.5
}

function buildImagePromptFallback(visual: string, text: string): string {
  const subject = visual || text || "Premium fitness coaching commercial scene"
  return buildCinematicImagePrompt({
    sceneDirection: subject,
    onScreenText: text,
  })
}

const INSERT_VISUAL_DEFAULTS = {
  zoom_level: 1.12,
  layout_style: "premium_saas" as SceneLayoutStyle,
} as const

export function normalizeSceneVisualFieldsForInsert(input: {
  scene: VideoScriptScene
  scenePlan?: DemoScenePlan
  style: string
  ui_focus_area: string
  asset_key: string
}): {
  crop_focus: string
  highlight_area: string
  blur_background: boolean
  zoom_level: number
  layout_style: SceneLayoutStyle
} {
  const { scene, scenePlan, style, ui_focus_area, asset_key } = input

  return {
    crop_focus: firstCleanText(
      scene.crop_focus,
      scenePlan?.crop_focus,
      ui_focus_area,
      asset_key,
    ),
    highlight_area: firstCleanText(
      scene.highlight_area,
      scenePlan?.highlight_area,
      ui_focus_area,
    ),
    blur_background: parseBlurBackground(
      scene.blur_background ?? scenePlan?.blur_background,
      isAppShowcaseStyle(style),
    ),
    zoom_level: clampZoomLevel(
      scene.zoom_level ?? scenePlan?.zoom_level,
      INSERT_VISUAL_DEFAULTS.zoom_level,
    ),
    layout_style: parseSceneLayoutStyle(
      scene.layout_style ?? scenePlan?.layout_style ?? INSERT_VISUAL_DEFAULTS.layout_style,
    ),
  }
}

export type NormalizeVideoSceneInsertInput = {
  scene: VideoScriptScene
  index: number
  videoId: string
  style: string
  workflowType: string
  scenePlan?: DemoScenePlan
}

export function normalizeVideoSceneForInsert(
  input: NormalizeVideoSceneInsertInput & { totalScenes?: number },
): VideoSceneInsertRow {
  const { scene: rawScene, index, videoId, style, workflowType, scenePlan, totalScenes } =
    input

  const scene =
    isShowcaseDemoStyle(style)
      ? normalizeShowcaseSceneFields({
          scene: rawScene,
          index,
          scenePlan,
          style,
          totalScenes,
        })
      : rawScene

  const overlay_text = firstCleanText(
    scene.overlay_text,
    scene.text,
    scenePlan?.overlay_text,
    "See FitCore Coach in action",
  )
  const text = firstCleanText(scene.text, overlay_text)
  const visual =
    formatShowcaseSceneVisual(scene).trim() ||
    firstCleanText(scene.visual, scenePlan?.cinematicDirection, text)
  const image_prompt = firstCleanText(
    scene.image_prompt,
    scenePlan?.image_prompt,
    buildImagePromptFallback(visual, text),
  )
  const asset_key = firstCleanText(scene.asset_key, scenePlan?.asset_key)
  const asset_url = firstCleanText(scene.asset_url, scenePlan?.asset_url)

  const ui_focus_area = firstCleanText(
    scene.ui_focus_area,
    scenePlan?.ui_focus_area,
    "Primary action button",
  )
  const visualFields = normalizeSceneVisualFieldsForInsert({
    scene,
    scenePlan,
    style,
    ui_focus_area,
    asset_key,
  })

  const animation_type = firstCleanText(
    scene.animation_type,
    scenePlan?.animation_type,
    "zoom_highlight",
  )
  const caption_position = firstCleanText(
    scene.caption_position,
    scenePlan?.caption_position,
    "bottom",
  )
  const highlight_style = firstCleanText(
    scene.highlight_style,
    scenePlan?.highlight_style,
    "pulse",
  )
  const animation_duration = resolveAnimationDuration(scene)

  return {
    video_id: videoId,
    scene_index: index + 1,
    text,
    visual,
    image_prompt,
    camera_motion: parseSceneCameraMotion(
      scene.camera_motion || scenePlan?.camera_motion,
    ),
    transition: parseSceneTransition(scene.transition || scenePlan?.transition),
    duration: clampDuration(scene.duration, scenePlan?.duration ?? 2),
    style: cleanText(style, "app_showcase"),
    workflow_type: cleanText(workflowType, "full_platform_overview"),
    workflow_step: firstCleanText(
      scene.workflow_step,
      scenePlan?.stepId,
      `scene_${index + 1}`,
    ),
    asset_key,
    asset_url,
    ui_focus_area,
    cursor_action: firstCleanText(
      scene.cursor_action,
      scenePlan?.cursor_action,
      "Highlight the primary UI element",
    ),
    overlay_text,
    narration: firstCleanText(
      scene.narration,
      scenePlan?.narration,
      "See how this step saves coaches time.",
    ),
    professional_purpose: firstCleanText(
      scene.professional_purpose,
      scenePlan?.professional_purpose,
      "Demonstrate platform value",
    ),
    crop_focus: visualFields.crop_focus,
    highlight_area: visualFields.highlight_area,
    blur_background: visualFields.blur_background,
    zoom_level: visualFields.zoom_level,
    layout_style: visualFields.layout_style,
    animation_type,
    animation_duration,
    caption_position,
    highlight_style,
  }
}

export function normalizeVideoScenesForInsert(
  scenes: VideoScriptScene[],
  input: {
    videoId: string
    style: string
    workflowType: string
    scenePlans?: DemoScenePlan[]
  },
): VideoSceneInsertRow[] {
  return scenes.map((scene, index) =>
    normalizeVideoSceneForInsert({
      scene,
      index,
      videoId: input.videoId,
      style: input.style,
      workflowType: input.workflowType,
      scenePlan: input.scenePlans?.[index],
      totalScenes: scenes.length,
    }),
  )
}

export function normalizeWorkflowProjectFields(input: {
  workflowType?: string | null
  workflowSummary?: string | null
  fallbackWorkflowType?: string
  fallbackWorkflowSummary?: string
}): { workflow_type: string; workflow_summary: string } {
  return {
    workflow_type: firstCleanText(
      input.workflowType,
      input.fallbackWorkflowType,
      "full_platform_overview",
    ),
    workflow_summary: firstCleanText(
      input.workflowSummary,
      input.fallbackWorkflowSummary,
      "Show FitCore as an all-in-one coaching business platform.",
    ),
  }
}
