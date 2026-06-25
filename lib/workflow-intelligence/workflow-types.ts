import type { FitCoreShowcaseAssetKey } from "@/lib/marketing/app-showcase-engine"
import type { AppWorkflowId } from "@/lib/marketing/app-workflow-director"
import type { PlatformFeatureId } from "@/lib/workflow-intelligence/types"

/** Public workflow type identifiers returned to clients and used in demo planning. */
export const WORKFLOW_TYPES = [
  "workout_plan_workflow",
  "nutrition_plan_workflow",
  "social_media_manager_workflow",
  "full_platform_overview",
] as const

export type WorkflowType = (typeof WORKFLOW_TYPES)[number]

export type WorkflowSceneStepId =
  | "dashboard"
  | "members"
  | "workouts"
  | "workout_builder"
  | "assign_workout"
  | "member_progress"
  | "nutrition"
  | "nutrition_builder"
  | "assign_nutrition"
  | "sessions"
  | "marketing_ai"
  | "content_ideas"
  | "viral_score"
  | "video_generator"
  | "calendar"
  | "scheduled_posts"
  | "published"
  | "analytics"
  | "recommendations"
  | "launch_cta"

export type WorkflowSceneStepDefinition = {
  stepId: WorkflowSceneStepId
  label: string
  assetKey: FitCoreShowcaseAssetKey
  platformFeatureId: PlatformFeatureId
}

export const WORKFLOW_TYPE_TO_ID: Record<WorkflowType, AppWorkflowId> = {
  workout_plan_workflow: "create_workout_plan",
  nutrition_plan_workflow: "create_nutrition_plan",
  social_media_manager_workflow: "social_media_manager",
  full_platform_overview: "full_platform_overview",
}

export const WORKFLOW_ID_TO_TYPE: Record<AppWorkflowId, WorkflowType> = {
  create_workout_plan: "workout_plan_workflow",
  create_nutrition_plan: "nutrition_plan_workflow",
  social_media_manager: "social_media_manager_workflow",
  full_platform_overview: "full_platform_overview",
}

export const WORKFLOW_SCENE_STEP_DEFINITIONS: Record<
  WorkflowSceneStepId,
  WorkflowSceneStepDefinition
> = {
  dashboard: {
    stepId: "dashboard",
    label: "Dashboard",
    assetKey: "dashboard",
    platformFeatureId: "dashboard",
  },
  members: {
    stepId: "members",
    label: "Members",
    assetKey: "members",
    platformFeatureId: "members",
  },
  workouts: {
    stepId: "workouts",
    label: "Workouts",
    assetKey: "workouts",
    platformFeatureId: "workouts",
  },
  workout_builder: {
    stepId: "workout_builder",
    label: "Workout Builder",
    assetKey: "workouts",
    platformFeatureId: "workouts",
  },
  assign_workout: {
    stepId: "assign_workout",
    label: "Assign Workout",
    assetKey: "workouts",
    platformFeatureId: "workouts",
  },
  member_progress: {
    stepId: "member_progress",
    label: "Member Progress",
    assetKey: "progress",
    platformFeatureId: "analytics",
  },
  nutrition: {
    stepId: "nutrition",
    label: "Nutrition",
    assetKey: "nutrition",
    platformFeatureId: "nutrition",
  },
  nutrition_builder: {
    stepId: "nutrition_builder",
    label: "Nutrition Builder",
    assetKey: "nutrition",
    platformFeatureId: "nutrition",
  },
  assign_nutrition: {
    stepId: "assign_nutrition",
    label: "Assign Nutrition",
    assetKey: "nutrition",
    platformFeatureId: "nutrition",
  },
  sessions: {
    stepId: "sessions",
    label: "Sessions",
    assetKey: "sessions",
    platformFeatureId: "sessions",
  },
  marketing_ai: {
    stepId: "marketing_ai",
    label: "Marketing AI",
    assetKey: "marketing-ai",
    platformFeatureId: "marketing_ai",
  },
  content_ideas: {
    stepId: "content_ideas",
    label: "Content Ideas",
    assetKey: "marketing-ai-idea-cards",
    platformFeatureId: "content_ideas",
  },
  viral_score: {
    stepId: "viral_score",
    label: "Viral Score",
    assetKey: "marketing-ai-idea-generator-selected",
    platformFeatureId: "content_ideas",
  },
  video_generator: {
    stepId: "video_generator",
    label: "Video Generator",
    assetKey: "video-generator",
    platformFeatureId: "content_ideas",
  },
  calendar: {
    stepId: "calendar",
    label: "Content Calendar",
    assetKey: "marketing-ai-calendar-scheduled",
    platformFeatureId: "calendar",
  },
  scheduled_posts: {
    stepId: "scheduled_posts",
    label: "Scheduled Posts",
    assetKey: "marketing-ai-calendar-draft",
    platformFeatureId: "published",
  },
  published: {
    stepId: "published",
    label: "Published",
    assetKey: "published",
    platformFeatureId: "published",
  },
  analytics: {
    stepId: "analytics",
    label: "Analytics",
    assetKey: "analytics",
    platformFeatureId: "analytics",
  },
  recommendations: {
    stepId: "recommendations",
    label: "Recommendations",
    assetKey: "analytics",
    platformFeatureId: "marketing_ai",
  },
  launch_cta: {
    stepId: "launch_cta",
    label: "CTA",
    assetKey: "marketing-ai",
    platformFeatureId: "marketing_ai",
  },
}

export const WORKFLOW_SCENE_ORDERS: Record<WorkflowType, WorkflowSceneStepId[]> =
  {
    workout_plan_workflow: [
      "dashboard",
      "members",
      "workouts",
      "workout_builder",
      "assign_workout",
      "member_progress",
    ],
    nutrition_plan_workflow: [
      "dashboard",
      "members",
      "nutrition",
      "nutrition_builder",
      "assign_nutrition",
      "member_progress",
    ],
    social_media_manager_workflow: [
      "marketing_ai",
      "dashboard",
      "content_ideas",
      "viral_score",
      "calendar",
      "scheduled_posts",
      "analytics",
      "launch_cta",
    ],
    full_platform_overview: [
      "dashboard",
      "members",
      "workouts",
      "nutrition",
      "sessions",
      "marketing_ai",
      "analytics",
    ],
  }

export const WORKFLOW_PURPOSES: Record<WorkflowType, string> = {
  workout_plan_workflow:
    "Show how a coach creates and assigns a workout plan.",
  nutrition_plan_workflow:
    "Show how a coach creates and assigns a nutrition plan.",
  social_media_manager_workflow:
    "FitCore AI launch campaign: a coach creates, plans, publishes, and improves social media content with populated full-screen UI.",
  full_platform_overview:
    "Show FitCore as an all-in-one coaching business platform.",
}

export function toWorkflowType(workflowId: AppWorkflowId): WorkflowType {
  return WORKFLOW_ID_TO_TYPE[workflowId]
}

export function toAppWorkflowId(workflowType: WorkflowType): AppWorkflowId {
  return WORKFLOW_TYPE_TO_ID[workflowType]
}

export function getWorkflowSceneOrder(
  workflowId: AppWorkflowId,
): WorkflowSceneStepId[] {
  return WORKFLOW_SCENE_ORDERS[toWorkflowType(workflowId)]
}

export function getWorkflowSceneCount(workflowId: AppWorkflowId): number {
  return getWorkflowSceneOrder(workflowId).length
}

export function getWorkflowPurpose(workflowId: AppWorkflowId): string {
  return WORKFLOW_PURPOSES[toWorkflowType(workflowId)]
}

export function formatWorkflowScenePath(workflowId: AppWorkflowId): string {
  return getWorkflowSceneOrder(workflowId).join(" → ")
}

export function buildWorkflowSummary(
  workflowId: AppWorkflowId,
  inferredObjective?: string,
): string {
  const purpose = getWorkflowPurpose(workflowId)
  const path = formatWorkflowScenePath(workflowId)
  const objective = inferredObjective?.trim()

  const lines = [
    purpose,
    `Scene path: ${path}`,
    objective ? `Demo focus: ${objective}` : null,
  ].filter(Boolean)

  return lines.join("\n")
}
