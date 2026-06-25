import { LAUNCH_VIDEO_CAMERA_RULES_TEXT } from "@/lib/marketing/launch-video-camera-rules"

export type MarketingLaunchWorkflowScene = {
  /** 1-based scene order in the campaign video. */
  order: number
  screenName: string
  durationSeconds: number
  overlayText: string
  valueMessage: string
  cameraInstruction: string
  /** Extra director context (e.g. tagline, CTA lockup). */
  directorNotes?: string
}

export type MarketingLaunchCampaign = {
  id: string
  label: string
  brandName: string
  targetAudience: string
  goal: string
  style: string
  defaultPrompt?: string
  keywords?: readonly string[]
  cameraRules?: string
  scenes: readonly MarketingLaunchWorkflowScene[]
}

export type MarketingLaunchWorkflowEngine = {
  campaign: MarketingLaunchCampaign
  getSceneOrder: () => number[]
  getScenes: () => readonly MarketingLaunchWorkflowScene[]
  getSceneCount: () => number
  getTotalDurationSeconds: () => number
  getScenePath: () => string
  getSceneByOrder: (order: number) => MarketingLaunchWorkflowScene | null
  getSceneByScreenName: (screenName: string) => MarketingLaunchWorkflowScene | null
  buildDirectorRules: () => string
  buildWorkflowSummary: () => string
  buildCampaignPrompt: () => string
  buildSceneScriptBlock: () => string
}

export const DEFAULT_LAUNCH_CAMERA_RULES = LAUNCH_VIDEO_CAMERA_RULES_TEXT

export {
  LAUNCH_VIDEO_CAMERA_RULES,
  LAUNCH_VIDEO_CAMERA_RULES_TEXT,
  LAUNCH_VIDEO_ALLOWED_CAMERA_MOTIONS,
  LAUNCH_VIDEO_MAX_ZOOM_LEVEL,
  LAUNCH_VIDEO_MIN_ZOOM_LEVEL,
  LAUNCH_VIDEO_ZOOM_LEVEL,
  clampLaunchZoomLevel,
  formatLaunchVideoCameraRules,
  isAllowedLaunchCameraMotion,
} from "@/lib/marketing/launch-video-camera-rules"

export type {
  BuildLaunchVideoCameraRulesOptions,
  LaunchVideoCameraMotion,
  LaunchVideoCameraRule,
} from "@/lib/marketing/launch-video-camera-rules"

const campaignRegistry = new Map<string, MarketingLaunchCampaign>()

function assertValidCampaign(campaign: MarketingLaunchCampaign): void {
  if (!campaign.scenes.length) {
    throw new Error(
      `Marketing launch campaign "${campaign.id}" must define at least one scene.`,
    )
  }

  const orders = campaign.scenes.map((scene) => scene.order)
  const uniqueOrders = new Set(orders)
  if (uniqueOrders.size !== orders.length) {
    throw new Error(
      `Marketing launch campaign "${campaign.id}" has duplicate scene order values.`,
    )
  }
}

function sortScenes(
  scenes: readonly MarketingLaunchWorkflowScene[],
): MarketingLaunchWorkflowScene[] {
  return [...scenes].sort((a, b) => a.order - b.order)
}

function formatSceneLine(scene: MarketingLaunchWorkflowScene): string {
  const notes = scene.directorNotes ? ` ${scene.directorNotes}` : ""
  return `Scene ${scene.order} — ${scene.screenName}: overlay "${scene.overlayText}".${notes} Value: ${scene.valueMessage}. Camera: ${scene.cameraInstruction}. Duration: ${scene.durationSeconds}s.`
}

export function registerMarketingLaunchCampaign(
  campaign: MarketingLaunchCampaign,
): MarketingLaunchCampaign {
  assertValidCampaign(campaign)
  campaignRegistry.set(campaign.id, campaign)
  return campaign
}

export function getMarketingLaunchCampaign(
  id: string,
): MarketingLaunchCampaign | undefined {
  return campaignRegistry.get(id)
}

export function listMarketingLaunchCampaigns(): MarketingLaunchCampaign[] {
  return [...campaignRegistry.values()]
}

export function createMarketingLaunchWorkflowEngine(
  campaign: MarketingLaunchCampaign | string,
): MarketingLaunchWorkflowEngine {
  const resolved =
    typeof campaign === "string"
      ? campaignRegistry.get(campaign)
      : campaign

  if (!resolved) {
    const id = typeof campaign === "string" ? campaign : campaign.id
    throw new Error(`Marketing launch campaign not found: "${id}"`)
  }

  assertValidCampaign(resolved)
  const scenes = sortScenes(resolved.scenes)

  const getScenes = () => scenes

  return {
    campaign: resolved,

    getSceneOrder: () => scenes.map((scene) => scene.order),

    getScenes,

    getSceneCount: () => scenes.length,

    getTotalDurationSeconds: () =>
      scenes.reduce((total, scene) => total + scene.durationSeconds, 0),

    getScenePath: () => scenes.map((scene) => scene.screenName).join(" → "),

    getSceneByOrder: (order) =>
      scenes.find((scene) => scene.order === order) ?? null,

    getSceneByScreenName: (screenName) => {
      const normalized = screenName.trim().toLowerCase()
      return (
        scenes.find(
          (scene) => scene.screenName.trim().toLowerCase() === normalized,
        ) ?? null
      )
    },

    buildSceneScriptBlock: () =>
      scenes.map((scene) => formatSceneLine(scene)).join("\n"),

    buildDirectorRules: () => {
      const cameraRules =
        resolved.cameraRules?.trim() || DEFAULT_LAUNCH_CAMERA_RULES

      return `${cameraRules}

Campaign: ${resolved.label}
Brand: ${resolved.brandName}
Target audience: ${resolved.targetAudience}
Goal: ${resolved.goal}
Style: ${resolved.style}

Fixed scene order (EXACTLY ${scenes.length} scenes — never reorder or skip):
${scenes.map((scene) => formatSceneLine(scene)).join("\n")}`
    },

    buildWorkflowSummary: () =>
      [
        resolved.goal,
        `Audience: ${resolved.targetAudience}`,
        `Scene path: ${scenes.map((s) => s.screenName).join(" → ")}`,
        "Populated full-screen UI, slow camera only, sharp text, natural interactions.",
      ].join("\n"),

    buildCampaignPrompt: () =>
      resolved.defaultPrompt?.trim() ||
      `Premium SaaS launch campaign video for ${resolved.brandName}. ${resolved.goal} ${resolved.style}.`,
  }
}

export function buildDirectorRulesFromCampaign(
  campaign: MarketingLaunchCampaign | string,
): string {
  return createMarketingLaunchWorkflowEngine(campaign).buildDirectorRules()
}

export function buildWorkflowSummaryFromCampaign(
  campaign: MarketingLaunchCampaign | string,
): string {
  return createMarketingLaunchWorkflowEngine(campaign).buildWorkflowSummary()
}
