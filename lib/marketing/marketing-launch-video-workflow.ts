import type {
  AppWorkflowDefinition,
  WorkflowSceneBeat,
} from "@/lib/marketing/app-workflow-director"
import {
  createMarketingLaunchWorkflowEngine,
  registerMarketingLaunchCampaign,
  type MarketingLaunchCampaign,
  type MarketingLaunchWorkflowEngine,
} from "@/lib/marketing/marketing-launch-workflow-engine"
import {
  expandLaunchWorkflow,
  expandLaunchWorkflowToEngineScenes,
  launchWorkflow,
  type LaunchProductionScene,
} from "@/lib/marketing/launch-workflow"
import {
  formatLaunchVideoCameraRules,
  LAUNCH_VIDEO_MAX_ZOOM_LEVEL,
  LAUNCH_VIDEO_ZOOM_LEVEL,
} from "@/lib/marketing/launch-video-camera-rules"
import { formatMarketingAiFocusZoneRules } from "@/lib/marketing/marketing-ai-focus-zones"

/** Canonical app workflow id for the Marketing AI launch video path. */
export const MARKETING_LAUNCH_WORKFLOW_ID = "social_media_manager" as const

export const FITCORE_AI_LAUNCH_CAMPAIGN_ID = "fitcore_ai_launch" as const

export const FITCORE_AI_LAUNCH_CAMPAIGN = {
  brandName: "ZyntixAI",
  label: "ZyntixAI Launch Campaign",
  targetAudience:
    "Personal trainers, gym owners, and online fitness coaches",
  goal:
    "Show how a coach uses the app to create, plan, publish, and improve social media content",
  style:
    "Premium, clean, modern SaaS, professional fitness business, high trust",
  defaultPrompt:
    "Premium SaaS launch campaign video for ZyntixAI. A personal trainer uses the app to create, plan, publish, and improve social media content. Full-screen populated UI, slow camera only, no blurry text, no extreme zoom.",
} as const

export type MarketingLaunchScene = LaunchProductionScene

/** Keep UI readable — no aggressive crops or text-punching zooms. */
export const MARKETING_LAUNCH_ZOOM_LEVEL = LAUNCH_VIDEO_ZOOM_LEVEL
export const MARKETING_LAUNCH_MAX_ZOOM_LEVEL = LAUNCH_VIDEO_MAX_ZOOM_LEVEL

export const MARKETING_LAUNCH_CAMERA_RULES = formatLaunchVideoCameraRules({
  title: "ZyntixAI launch campaign — camera & composition rules (STRICT)",
  extraRules: [
    "Do not show empty screens. Every scene must show populated UI: filled KPI cards, idea cards, viral scores, calendar chips, pipeline statuses, and analytics metrics.",
    "Make it feel like a real personal trainer is using the app: natural cursor paths, realistic hover states, coach-paced interactions.",
    "Premium, clean, modern SaaS aesthetic — professional fitness business, high trust.",
    'animation_type should be "slow_zoom" for scenes 1–7; CTA scene may use "slide_up".',
    "Marketing AI focus zones per screen:",
    ...formatMarketingAiFocusZoneRules().split("\n"),
  ],
})

export {
  expandLaunchWorkflow,
  expandLaunchWorkflowToEngineScenes,
  getLaunchSceneByKey,
  getLaunchTotalDuration,
  launchWorkflow,
  LAUNCH_CTA_TAGLINE,
  LAUNCH_OVERLAY_BY_SCENE,
  LAUNCH_SCENE_KEYS,
  LAUNCH_SCENE_OVERLAYS,
  LAUNCH_SCENE_TEMPLATES,
  type LaunchSceneKey,
  type LaunchWorkflowStep,
} from "@/lib/marketing/launch-workflow"

export {
  LAUNCH_VIDEO_ALLOWED_CAMERA_MOTIONS,
  LAUNCH_VIDEO_CAMERA_RULES,
  LAUNCH_VIDEO_CAMERA_RULES_TEXT,
  LAUNCH_VIDEO_MAX_ZOOM_LEVEL,
  LAUNCH_VIDEO_MIN_ZOOM_LEVEL,
  LAUNCH_VIDEO_ZOOM_LEVEL,
  clampLaunchZoomLevel,
  formatLaunchVideoCameraRules,
  isAllowedLaunchCameraMotion,
  type LaunchVideoCameraMotion,
  type LaunchVideoCameraRule,
} from "@/lib/marketing/launch-video-camera-rules"

export {
  formatMarketingAiFocusZoneRules,
  getMarketingAiFocusZone,
  getMarketingAiFocusZoneByWorkflowStep,
  MARKETING_AI_FOCUS_ZONES,
  MARKETING_AI_SCREEN_IDS,
  type MarketingAiFocusZone,
  type MarketingAiScreenId,
} from "@/lib/marketing/marketing-ai-focus-zones"

export const MARKETING_LAUNCH_VIDEO_SCENES: readonly MarketingLaunchScene[] =
  expandLaunchWorkflow(launchWorkflow)

export const MARKETING_LAUNCH_SCENE_COUNT = MARKETING_LAUNCH_VIDEO_SCENES.length

const LAUNCH_KEYWORDS = [
  "zyntixai",
  "zyntix",
  "marketing ai",
  "marketing launch",
  "launch campaign",
  "launch video",
  "personal trainer",
  "gym owner",
  "fitness coach",
  "content ideas",
  "viral score",
  "content calendar",
  "scheduled posts",
  "marketing analytics",
  "social media manager",
  "social media",
  "content pipeline",
  "gym marketing",
] as const

export const FITCORE_AI_LAUNCH_CAMPAIGN_DEFINITION: MarketingLaunchCampaign =
  registerMarketingLaunchCampaign({
    id: FITCORE_AI_LAUNCH_CAMPAIGN_ID,
    brandName: FITCORE_AI_LAUNCH_CAMPAIGN.brandName,
    label: FITCORE_AI_LAUNCH_CAMPAIGN.label,
    targetAudience: FITCORE_AI_LAUNCH_CAMPAIGN.targetAudience,
    goal: FITCORE_AI_LAUNCH_CAMPAIGN.goal,
    style: FITCORE_AI_LAUNCH_CAMPAIGN.style,
    defaultPrompt: FITCORE_AI_LAUNCH_CAMPAIGN.defaultPrompt,
    keywords: LAUNCH_KEYWORDS,
    cameraRules: MARKETING_LAUNCH_CAMERA_RULES,
    scenes: expandLaunchWorkflowToEngineScenes(launchWorkflow),
  })

export const FITCORE_AI_LAUNCH_WORKFLOW_ENGINE: MarketingLaunchWorkflowEngine =
  createMarketingLaunchWorkflowEngine(FITCORE_AI_LAUNCH_CAMPAIGN_DEFINITION)

function sceneToBeat(scene: MarketingLaunchScene): WorkflowSceneBeat {
  const isCta = scene.workflowStepId === "launch_cta"
  const narration = scene.taglineText
    ? `${scene.valueMessage} ${scene.taglineText}`
    : scene.valueMessage

  return {
    step: scene.step,
    asset_key: scene.assetKey,
    module: scene.screenName,
    storyBeat: scene.storyBeat,
    ui_focus_area: scene.uiFocusArea,
    cursor_action: scene.cursorAction,
    overlay_text: scene.overlayText,
    narration,
    camera_motion: isCta ? "pull back reveal" : "slow zoom in",
    transition: isCta ? "fade to black" : "cross dissolve",
    duration: scene.durationSeconds,
    professional_purpose: scene.valueMessage,
    visualDirection: [
      `ZyntixAI launch campaign — ${scene.screenName}`,
      scene.focusZone,
      scene.cameraInstruction,
      FITCORE_AI_LAUNCH_CAMPAIGN.style,
      "Full-screen populated SaaS UI, electric blue accents, vertical 9:16",
      "Personal trainer using the app — text must remain sharp and readable",
      scene.taglineText ? `Brand tagline on screen: "${scene.taglineText}"` : null,
    ]
      .filter(Boolean)
      .join(". "),
  }
}

export function buildMarketingLaunchWorkflowBeats(): WorkflowSceneBeat[] {
  return MARKETING_LAUNCH_VIDEO_SCENES.map(sceneToBeat)
}

export function buildMarketingLaunchWorkflowDefinition(): AppWorkflowDefinition {
  return {
    id: MARKETING_LAUNCH_WORKFLOW_ID,
    label: FITCORE_AI_LAUNCH_CAMPAIGN.label,
    description: FITCORE_AI_LAUNCH_WORKFLOW_ENGINE.getScenePath(),
    keywords: [...LAUNCH_KEYWORDS],
    beats: buildMarketingLaunchWorkflowBeats(),
  }
}

export function isMarketingLaunchWorkflow(
  workflowId: string | null | undefined,
): boolean {
  return workflowId === MARKETING_LAUNCH_WORKFLOW_ID
}

export function getMarketingLaunchSceneByStep(
  step: number,
): MarketingLaunchScene | null {
  return MARKETING_LAUNCH_VIDEO_SCENES.find((scene) => scene.step === step) ?? null
}

export function getMarketingLaunchSceneByWorkflowStep(
  stepId: string | null | undefined,
): MarketingLaunchScene | null {
  if (!stepId?.trim()) return null
  return (
    MARKETING_LAUNCH_VIDEO_SCENES.find(
      (scene) => scene.workflowStepId === stepId,
    ) ?? null
  )
}

export function getMarketingLaunchSceneByKey(
  sceneKey: string,
): MarketingLaunchScene | null {
  return (
    MARKETING_LAUNCH_VIDEO_SCENES.find((scene) => scene.sceneKey === sceneKey) ??
    null
  )
}

export function buildMarketingLaunchDirectorRules(): string {
  return FITCORE_AI_LAUNCH_WORKFLOW_ENGINE.buildDirectorRules()
}

export function buildMarketingLaunchWorkflowSummary(): string {
  return [
    FITCORE_AI_LAUNCH_WORKFLOW_ENGINE.buildWorkflowSummary(),
    "Coach-paced interactions.",
  ].join("\n")
}

export function buildFitcoreAiLaunchCampaignPrompt(): string {
  return FITCORE_AI_LAUNCH_WORKFLOW_ENGINE.buildCampaignPrompt()
}

export {
  createMarketingLaunchWorkflowEngine,
  getMarketingLaunchCampaign,
  listMarketingLaunchCampaigns,
  registerMarketingLaunchCampaign,
  buildDirectorRulesFromCampaign,
  buildWorkflowSummaryFromCampaign,
} from "@/lib/marketing/marketing-launch-workflow-engine"

export type {
  MarketingLaunchCampaign,
  MarketingLaunchWorkflowEngine,
  MarketingLaunchWorkflowScene,
} from "@/lib/marketing/marketing-launch-workflow-engine"
