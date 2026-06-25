import {
  getMarketingLaunchSceneByWorkflowStep,
  MARKETING_LAUNCH_ZOOM_LEVEL,
} from "@/lib/marketing/marketing-launch-video-workflow"
import { resolveWorkflowSceneAsset } from "@/lib/marketing/workflow-scene-asset-resolver"
import type { FitCoreShowcaseAssetKey } from "@/lib/marketing/app-showcase-engine"
import { normalizeShowcaseSceneFields } from "@/lib/marketing/normalize-showcase-scene-fields"
import { deriveSceneVisualLayer } from "@/lib/marketing/scene-visual-layer"
import {
  deriveSceneAnimation,
} from "@/lib/marketing/scene-animation"
import {
  applyWorkflowDirectorToScenes,
  buildSceneFromWorkflowBeat,
  getWorkflowDefinition,
  type AppWorkflowId,
  type WorkflowSceneBeat,
} from "@/lib/marketing/app-workflow-director"
import {
  SCENE_CAMERA_MOTIONS,
  SCENE_TRANSITIONS,
} from "@/lib/marketing/video-scene-cinematics"
import type { VideoScriptScene } from "@/lib/marketing/video-script-types"
import {
  buildCinematicImagePrompt,
  buildCinematicVisualFromModule,
} from "@/lib/marketing/cinematic-visual-prompts"
import {
  buildFeatureKnowledgeBlock,
  getPlatformFeature,
} from "@/lib/workflow-intelligence/knowledge-base"
import {
  getWorkflowFeaturePath,
  getWorkflowGoalDescription,
  getWorkflowSceneSteps,
} from "@/lib/workflow-intelligence/registry"
import type {
  DemoScenePlan,
  DetectedUserGoal,
  EnrichedDemoScene,
  PlatformFeatureId,
  WorkflowIntelligencePlan,
  WorkflowSelection,
} from "@/lib/workflow-intelligence/types"
import {
  buildWorkflowSummary,
  toWorkflowType,
  WORKFLOW_SCENE_STEP_DEFINITIONS,
  type WorkflowSceneStepId,
} from "@/lib/workflow-intelligence/workflow-types"

const CAMERA_CYCLE = SCENE_CAMERA_MOTIONS.slice(0, 8)
const TRANSITION_CYCLE = SCENE_TRANSITIONS.slice(0, 8)

function pickCinematic(index: number): {
  camera_motion: (typeof CAMERA_CYCLE)[number]
  transition: (typeof TRANSITION_CYCLE)[number]
} {
  return {
    camera_motion: CAMERA_CYCLE[index % CAMERA_CYCLE.length],
    transition: TRANSITION_CYCLE[index % TRANSITION_CYCLE.length],
  }
}

function shortenHeadline(text: string, maxWords = 8): string {
  const words = text.trim().split(/\s+/)
  if (words.length <= maxWords) return text.trim()
  return words.slice(0, maxWords).join(" ")
}

function buildOverlayFromFeature(featureId: PlatformFeatureId): string {
  const feature = getPlatformFeature(featureId)
  const valueWords = feature.businessValue.split(/[.—]/)[0]?.trim() ?? ""
  return shortenHeadline(valueWords || feature.label)
}

function buildNarrationFromFeature(featureId: PlatformFeatureId): string {
  const feature = getPlatformFeature(featureId)
  return `${feature.purpose.split(".")[0]}.`
}

function buildCursorAction(featureId: PlatformFeatureId): string {
  const feature = getPlatformFeature(featureId)
  const action = feature.typicalUserActions[0] ?? `Open ${feature.label}`
  const focus = feature.demoFocusAreas[0] ?? feature.primaryUiElements[0]
  return `${action}, highlight ${focus}`
}

function buildCinematicDirection(
  stepId: WorkflowSceneStepId,
  featureId: PlatformFeatureId,
  beat?: WorkflowSceneBeat,
): string {
  const step = WORKFLOW_SCENE_STEP_DEFINITIONS[stepId]
  const feature = getPlatformFeature(featureId)
  const focus = beat?.ui_focus_area ?? feature.demoFocusAreas[0]

  return buildCinematicVisualFromModule(
    step.label,
    `Coach using ${feature.label} — ${focus}`,
  )
}

function buildSceneImagePrompt(
  stepLabel: string,
  plan: Pick<
    DemoScenePlan,
    "cinematicDirection" | "ui_focus_area" | "overlay_text" | "storyBeat"
  >,
): string {
  return buildCinematicImagePrompt({
    sceneDirection: plan.cinematicDirection,
    onScreenText: plan.overlay_text,
    storyBeat: plan.storyBeat,
  })
}

function humanizeAssetKey(assetKey: string): string {
  return assetKey.replace(/-/g, " ").replace(/_/g, " ").trim()
}

function enrichBeatWithKnowledge(
  beat: WorkflowSceneBeat,
  stepId: WorkflowSceneStepId,
  featureId: PlatformFeatureId,
  index: number,
  totalScenes: number,
): DemoScenePlan {
  const feature = getPlatformFeature(featureId)
  const step = WORKFLOW_SCENE_STEP_DEFINITIONS[stepId]
  const launchScene = getMarketingLaunchSceneByWorkflowStep(stepId)
  const ui_focus_area =
    beat.ui_focus_area || launchScene?.uiFocusArea || feature.demoFocusAreas[0]
  const cinematics = launchScene
    ? {
        camera_motion: beat.camera_motion,
        transition: beat.transition,
      }
    : pickCinematic(index)
  const resolved = resolveWorkflowSceneAsset(stepId)
  const assetKey = resolved.asset_key as FitCoreShowcaseAssetKey
  const visualLayer = deriveSceneVisualLayer(
    {
      ui_focus_area,
      camera_motion: beat.camera_motion || cinematics.camera_motion,
      asset_key: assetKey,
      workflow_step: stepId,
      module: step.label,
      blur_background: launchScene ? false : undefined,
      zoom_level: launchScene ? MARKETING_LAUNCH_ZOOM_LEVEL : undefined,
    },
    index,
  )
  const animation = deriveSceneAnimation({
    index,
    totalScenes,
    workflow_step: stepId,
    asset_key: assetKey,
    layout_style: visualLayer.layout_style,
    cursor_action: beat.cursor_action || buildCursorAction(featureId),
    overlay_text: beat.overlay_text || buildOverlayFromFeature(featureId),
    visual: buildCinematicDirection(stepId, featureId, beat),
    story_beat: beat.storyBeat,
    professional_purpose:
      beat.professional_purpose || feature.businessValue.split(".")[0],
  })

  return {
    step: beat.step,
    stepId,
    featureId,
    storyBeat: beat.storyBeat,
    ui_focus_area,
    cursor_action: beat.cursor_action || buildCursorAction(featureId),
    overlay_text:
      beat.overlay_text ||
      launchScene?.overlayText ||
      buildOverlayFromFeature(featureId),
    narration:
      beat.narration ||
      (launchScene
        ? [launchScene.valueMessage, launchScene.taglineText]
            .filter(Boolean)
            .join(" ")
        : buildNarrationFromFeature(featureId)),
    professional_purpose:
      beat.professional_purpose || feature.businessValue.split(".")[0],
    cinematicDirection: buildCinematicDirection(stepId, featureId, beat),
    camera_motion: beat.camera_motion || cinematics.camera_motion,
    transition: beat.transition || cinematics.transition,
    duration: beat.duration,
    asset_key: resolved.asset_key as FitCoreShowcaseAssetKey,
    asset_url: resolved.asset_url,
    screenshot_available: resolved.screenshotAvailable,
    image_prompt: buildSceneImagePrompt(step.label, {
      cinematicDirection: buildCinematicDirection(stepId, featureId, beat),
      ui_focus_area: beat.ui_focus_area || feature.demoFocusAreas[0],
      overlay_text: beat.overlay_text || buildOverlayFromFeature(featureId),
      storyBeat: beat.storyBeat || step.label,
    }),
    crop_focus: ui_focus_area || humanizeAssetKey(assetKey),
    highlight_area: ui_focus_area,
    blur_background: launchScene ? false : visualLayer.blur_background,
    zoom_level: launchScene ? MARKETING_LAUNCH_ZOOM_LEVEL : visualLayer.zoom_level,
    layout_style: visualLayer.layout_style,
    animation_type: animation.animation_type,
    animation_duration: animation.animation_duration,
    caption_position: animation.caption_position,
    highlight_style: animation.highlight_style,
  }
}

export function buildDemoScenePlans(
  workflowId: AppWorkflowId,
): DemoScenePlan[] {
  const workflow = getWorkflowDefinition(workflowId)
  const sceneSteps = getWorkflowSceneSteps(workflowId)
  const featurePath = getWorkflowFeaturePath(workflowId)

  return workflow.beats.map((beat, index) =>
    enrichBeatWithKnowledge(
      beat,
      sceneSteps[index] ?? sceneSteps[sceneSteps.length - 1],
      featurePath[index] ?? featurePath[featurePath.length - 1],
      index,
      workflow.beats.length,
    ),
  )
}

export function demoScenePlanToVideoScene(
  plan: DemoScenePlan,
  _style: string,
): VideoScriptScene {
  const step = WORKFLOW_SCENE_STEP_DEFINITIONS[plan.stepId]

  return {
    story_beat: plan.storyBeat,
    module: step.label,
    workflow_step: plan.stepId,
    text: plan.overlay_text,
    overlay_text: plan.overlay_text,
    ui_focus_area: plan.ui_focus_area,
    cursor_action: plan.cursor_action,
    narration: plan.narration,
    professional_purpose: plan.professional_purpose,
    character_action: plan.cursor_action,
    visual: plan.cinematicDirection,
    image_prompt: plan.image_prompt,
    asset_key: plan.asset_key,
    asset_url: plan.asset_url,
    camera_motion: plan.camera_motion,
    transition: plan.transition,
    duration: plan.duration,
    crop_focus: plan.crop_focus,
    highlight_area: plan.highlight_area,
    blur_background: plan.blur_background,
    zoom_level: plan.zoom_level,
    layout_style: plan.layout_style,
    animation_type: plan.animation_type,
    animation_duration: plan.animation_duration,
    caption_position: plan.caption_position,
    highlight_style: plan.highlight_style,
  }
}

export function buildScenesFromWorkflowIntelligence(
  workflowId: AppWorkflowId,
  style: string,
): EnrichedDemoScene[] {
  return buildDemoScenePlans(workflowId).map((plan) => ({
    ...demoScenePlanToVideoScene(plan, style),
    featureId: plan.featureId,
    stepId: plan.stepId,
  }))
}

export function enrichScenesWithWorkflowIntelligence(
  scenes: VideoScriptScene[],
  workflowId: AppWorkflowId,
  style: string,
): VideoScriptScene[] {
  const workflow = getWorkflowDefinition(workflowId)
  const directorScenes = applyWorkflowDirectorToScenes(scenes, workflow, style)
  const plans = buildDemoScenePlans(workflowId)

  return directorScenes.map((scene, index) => {
    const plan = plans[index]
    if (!plan) {
      return normalizeShowcaseSceneFields({ scene, index, style, totalScenes: directorScenes.length })
    }

    const step = WORKFLOW_SCENE_STEP_DEFINITIONS[plan.stepId]

    return normalizeShowcaseSceneFields({
      scene: {
        ...scene,
        workflow_step: plan.stepId,
        module: scene.module?.trim() || step.label,
        asset_key: plan.asset_key,
        asset_url: plan.asset_url,
        image_prompt: scene.image_prompt?.trim() || plan.image_prompt,
        ui_focus_area: scene.ui_focus_area?.trim() || plan.ui_focus_area,
        cursor_action: scene.cursor_action?.trim() || plan.cursor_action,
        overlay_text: scene.overlay_text?.trim() || plan.overlay_text,
        text: scene.text?.trim() || plan.overlay_text,
        narration: scene.narration?.trim() || plan.narration,
        professional_purpose:
          scene.professional_purpose?.trim() || plan.professional_purpose,
        visual: scene.visual?.trim() || plan.cinematicDirection,
        character_action:
          scene.character_action?.trim() || scene.cursor_action || plan.cursor_action,
        crop_focus: scene.crop_focus?.trim() || plan.crop_focus,
        highlight_area: scene.highlight_area?.trim() || plan.highlight_area,
        blur_background: scene.blur_background ?? plan.blur_background,
        zoom_level: scene.zoom_level ?? plan.zoom_level,
        layout_style: scene.layout_style ?? plan.layout_style,
        animation_type: scene.animation_type ?? plan.animation_type,
        animation_duration: scene.animation_duration ?? plan.animation_duration,
        caption_position: scene.caption_position ?? plan.caption_position,
        highlight_style: scene.highlight_style ?? plan.highlight_style,
      },
      index,
      scenePlan: plan,
      style,
      totalScenes: directorScenes.length,
    })
  })
}

export function buildFallbackScenesFromWorkflow(
  workflowId: AppWorkflowId,
  style: string,
): VideoScriptScene[] {
  const workflow = getWorkflowDefinition(workflowId)
  return workflow.beats.map((beat) => buildSceneFromWorkflowBeat(beat, style))
}

export function assembleWorkflowIntelligencePlan(
  goal: DetectedUserGoal,
  workflow: WorkflowSelection,
): WorkflowIntelligencePlan {
  const scenes = buildDemoScenePlans(workflow.workflowId)
  const uniqueFeatures = [...new Set(workflow.featurePath)]
  const knowledgeContext = uniqueFeatures
    .map((id) => buildFeatureKnowledgeBlock(id))
    .join("\n\n")

  return {
    goal,
    workflow,
    workflowType: toWorkflowType(workflow.workflowId),
    workflowSummary: buildWorkflowSummary(workflow.workflowId, goal.inferredObjective),
    scenes,
    knowledgeContext,
    directorPromptBlock: "",
  }
}

export function getWorkflowDemoSummary(workflowId: AppWorkflowId): string {
  const description = getWorkflowGoalDescription(workflowId)
  const scenes = buildDemoScenePlans(workflowId)
  const sceneSummary = scenes
    .map(
      (s) =>
        `Scene ${s.step}: ${WORKFLOW_SCENE_STEP_DEFINITIONS[s.stepId].label} — ${s.overlay_text}`,
    )
    .join("\n")
  return `${description}\n\n${sceneSummary}`
}
