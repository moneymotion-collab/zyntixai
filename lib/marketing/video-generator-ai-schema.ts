import {
  buildMascotPromptBlock,
  FITCORE_COACH_MASCOT,
  getMascotDescription,
  getMascotStyle,
  type MascotFieldOverrides,
} from "@/lib/marketing/brand-mascot"
import {
  buildSceneAnimationDirectorRules,
  clampAnimationDuration,
  parseSceneAnimationType,
  parseSceneCaptionPosition,
  parseSceneHighlightStyle,
} from "@/lib/marketing/scene-animation"
import {
  buildVisualLayerDirectorRules,
  clampZoomLevel,
  enrichSceneWithVisualLayer,
} from "@/lib/marketing/scene-visual-layer"
import { normalizeShowcaseSceneFields } from "@/lib/marketing/normalize-showcase-scene-fields"
import type { AppWorkflowDefinition } from "@/lib/marketing/app-workflow-director"
import {
  alignSceneToPlatformModule,
  buildPlatformModuleJsonSceneExamples,
  buildPlatformModuleScenePromptBlock,
} from "@/lib/video/platform-module-script"
import {
  SCENE_CAMERA_MOTIONS,
  SCENE_TRANSITIONS,
  parseSceneCameraMotion,
  parseSceneTransition,
} from "@/lib/marketing/video-scene-cinematics"
import type {
  VideoScript,
  VideoScriptMascot,
  VideoScriptScene,
} from "@/lib/marketing/video-script-types"
import { APP_SHOWCASE_STYLE } from "@/lib/marketing/video-styles"
import type { DemoScenePlan } from "@/lib/workflow-intelligence/types"
import {
  buildWorkflowSummary,
  toWorkflowType,
  type WorkflowType,
} from "@/lib/workflow-intelligence/workflow-types"

/** Canonical empty scene shape the AI must return for workflow demo styles. */
export const VIDEO_GENERATOR_AI_SCENE_SCHEMA = {
  module: "dashboard",
  text: "Run your fitness business from one dashboard.",
  duration: 3,
  visual_description: "Fitness business owner at standing desk, holographic command center glowing electric blue in dark modern office",
  workflow_step: "dashboard",
  asset_key: "dashboard",
  visual: "Full FitCore AI dashboard overview",
  image_prompt: "",
  ui_focus_area: "",
  cursor_action: "",
  overlay_text: "Run your fitness business from one dashboard.",
  narration: "",
  camera_motion: "slow zoom in",
  transition: "cross dissolve",
  professional_purpose: "",
  crop_focus: "",
  highlight_area: "",
  blur_background: true,
  zoom_level: 1.1,
  layout_style: "premium_saas",
  animation_type: "slow_zoom",
  animation_duration: 3,
  caption_position: "top",
  highlight_style: "border",
} as const

/** Canonical empty response shape for app_showcase / workflow demo generation. */
export const VIDEO_GENERATOR_AI_RESPONSE_SCHEMA = {
  hook: "",
  style: APP_SHOWCASE_STYLE,
  workflow_type: "",
  workflow_summary: "",
  mascot: {
    name: "",
    description: "",
    style: "",
    personality: "",
  },
  scenes: [VIDEO_GENERATOR_AI_SCENE_SCHEMA],
  cta: "",
  caption: "",
  hashtags: [] as string[],
  thumbnail_title: "",
  thumbnail_text: "",
  thumbnail_visual: "",
} as const

export const VIDEO_GENERATOR_AI_SCENE_REQUIRED_FIELDS = [
  "module",
  "text",
  "duration",
  "visual_description",
  "workflow_step",
  "asset_key",
  "visual",
  "image_prompt",
  "ui_focus_area",
  "cursor_action",
  "overlay_text",
  "narration",
  "camera_motion",
  "transition",
  "professional_purpose",
  "crop_focus",
  "highlight_area",
  "blur_background",
  "zoom_level",
  "layout_style",
  "animation_type",
  "animation_duration",
  "caption_position",
  "highlight_style",
] as const

export const VIDEO_GENERATOR_AI_RESPONSE_REQUIRED_FIELDS = [
  "hook",
  "style",
  "workflow_type",
  "workflow_summary",
  "mascot",
  "scenes",
  "cta",
  "caption",
  "hashtags",
  "thumbnail_title",
  "thumbnail_text",
  "thumbnail_visual",
] as const

export function buildVideoGeneratorAiSchemaPromptBlock(): string {
  return `Required JSON response schema (every field REQUIRED — never omit or leave empty):

${JSON.stringify(VIDEO_GENERATOR_AI_RESPONSE_SCHEMA, null, 2)}

${buildPlatformModuleScenePromptBlock()}

Scene field rules:
- module: REQUIRED snake_case platform module id — must match the scene text
- text: on-screen headline for that module (max 12 words) — MUST match module
- visual_description: REQUIRED — cinematic scene direction for the module (coach, environment, lighting — not a flat UI screenshot)
- duration: 2-5 seconds (integer), default 3
- workflow_step: snake_case step id aligned with module (e.g. "members", "marketing_ai")
- asset_key: optional workflow metadata key (e.g. "dashboard", "members", "marketing-ai") — do NOT use as the rendered visual
- visual: cinematic scene direction — same intent as visual_description
- image_prompt: detailed cinematic Visual Engine prompt for AI image generation (never empty, no flat screenshots)
- ui_focus_area: exact UI element to highlight for this module
- cursor_action: mouse/cursor movement and click sequence
- overlay_text: same as text
- narration: one-sentence voiceover for this module
- camera_motion: one of ${SCENE_CAMERA_MOTIONS.slice(0, 8).join(", ")}
- transition: one of ${SCENE_TRANSITIONS.slice(0, 8).join(", ")}
- professional_purpose: why this module matters in the product demo

${buildSceneAnimationDirectorRules()}

${buildVisualLayerDirectorRules()}`
}

function readMascotField(lines: string[], prefix: string): string {
  return (
    lines.find((line) => line.startsWith(prefix))?.slice(prefix.length).trim() ??
    ""
  )
}

export function buildAppShowcaseAiJsonExample(input: {
  workflow: AppWorkflowDefinition
  mascotOverrides?: MascotFieldOverrides
  workflowType?: WorkflowType
  workflowSummary?: string
  inferredObjective?: string
  style?: string
  includeMascot?: boolean
}): Record<string, unknown> {
  const { workflow } = input
  const block = buildMascotFromOverrides(input.mascotOverrides)
  const workflowType =
    input.workflowType ?? toWorkflowType(workflow.id)
  const workflowSummary =
    input.workflowSummary ??
    buildWorkflowSummary(workflow.id, input.inferredObjective)
  const style = input.style ?? APP_SHOWCASE_STYLE
  const includeMascot = input.includeMascot ?? style === APP_SHOWCASE_STYLE

  return {
    hook: "Stop juggling apps to run your coaching business.",
    style,
    workflow_type: workflowType,
    workflow_summary: workflowSummary,
    ...(includeMascot ? { mascot: block } : {}),
    scenes: buildPlatformModuleJsonSceneExamples(),
    cta: "Start your free trial — run your entire coaching business in one place.",
    caption:
      "See how FitCore Coach connects your coaching workflow in one platform.",
    hashtags: [
      "fitnessbusiness",
      "personaltrainer",
      "saas",
      "gymowner",
      "FitCoreCoach",
      "coachingsoftware",
    ],
    thumbnail_title: "RUN YOUR GYM",
    thumbnail_text: "One platform. Every workflow.",
    thumbnail_visual:
      "FitCore Coach mascot beside premium SaaS dashboard on laptop, neon blue glow, scroll-stopping B2B cover frame.",
  }
}

function buildMascotFromOverrides(
  overrides?: MascotFieldOverrides,
): VideoScriptMascot {
  const block = buildMascotPromptBlock(undefined, overrides)
  const lines = block.split("\n")

  return {
    name: readMascotField(lines, "Mascot name: ") || FITCORE_COACH_MASCOT.name,
    description:
      readMascotField(lines, "Mascot description: ") ||
      getMascotDescription(),
    style: readMascotField(lines, "Mascot style: ") || getMascotStyle(),
    personality:
      readMascotField(lines, "Voice tone: ") ||
      FITCORE_COACH_MASCOT.voiceTone.join(", "),
  }
}

export type VideoGeneratorSchemaFallbackInput = {
  style: string
  prompt?: string
  workflowType?: WorkflowType | string
  workflowSummary?: string
  scenePlans?: DemoScenePlan[]
  mascot?: VideoScriptMascot
}

function defaultMascot(): VideoScriptMascot {
  return {
    name: FITCORE_COACH_MASCOT.name,
    description: getMascotDescription(),
    style: getMascotStyle(),
    personality: FITCORE_COACH_MASCOT.voiceTone.join(", "),
  }
}

function clampDuration(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 2
  return Math.min(8, Math.max(2, Math.round(value)))
}

function applySceneSchemaFallbacks(
  scene: VideoScriptScene,
  index: number,
  plan?: DemoScenePlan,
): VideoScriptScene {
  const text =
    scene.text?.trim() ||
    scene.overlay_text?.trim() ||
    plan?.overlay_text ||
    "See FitCore Coach in action"
  const overlay_text =
    scene.overlay_text?.trim() || plan?.overlay_text || text
  const visual =
    scene.visual?.trim() ||
    plan?.cinematicDirection ||
    `Professional SaaS demo of ${plan?.stepId ?? "platform module"} with animated cursor`
  const image_prompt =
    scene.image_prompt?.trim() ||
    plan?.image_prompt ||
    `Professional SaaS product demo: ${visual}. Focus on ${scene.ui_focus_area || plan?.ui_focus_area || "primary CTA"}. Vertical 9:16.`

  return {
    ...scene,
    workflow_step:
      scene.workflow_step?.trim() || plan?.stepId || `scene_${index + 1}`,
    asset_key:
      scene.asset_key?.trim() || plan?.asset_key || "dashboard",
    text,
    overlay_text,
    visual,
    image_prompt,
    ui_focus_area:
      scene.ui_focus_area?.trim() ||
      plan?.ui_focus_area ||
      "Primary action button",
    cursor_action:
      scene.cursor_action?.trim() ||
      plan?.cursor_action ||
      "Hover and click the highlighted element",
    narration:
      scene.narration?.trim() ||
      plan?.narration ||
      "See how this step saves coaches time.",
    camera_motion: parseSceneCameraMotion(
      scene.camera_motion || plan?.camera_motion,
    ),
    transition: parseSceneTransition(scene.transition || plan?.transition),
    duration: clampDuration(scene.duration || plan?.duration || 2),
    professional_purpose:
      scene.professional_purpose?.trim() ||
      plan?.professional_purpose ||
      "Demonstrate platform value",
    module: scene.module?.trim() || plan?.stepId || undefined,
    story_beat: scene.story_beat?.trim() || plan?.storyBeat || undefined,
    character_action:
      scene.character_action?.trim() ||
      scene.cursor_action?.trim() ||
      plan?.cursor_action ||
      undefined,
    asset_url: scene.asset_url?.trim() || plan?.asset_url || undefined,
    crop_focus:
      scene.crop_focus?.trim() ||
      plan?.crop_focus ||
      undefined,
    highlight_area:
      scene.highlight_area?.trim() ||
      plan?.highlight_area ||
      undefined,
    blur_background:
      scene.blur_background !== undefined
        ? scene.blur_background
        : plan?.blur_background,
    zoom_level:
      scene.zoom_level !== undefined
        ? clampZoomLevel(scene.zoom_level)
        : plan?.zoom_level,
    layout_style:
      scene.layout_style?.trim() ||
      plan?.layout_style ||
      undefined,
    animation_type:
      parseSceneAnimationType(scene.animation_type || plan?.animation_type) ||
      undefined,
    animation_duration: clampAnimationDuration(
      scene.animation_duration ?? plan?.animation_duration,
    ),
    caption_position:
      parseSceneCaptionPosition(scene.caption_position || plan?.caption_position) ||
      undefined,
    highlight_style:
      parseSceneHighlightStyle(scene.highlight_style || plan?.highlight_style) ||
      undefined,
  }
}

function applySceneSchemaFallbacksWithVisualLayer(
  scene: VideoScriptScene,
  index: number,
  plan?: DemoScenePlan,
  style?: string,
  totalScenes?: number,
): VideoScriptScene {
  const enriched = normalizeShowcaseSceneFields({
    scene: enrichSceneWithVisualLayer(
      applySceneSchemaFallbacks(scene, index, plan),
      index,
    ),
    index,
    scenePlan: plan,
    style,
    totalScenes,
  })

  return alignSceneToPlatformModule(enriched, plan?.stepId ?? enriched.module)
}

export function applyVideoGeneratorSchemaFallbacks(
  script: VideoScript,
  input: VideoGeneratorSchemaFallbackInput,
): VideoScript {
  const scenePlans = input.scenePlans ?? []
  const scenes = script.scenes.map((scene, index) =>
    applySceneSchemaFallbacksWithVisualLayer(
      scene,
      index,
      scenePlans[index],
      input.style,
      script.scenes.length,
    ),
  )

  const hook =
    script.hook?.trim() ||
    scenes[0]?.overlay_text ||
    "Run your coaching business in one place."
  const cta =
    script.cta?.trim() || "Start your free trial today."
  const caption =
    script.caption?.trim() || `${hook} ${cta}`.trim()
  const hashtags =
    script.hashtags?.length && script.hashtags.every(Boolean)
      ? script.hashtags
      : [
          "fitnessbusiness",
          "coachingsoftware",
          "saas",
          "gymowner",
          "FitCoreCoach",
        ]

  const thumbnail_title =
    script.thumbnail_title?.trim() || "COACH SMARTER"
  const thumbnail_text =
    script.thumbnail_text?.trim() || "One platform. Every workflow."
  const thumbnail_visual =
    script.thumbnail_visual?.trim() ||
    "Premium SaaS dashboard with electric blue accents, scroll-stopping cover frame."

  const workflow_type =
    script.workflow_type?.trim() ||
    input.workflowType?.toString().trim() ||
    "full_platform_overview"
  const workflow_summary =
    script.workflow_summary?.trim() ||
    input.workflowSummary?.trim() ||
    "Show FitCore AI as an all-in-one coaching business platform."

  const mascot =
    script.mascot ??
    input.mascot ??
    (script.style === APP_SHOWCASE_STYLE ? defaultMascot() : undefined)

  return {
    ...script,
    hook,
    cta,
    caption,
    hashtags,
    thumbnail_title,
    thumbnail_text,
    thumbnail_visual,
    workflow_type,
    workflow_summary,
    scenes,
    ...(mascot ? { mascot } : {}),
  }
}

export function formatVideoGeneratorAiSchemaJson(
  example: Record<string, unknown>,
): string {
  return JSON.stringify(example, null, 2)
}
