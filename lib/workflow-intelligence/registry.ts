import {
  APP_WORKFLOWS,
  type AppWorkflowDefinition,
  type AppWorkflowId,
} from "@/lib/marketing/app-workflow-director"
import { PLATFORM_KNOWLEDGE_BASE } from "@/lib/workflow-intelligence/knowledge-base"
import type {
  PlatformFeatureId,
  WorkflowSelection,
} from "@/lib/workflow-intelligence/types"
import {
  getWorkflowPurpose,
  getWorkflowSceneOrder,
  toWorkflowType,
  WORKFLOW_SCENE_STEP_DEFINITIONS,
  type WorkflowSceneStepId,
} from "@/lib/workflow-intelligence/workflow-types"

export type WorkflowFeaturePath = {
  workflowId: AppWorkflowId
  sceneSteps: WorkflowSceneStepId[]
  featurePath: PlatformFeatureId[]
  goalDescription: string
}

function buildFeaturePathFromSteps(
  steps: WorkflowSceneStepId[],
): PlatformFeatureId[] {
  return steps.map(
    (step) => WORKFLOW_SCENE_STEP_DEFINITIONS[step].platformFeatureId,
  )
}

export const WORKFLOW_FEATURE_PATHS: Record<AppWorkflowId, WorkflowFeaturePath> =
  {
    create_workout_plan: {
      workflowId: "create_workout_plan",
      sceneSteps: getWorkflowSceneOrder("create_workout_plan"),
      featurePath: buildFeaturePathFromSteps(
        getWorkflowSceneOrder("create_workout_plan"),
      ),
      goalDescription: getWorkflowPurpose("create_workout_plan"),
    },
    create_nutrition_plan: {
      workflowId: "create_nutrition_plan",
      sceneSteps: getWorkflowSceneOrder("create_nutrition_plan"),
      featurePath: buildFeaturePathFromSteps(
        getWorkflowSceneOrder("create_nutrition_plan"),
      ),
      goalDescription: getWorkflowPurpose("create_nutrition_plan"),
    },
    social_media_manager: {
      workflowId: "social_media_manager",
      sceneSteps: getWorkflowSceneOrder("social_media_manager"),
      featurePath: buildFeaturePathFromSteps(
        getWorkflowSceneOrder("social_media_manager"),
      ),
      goalDescription: getWorkflowPurpose("social_media_manager"),
    },
    full_platform_overview: {
      workflowId: "full_platform_overview",
      sceneSteps: getWorkflowSceneOrder("full_platform_overview"),
      featurePath: buildFeaturePathFromSteps(
        getWorkflowSceneOrder("full_platform_overview"),
      ),
      goalDescription: getWorkflowPurpose("full_platform_overview"),
    },
  }

const GOAL_CATEGORY_WORKFLOW_BIAS: Record<string, AppWorkflowId[]> = {
  coach_clients: [
    "create_workout_plan",
    "create_nutrition_plan",
    "full_platform_overview",
  ],
  create_content: ["social_media_manager", "full_platform_overview"],
  grow_business: ["social_media_manager", "full_platform_overview"],
  track_results: ["full_platform_overview", "social_media_manager"],
  explore_platform: ["full_platform_overview"],
}

export function getWorkflowDefinition(
  workflowId: AppWorkflowId,
): AppWorkflowDefinition {
  return APP_WORKFLOWS[workflowId]
}

export function getWorkflowFeaturePath(
  workflowId: AppWorkflowId,
): PlatformFeatureId[] {
  return WORKFLOW_FEATURE_PATHS[workflowId].featurePath
}

export function getWorkflowSceneSteps(
  workflowId: AppWorkflowId,
): WorkflowSceneStepId[] {
  return WORKFLOW_FEATURE_PATHS[workflowId].sceneSteps
}

export function buildWorkflowSelection(
  workflowId: AppWorkflowId,
  confidence: number,
  reason: string,
): WorkflowSelection {
  const workflow = APP_WORKFLOWS[workflowId]
  return {
    workflowId,
    workflowLabel: workflow.label,
    confidence,
    reason,
    featurePath: getWorkflowFeaturePath(workflowId),
    sceneSteps: getWorkflowSceneSteps(workflowId),
  }
}

export function getWorkflowGoalDescription(workflowId: AppWorkflowId): string {
  return WORKFLOW_FEATURE_PATHS[workflowId].goalDescription
}

export function getFeaturePathLabels(workflowId: AppWorkflowId): string[] {
  return getWorkflowSceneSteps(workflowId).map(
    (step) => WORKFLOW_SCENE_STEP_DEFINITIONS[step].label,
  )
}

export function getWorkflowsForGoalCategory(
  category: string,
): AppWorkflowId[] {
  return GOAL_CATEGORY_WORKFLOW_BIAS[category] ?? ["full_platform_overview"]
}

export function listAllWorkflows(): Array<{
  id: AppWorkflowId
  workflowType: string
  label: string
  description: string
  scenePath: string[]
  sceneCount: number
}> {
  return Object.values(WORKFLOW_FEATURE_PATHS).map((path) => ({
    id: path.workflowId,
    workflowType: toWorkflowType(path.workflowId),
    label: APP_WORKFLOWS[path.workflowId].label,
    description: APP_WORKFLOWS[path.workflowId].description,
    scenePath: path.sceneSteps.map(
      (step) => WORKFLOW_SCENE_STEP_DEFINITIONS[step].label,
    ),
    sceneCount: path.sceneSteps.length,
  }))
}
