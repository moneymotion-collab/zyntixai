import type { FitCoreShowcaseAssetKey } from "@/lib/marketing/workflow-scene-asset-resolver"
import {
  getMarketingAiFocusZone,
  type MarketingAiFocusZone,
  type MarketingAiScreenId,
} from "@/lib/marketing/marketing-ai-focus-zones"
import type { WorkflowSceneStepId } from "@/lib/workflow-intelligence/workflow-types"
import type { MarketingLaunchWorkflowScene } from "@/lib/marketing/marketing-launch-workflow-engine"

export const LAUNCH_SCENE_KEYS = [
  "problem",
  "dashboard",
  "contentIdeas",
  "viralScore",
  "calendar",
  "scheduledPosts",
  "analytics",
  "cta",
] as const

export type LaunchSceneKey = (typeof LAUNCH_SCENE_KEYS)[number]

export type LaunchWorkflowStep = {
  scene: LaunchSceneKey
  duration: number
}

/** Canonical scene order and durations for campaign launch videos. */
export const launchWorkflow: readonly LaunchWorkflowStep[] = [
  { scene: "problem", duration: 3 },
  { scene: "dashboard", duration: 3 },
  { scene: "contentIdeas", duration: 4 },
  { scene: "viralScore", duration: 4 },
  { scene: "calendar", duration: 4 },
  { scene: "scheduledPosts", duration: 4 },
  { scene: "analytics", duration: 4 },
  { scene: "cta", duration: 3 },
] as const

export type LaunchSceneTemplate = {
  screenName: string
  overlayText: string
  valueMessage: string
  cameraInstruction: string
  workflowStepId: WorkflowSceneStepId
  assetKey: FitCoreShowcaseAssetKey
  focusZone?: string
  uiFocusArea: string
  cropFocus?: string
  highlightArea?: string
  cursorAction: string
  storyBeat: string
  taglineText?: string
}

function withMarketingAiFocus(
  sceneKey: LaunchSceneKey,
  template: Omit<
    LaunchSceneTemplate,
    "focusZone" | "uiFocusArea" | "cropFocus" | "highlightArea"
  > &
    Partial<Pick<LaunchSceneTemplate, "focusZone" | "uiFocusArea" | "cropFocus" | "highlightArea">>,
): LaunchSceneTemplate {
  const zone = getMarketingAiFocusZoneByLaunchScene(sceneKey)
  if (!zone) return template as LaunchSceneTemplate

  return {
    ...template,
    focusZone: zone.focusZone,
    uiFocusArea: zone.uiFocusArea,
    cropFocus: zone.cropFocus,
    highlightArea: zone.highlightArea,
  }
}

/** Canonical on-screen overlay copy for the launch video (scene order). */
export const LAUNCH_SCENE_OVERLAYS = [
  "Stop wasting hours on marketing",
  "Never Run Out Of Content",
  "Know What Will Perform",
  "Plan 30 Days In Minutes",
  "Publish automatically",
  "Track Real Growth",
  "More clients. Less marketing work",
] as const

export const LAUNCH_CTA_TAGLINE = "Launching Soon" as const

/** Overlay headline mapped to each launch scene key. */
export const LAUNCH_OVERLAY_BY_SCENE: Record<LaunchSceneKey, string> = {
  problem: LAUNCH_SCENE_OVERLAYS[0],
  dashboard: "",
  contentIdeas: LAUNCH_SCENE_OVERLAYS[1],
  viralScore: LAUNCH_SCENE_OVERLAYS[2],
  calendar: LAUNCH_SCENE_OVERLAYS[3],
  scheduledPosts: LAUNCH_SCENE_OVERLAYS[4],
  analytics: LAUNCH_SCENE_OVERLAYS[5],
  cta: LAUNCH_SCENE_OVERLAYS[6],
}

const LAUNCH_SCENE_TO_MARKETING_AI_SCREEN = {
  dashboard: "dashboard",
  contentIdeas: "contentIdeas",
  viralScore: "viralScore",
  calendar: "calendar",
  scheduledPosts: "scheduledPosts",
  analytics: "analytics",
} as const satisfies Partial<Record<LaunchSceneKey, MarketingAiScreenId>>

function getMarketingAiFocusZoneByLaunchScene(
  sceneKey: LaunchSceneKey,
): MarketingAiFocusZone | null {
  const screen =
    LAUNCH_SCENE_TO_MARKETING_AI_SCREEN[
      sceneKey as keyof typeof LAUNCH_SCENE_TO_MARKETING_AI_SCREEN
    ]
  return screen ? getMarketingAiFocusZone(screen) : null
}

export const LAUNCH_SCENE_TEMPLATES: Record<LaunchSceneKey, LaunchSceneTemplate> =
  {
    problem: {
      screenName: "Problem",
      overlayText: LAUNCH_OVERLAY_BY_SCENE.problem,
      valueMessage:
        "Coaches lose nights and weekends to content creation, scheduling, and guessing what will perform.",
      cameraInstruction:
        "Desaturated montage — scattered apps, blank calendar, clock ticking. Quick cuts before product reveal. No app UI yet.",
      workflowStepId: "marketing_ai",
      assetKey: "marketing-ai",
      uiFocusArea: "Pain-point montage — scattered tools and empty content calendar",
      cursorAction: "None — cinematic b-roll pacing",
      storyBeat: "Marketing pain",
    },
    dashboard: withMarketingAiFocus("dashboard", {
      screenName: "Dashboard",
      overlayText: LAUNCH_OVERLAY_BY_SCENE.dashboard,
      valueMessage:
        "A coach opens FitCore AI and sees clients, schedule, and marketing priorities in one place.",
      cameraInstruction:
        "Full-screen dashboard with populated KPI cards and today's schedule. Hold wide, then slow zoom toward filled metric cards. All labels sharp and readable.",
      workflowStepId: "dashboard",
      assetKey: "dashboard",
      cursorAction:
        "Coach glides cursor across active client count and marketing summary widgets",
      storyBeat: "Coach command center",
    }),
    contentIdeas: withMarketingAiFocus("contentIdeas", {
      screenName: "Content Ideas",
      overlayText: LAUNCH_OVERLAY_BY_SCENE.contentIdeas,
      valueMessage:
        "The coach browses AI-generated reel, carousel, and story ideas tailored to their gym.",
      cameraInstruction:
        "Full-screen content ideas grid with rich demo cards visible. Slow lateral pan across idea cards — center column in focus, no tight crop on captions.",
      workflowStepId: "content_ideas",
      assetKey: "marketing-ai-idea-cards",
      cursorAction:
        "Coach hovers top idea card, highlights hook preview and save action",
      storyBeat: "Instant ideation",
    }),
    viralScore: withMarketingAiFocus("viralScore", {
      screenName: "Viral Score",
      overlayText: LAUNCH_OVERLAY_BY_SCENE.viralScore,
      valueMessage:
        "Before publishing, the coach reviews viral score, hook strength, and engagement signals.",
      cameraInstruction:
        "Full-screen idea card with viral score analysis panel visible. Gentle slow zoom on score meter and dimension bars — all labels legible.",
      workflowStepId: "viral_score",
      assetKey: "marketing-ai-idea-generator-selected",
      cursorAction:
        "Coach highlights viral score number, hook bar, and Strong/Viral Ready badge",
      storyBeat: "Performance preview",
    }),
    calendar: withMarketingAiFocus("calendar", {
      screenName: "Content Calendar",
      overlayText: LAUNCH_OVERLAY_BY_SCENE.calendar,
      valueMessage:
        "The coach slots reels, carousels, and stories across a filled monthly calendar.",
      cameraInstruction:
        "Full-screen calendar month grid with scheduled post chips on multiple days. Slow zoom toward the week view — preserve day numbers and post labels.",
      workflowStepId: "calendar",
      assetKey: "marketing-ai-calendar-scheduled",
      cursorAction:
        "Coach pans across calendar days showing scheduled content density",
      storyBeat: "Monthly planning",
    }),
    scheduledPosts: withMarketingAiFocus("scheduledPosts", {
      screenName: "Scheduled Posts",
      overlayText: LAUNCH_OVERLAY_BY_SCENE.scheduledPosts,
      valueMessage:
        "Posts move from draft to approved to scheduled — the coach approves with one click.",
      cameraInstruction:
        "Full-screen scheduled posts with populated pipeline cards and status badges. Wide frame — highlight Draft → Approved → Scheduled without cropping titles.",
      workflowStepId: "scheduled_posts",
      assetKey: "marketing-ai-calendar-draft",
      cursorAction:
        "Coach scrolls pipeline cards and highlights scheduled status badge on top post",
      storyBeat: "Publish on autopilot",
    }),
    analytics: withMarketingAiFocus("analytics", {
      screenName: "Analytics",
      overlayText: LAUNCH_OVERLAY_BY_SCENE.analytics,
      valueMessage:
        "The coach checks views, likes, engagement rate, and best-performing content to double down on winners.",
      cameraInstruction:
        "Full-screen analytics with filled KPI row and engagement trend chart. Slow reveal — axis labels and metric values stay sharp.",
      workflowStepId: "analytics",
      assetKey: "analytics",
      cursorAction:
        "Coach highlights top KPI card and upward trend line on engagement chart",
      storyBeat: "Prove what works",
    }),
    cta: {
      screenName: "CTA",
      overlayText: LAUNCH_OVERLAY_BY_SCENE.cta,
      taglineText: LAUNCH_CTA_TAGLINE,
      valueMessage:
        "FitCore AI helps coaches grow their business while marketing runs on autopilot.",
      cameraInstruction:
        "Full-screen branded CTA over soft populated dashboard backdrop. Minimal movement — hold on headline and launch tagline with subtle slow zoom out.",
      workflowStepId: "launch_cta",
      assetKey: "marketing-ai",
      uiFocusArea: "FitCore AI logo, headline, and Launching Soon tagline",
      cursorAction: "Hold on FitCore AI brand lockup with soft glow on CTA",
      storyBeat: "Launch CTA",
    },
  }

export type LaunchProductionScene = LaunchSceneTemplate & {
  step: number
  durationSeconds: number
  sceneKey: LaunchSceneKey
}

export function expandLaunchWorkflow(
  workflow: readonly LaunchWorkflowStep[] = launchWorkflow,
): LaunchProductionScene[] {
  return workflow.map((step, index) => {
    const template = LAUNCH_SCENE_TEMPLATES[step.scene]
    return {
      ...template,
      sceneKey: step.scene,
      step: index + 1,
      durationSeconds: step.duration,
    }
  })
}

export function expandLaunchWorkflowToEngineScenes(
  workflow: readonly LaunchWorkflowStep[] = launchWorkflow,
): MarketingLaunchWorkflowScene[] {
  return expandLaunchWorkflow(workflow).map((scene) => ({
    order: scene.step,
    screenName: scene.screenName,
    durationSeconds: scene.durationSeconds,
    overlayText: scene.overlayText,
    valueMessage: scene.valueMessage,
    cameraInstruction: scene.cameraInstruction,
    directorNotes: scene.taglineText
      ? `Tagline: "${scene.taglineText}".`
      : undefined,
  }))
}

export function getLaunchSceneByKey(
  key: LaunchSceneKey,
): LaunchSceneTemplate {
  return LAUNCH_SCENE_TEMPLATES[key]
}

export function getLaunchTotalDuration(
  workflow: readonly LaunchWorkflowStep[] = launchWorkflow,
): number {
  return workflow.reduce((total, step) => total + step.duration, 0)
}
