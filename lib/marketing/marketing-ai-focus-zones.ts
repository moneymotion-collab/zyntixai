import type { WorkflowSceneStepId } from "@/lib/workflow-intelligence/workflow-types"

export const MARKETING_AI_SCREEN_IDS = [
  "dashboard",
  "contentIdeas",
  "viralScore",
  "calendar",
  "scheduledPosts",
  "analytics",
] as const

export type MarketingAiScreenId = (typeof MARKETING_AI_SCREEN_IDS)[number]

export type MarketingAiFocusZone = {
  screenName: string
  /** Director rule — what the camera should emphasize. */
  focusZone: string
  /** UI element label for workflow director and scene metadata. */
  uiFocusArea: string
  cropFocus: string
  highlightArea: string
}

export const MARKETING_AI_FOCUS_ZONES: Record<
  MarketingAiScreenId,
  MarketingAiFocusZone
> = {
  dashboard: {
    screenName: "Dashboard",
    focusZone: "Focus on KPI cards.",
    uiFocusArea: "KPI cards",
    cropFocus: "Full-screen dashboard — hold wide, then slow zoom toward KPI cards",
    highlightArea: "KPI cards",
  },
  contentIdeas: {
    screenName: "Content Ideas",
    focusZone: "Focus on generated ideas.",
    uiFocusArea: "Generated ideas",
    cropFocus:
      "Full-screen content ideas grid — center on populated AI-generated idea cards",
    highlightArea: "Generated ideas",
  },
  viralScore: {
    screenName: "Viral Score",
    focusZone: "Focus on score card and progress bars.",
    uiFocusArea: "Score card and progress bars",
    cropFocus:
      "Full-screen viral score panel — gentle zoom on score card and progress bars",
    highlightArea: "Score card and progress bars",
  },
  calendar: {
    screenName: "Content Calendar",
    focusZone: "Focus on planned month.",
    uiFocusArea: "Planned month",
    cropFocus:
      "Full-screen monthly calendar — slow zoom across the planned month grid",
    highlightArea: "Planned month",
  },
  scheduledPosts: {
    screenName: "Scheduled Posts",
    focusZone: "Focus on publishing pipeline.",
    uiFocusArea: "Publishing pipeline",
    cropFocus:
      "Full-screen scheduled posts view — highlight the publishing pipeline cards",
    highlightArea: "Publishing pipeline",
  },
  analytics: {
    screenName: "Analytics",
    focusZone: "Focus on growth metrics and charts.",
    uiFocusArea: "Growth metrics and charts",
    cropFocus:
      "Full-screen analytics — slow reveal on growth metrics and trend charts",
    highlightArea: "Growth metrics and charts",
  },
}

export const WORKFLOW_STEP_TO_MARKETING_AI_SCREEN: Partial<
  Record<WorkflowSceneStepId, MarketingAiScreenId>
> = {
  dashboard: "dashboard",
  content_ideas: "contentIdeas",
  viral_score: "viralScore",
  calendar: "calendar",
  scheduled_posts: "scheduledPosts",
  analytics: "analytics",
}

export function getMarketingAiFocusZone(
  screen: MarketingAiScreenId,
): MarketingAiFocusZone {
  return MARKETING_AI_FOCUS_ZONES[screen]
}

export function getMarketingAiFocusZoneByWorkflowStep(
  stepId: WorkflowSceneStepId | string | null | undefined,
): MarketingAiFocusZone | null {
  if (!stepId?.trim()) return null
  const screen =
    WORKFLOW_STEP_TO_MARKETING_AI_SCREEN[stepId as WorkflowSceneStepId]
  return screen ? MARKETING_AI_FOCUS_ZONES[screen] : null
}

export function formatMarketingAiFocusZoneRules(): string {
  return MARKETING_AI_SCREEN_IDS.map((screenId) => {
    const zone = MARKETING_AI_FOCUS_ZONES[screenId]
    return `${zone.screenName}: ${zone.focusZone}`
  }).join("\n")
}
