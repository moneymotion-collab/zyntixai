import { isWorkflowDirectorStyle } from "@/lib/marketing/app-workflow-director"
import {
  clampZoomLevel,
  deriveSceneVisualLayer,
  parseBlurBackground,
  parseSceneLayoutStyle,
} from "@/lib/marketing/scene-visual-layer"
import { getShowcaseVisualPresetForAsset } from "@/lib/marketing/showcase-scene-visual-presets"
import { enrichSceneWithAnimation } from "@/lib/marketing/scene-animation"
import { isAppShowcaseStyle } from "@/lib/marketing/video-styles"
import type { VideoScriptScene } from "@/lib/marketing/video-script-types"
import { getPlatformFeature } from "@/lib/workflow-intelligence/knowledge-base"
import type { DemoScenePlan } from "@/lib/workflow-intelligence/types"
import {
  WORKFLOW_SCENE_STEP_DEFINITIONS,
  type WorkflowSceneStepId,
} from "@/lib/workflow-intelligence/workflow-types"
import {
  getMarketingLaunchSceneByWorkflowStep,
  MARKETING_LAUNCH_MAX_ZOOM_LEVEL,
  MARKETING_LAUNCH_ZOOM_LEVEL,
} from "@/lib/marketing/marketing-launch-video-workflow"

export function isShowcaseDemoStyle(style: string | null | undefined): boolean {
  const normalized = style?.trim() ?? ""
  return isAppShowcaseStyle(normalized) || isWorkflowDirectorStyle(normalized)
}

function firstNonEmpty(...values: (string | null | undefined)[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim()
    }
  }
  return ""
}

function shortenHeadline(text: string, maxWords = 8): string {
  const words = text.trim().split(/\s+/)
  if (words.length <= maxWords) return text.trim()
  return words.slice(0, maxWords).join(" ")
}

function humanizeAssetKey(assetKey: string): string {
  return assetKey.replace(/-/g, " ").replace(/_/g, " ").trim()
}

function parseWorkflowStepId(
  scene: VideoScriptScene,
  plan?: DemoScenePlan,
): WorkflowSceneStepId | "" {
  const raw = firstNonEmpty(
    scene.workflow_step,
    plan?.stepId,
    scene.module?.toLowerCase().replace(/\s+/g, "_"),
  )
  if (raw in WORKFLOW_SCENE_STEP_DEFINITIONS) {
    return raw as WorkflowSceneStepId
  }
  return ""
}

function isSessionsScene(
  scene: VideoScriptScene,
  plan?: DemoScenePlan,
  stepId?: WorkflowSceneStepId | "",
): boolean {
  const assetKey = firstNonEmpty(scene.asset_key, plan?.asset_key)
  const step = stepId ?? parseWorkflowStepId(scene, plan)
  return step === "sessions" || assetKey === "sessions"
}

/** Curated defaults for sessions workflow scenes. */
const SESSIONS_SCENE_DEFAULTS = {
  overlay_text: "Scheduling without chaos",
  ui_focus_area: "Sessions calendar with time blocks",
  crop_focus: "Focus on the sessions calendar grid with booked time blocks",
  highlight_area: "Session slot being dragged onto the calendar",
} as const

function resolveUiFocusArea(
  scene: VideoScriptScene,
  plan?: DemoScenePlan,
  stepId?: WorkflowSceneStepId | "",
): string {
  const fromScene = firstNonEmpty(scene.ui_focus_area, plan?.ui_focus_area)
  if (fromScene) return fromScene

  if (isSessionsScene(scene, plan, stepId)) {
    return SESSIONS_SCENE_DEFAULTS.ui_focus_area
  }

  const resolvedStepId = stepId || parseWorkflowStepId(scene, plan)
  const launchScene = getMarketingLaunchSceneByWorkflowStep(resolvedStepId)
  if (launchScene) return launchScene.uiFocusArea

  const assetKey = firstNonEmpty(scene.asset_key, plan?.asset_key)
  const preset = assetKey ? getShowcaseVisualPresetForAsset(assetKey) : null
  if (preset?.highlight_area) return preset.highlight_area

  if (resolvedStepId) {
    const stepDef = WORKFLOW_SCENE_STEP_DEFINITIONS[resolvedStepId]
    const feature = getPlatformFeature(stepDef.platformFeatureId)
    return (
      feature.demoFocusAreas[0] ||
      feature.primaryUiElements[0] ||
      `${stepDef.label} primary action`
    )
  }

  return "Primary action button"
}

function resolveOverlayText(
  scene: VideoScriptScene,
  plan: DemoScenePlan | undefined,
  uiFocusArea: string,
  stepId: WorkflowSceneStepId | "",
): string {
  const fromScene = firstNonEmpty(scene.overlay_text, scene.text, plan?.overlay_text)
  if (fromScene) return shortenHeadline(fromScene)

  if (isSessionsScene(scene, plan, stepId)) {
    return SESSIONS_SCENE_DEFAULTS.overlay_text
  }

  const launchScene = getMarketingLaunchSceneByWorkflowStep(stepId)
  if (launchScene) return shortenHeadline(launchScene.overlayText)

  const resolvedStepId = stepId || parseWorkflowStepId(scene, plan)
  if (resolvedStepId) {
    const stepDef = WORKFLOW_SCENE_STEP_DEFINITIONS[resolvedStepId]
    const feature = getPlatformFeature(stepDef.platformFeatureId)
    const fromValue = feature.businessValue.split(/[.—]/)[0]?.trim() ?? ""
    if (fromValue) return shortenHeadline(fromValue)
    return shortenHeadline(`${stepDef.label} made simple`)
  }

  if (uiFocusArea) return shortenHeadline(uiFocusArea)
  return "See FitCore AI in action"
}

function resolveCropFocus(
  scene: VideoScriptScene,
  plan: DemoScenePlan | undefined,
  uiFocusArea: string,
  assetKey: string,
  stepId: WorkflowSceneStepId | "",
): string {
  const fromScene = firstNonEmpty(scene.crop_focus, plan?.crop_focus)
  if (fromScene) return fromScene

  if (uiFocusArea) return uiFocusArea

  if (isSessionsScene(scene, plan, stepId)) {
    return SESSIONS_SCENE_DEFAULTS.crop_focus
  }

  const preset = assetKey ? getShowcaseVisualPresetForAsset(assetKey) : null
  if (preset?.crop_focus) return preset.crop_focus

  if (assetKey) return humanizeAssetKey(assetKey)
  return "Center on primary UI action area"
}

function resolveHighlightArea(
  scene: VideoScriptScene,
  plan: DemoScenePlan | undefined,
  uiFocusArea: string,
  stepId: WorkflowSceneStepId | "",
): string {
  const fromScene = firstNonEmpty(scene.highlight_area, plan?.highlight_area)
  if (fromScene) return fromScene

  if (uiFocusArea) return uiFocusArea

  if (isSessionsScene(scene, plan, stepId)) {
    return SESSIONS_SCENE_DEFAULTS.highlight_area
  }

  return "Primary action button"
}

export type NormalizeShowcaseSceneInput = {
  scene: VideoScriptScene
  index?: number
  scenePlan?: DemoScenePlan
  style?: string
  totalScenes?: number
}

/**
 * Guarantee professional visual layer fields for app_showcase / saas_demo scenes.
 * No important visual field may be null or empty after normalization.
 */
export function normalizeShowcaseSceneFields(
  input: NormalizeShowcaseSceneInput,
): VideoScriptScene {
  const { scene, index = 0, scenePlan, style, totalScenes } = input
  const stepId = parseWorkflowStepId(scene, scenePlan)
  const assetKey = firstNonEmpty(scene.asset_key, scenePlan?.asset_key, "dashboard")
  const launchScene = getMarketingLaunchSceneByWorkflowStep(stepId)
  const ui_focus_area = resolveUiFocusArea(scene, scenePlan, stepId)
  const overlay_text = resolveOverlayText(scene, scenePlan, ui_focus_area, stepId)
  const crop_focus = resolveCropFocus(
    scene,
    scenePlan,
    ui_focus_area,
    assetKey,
    stepId,
  )
  const highlight_area = resolveHighlightArea(
    scene,
    scenePlan,
    ui_focus_area,
    stepId,
  )

  const visualLayer = deriveSceneVisualLayer(
    {
      crop_focus,
      highlight_area,
      ui_focus_area,
      asset_key: assetKey,
      workflow_step: stepId || scene.workflow_step,
      module: scene.module,
      zoom_level: scene.zoom_level ?? scenePlan?.zoom_level,
      layout_style: scene.layout_style ?? scenePlan?.layout_style,
      blur_background: scene.blur_background ?? scenePlan?.blur_background,
      camera_motion: scene.camera_motion ?? scenePlan?.camera_motion,
    },
    index,
  )

  return enrichSceneWithAnimation(
    {
      ...scene,
      text: firstNonEmpty(scene.text, overlay_text),
      overlay_text,
      ui_focus_area,
      crop_focus,
      highlight_area,
      asset_key: assetKey,
      asset_url: firstNonEmpty(scene.asset_url, scenePlan?.asset_url) || scene.asset_url,
      cursor_action:
        firstNonEmpty(scene.cursor_action, scenePlan?.cursor_action) ||
        `Highlight ${ui_focus_area}`,
      narration:
        firstNonEmpty(scene.narration, scenePlan?.narration) ||
        (launchScene
          ? [launchScene.valueMessage, launchScene.taglineText]
              .filter(Boolean)
              .join(" ")
          : "See how this step saves coaches time."),
      professional_purpose:
        firstNonEmpty(scene.professional_purpose, scenePlan?.professional_purpose) ||
        "Demonstrate platform value",
      blur_background: parseBlurBackground(
        scene.blur_background ?? scenePlan?.blur_background,
        launchScene
          ? false
          : isAppShowcaseStyle(style ?? "") || visualLayer.blur_background,
      ),
      zoom_level: clampZoomLevel(
        scene.zoom_level ??
          scenePlan?.zoom_level ??
          (launchScene ? MARKETING_LAUNCH_ZOOM_LEVEL : visualLayer.zoom_level),
        launchScene ? MARKETING_LAUNCH_ZOOM_LEVEL : 1.12,
        launchScene ? MARKETING_LAUNCH_MAX_ZOOM_LEVEL : 1.25,
      ),
      layout_style: parseSceneLayoutStyle(
        scene.layout_style ?? scenePlan?.layout_style ?? visualLayer.layout_style,
      ),
      workflow_step: stepId || scene.workflow_step || scenePlan?.stepId,
      animation_type: scene.animation_type ?? scenePlan?.animation_type,
      animation_duration: scene.animation_duration ?? scenePlan?.animation_duration,
      caption_position: scene.caption_position ?? scenePlan?.caption_position,
      highlight_style: scene.highlight_style ?? scenePlan?.highlight_style,
    },
    index,
    totalScenes,
  )
}

export function normalizeShowcaseScenes(
  scenes: VideoScriptScene[],
  input?: {
    style?: string
    scenePlans?: DemoScenePlan[]
  },
): VideoScriptScene[] {
  if (!isShowcaseDemoStyle(input?.style)) {
    return scenes
  }

  return scenes.map((scene, index) =>
    normalizeShowcaseSceneFields({
      scene,
      index,
      scenePlan: input?.scenePlans?.[index],
      style: input?.style,
      totalScenes: scenes.length,
    }),
  )
}
