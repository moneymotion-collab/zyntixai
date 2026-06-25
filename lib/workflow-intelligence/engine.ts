import {
  getWorkflowDefinition,
  getWorkflowSceneCount as getBeatSceneCount,
  type AppWorkflowDefinition,
  type AppWorkflowId,
} from "@/lib/marketing/app-workflow-director"
import type { VideoScriptScene } from "@/lib/marketing/video-script-types"
import { resolveWorkflowFromShortPrompt } from "@/lib/workflow-intelligence/detector"
import {
  attachDirectorPromptToPlan,
  buildWorkflowIntelligenceContextBlock,
  buildWorkflowIntelligenceDirectorBlock,
  buildWorkflowIntelligenceUserPrompt,
} from "@/lib/workflow-intelligence/prompt-blocks"
import { getWorkflowGoalDescription } from "@/lib/workflow-intelligence/registry"
import {
  assembleWorkflowIntelligencePlan,
  buildDemoScenePlans,
  buildScenesFromWorkflowIntelligence,
  enrichScenesWithWorkflowIntelligence,
} from "@/lib/workflow-intelligence/scene-builder"
import type {
  BuildDemoPlanInput,
  DetectedUserGoal,
  WorkflowIntelligenceOutput,
  WorkflowIntelligencePlan,
  WorkflowSelection,
} from "@/lib/workflow-intelligence/types"
import {
  buildWorkflowSummary,
  toWorkflowType,
} from "@/lib/workflow-intelligence/workflow-types"

export type WorkflowIntelligenceResult = {
  plan: WorkflowIntelligencePlan
  workflow: AppWorkflowDefinition
  workflowId: AppWorkflowId
  systemPromptBlock: string
  contextBlock: string
  userPrompt: string
}

export function buildWorkflowIntelligencePlan(
  input: BuildDemoPlanInput,
): WorkflowIntelligenceResult {
  const { goal, workflow: workflowSelection } = resolveWorkflowFromShortPrompt(
    input.prompt,
    { goal: input.goal },
  )

  const basePlan = assembleWorkflowIntelligencePlan(goal, workflowSelection)
  const plan = attachDirectorPromptToPlan(basePlan)
  const workflow = getWorkflowDefinition(plan.workflow.workflowId)

  const contextBlock = buildWorkflowIntelligenceContextBlock(
    plan.workflow,
    plan.goal,
  )
  const systemPromptBlock = plan.directorPromptBlock

  const userPrompt = buildWorkflowIntelligenceUserPrompt({
    prompt: input.prompt,
    goal: plan.goal,
    workflow: plan.workflow,
    brandName: input.brandName,
    targetAudience: input.targetAudience,
    explicitGoal: input.goal,
  })

  return {
    plan,
    workflow,
    workflowId: plan.workflow.workflowId,
    systemPromptBlock,
    contextBlock,
    userPrompt,
  }
}

/**
 * Core Workflow Intelligence Engine entry point.
 * Analyzes a short prompt, selects the best product workflow, and produces
 * a complete professional SaaS demo scene plan with assets attached.
 */
export function runWorkflowIntelligenceEngine(
  input: BuildDemoPlanInput,
): WorkflowIntelligenceOutput {
  const style = input.style?.trim() || "saas_demo"
  const { goal, workflow } = resolveWorkflowFromShortPrompt(input.prompt, {
    goal: input.goal,
  })

  const workflowType = toWorkflowType(workflow.workflowId)
  const workflowSummary = buildWorkflowSummary(
    workflow.workflowId,
    goal.inferredObjective,
  )
  const scenes = buildScenesFromWorkflowIntelligence(workflow.workflowId, style)

  return {
    workflow_type: workflowType,
    workflow_summary: workflowSummary,
    goal,
    workflow,
    scenes,
  }
}

export function enrichVideoScenesWithIntelligence(
  scenes: VideoScriptScene[],
  workflowId: AppWorkflowId,
  style: string,
): VideoScriptScene[] {
  return enrichScenesWithWorkflowIntelligence(scenes, workflowId, style)
}

export function getWorkflowIntelligenceMetadata(
  input: BuildDemoPlanInput,
): {
  workflowId: AppWorkflowId
  workflowType: ReturnType<typeof toWorkflowType>
  workflowLabel: string
  workflowSummary: string
  sceneCount: number
  goal: DetectedUserGoal
  workflow: WorkflowSelection
  scenePlans: ReturnType<typeof buildDemoScenePlans>
  workflowDescription: string
} {
  const { goal, workflow } = resolveWorkflowFromShortPrompt(input.prompt, {
    goal: input.goal,
  })

  return {
    workflowId: workflow.workflowId,
    workflowType: toWorkflowType(workflow.workflowId),
    workflowLabel: workflow.workflowLabel,
    workflowSummary: buildWorkflowSummary(workflow.workflowId, goal.inferredObjective),
    sceneCount: getBeatSceneCount(workflow.workflowId),
    goal,
    workflow,
    scenePlans: buildDemoScenePlans(workflow.workflowId),
    workflowDescription: getWorkflowGoalDescription(workflow.workflowId),
  }
}

export {
  buildWorkflowIntelligenceDirectorBlock,
  buildWorkflowIntelligenceContextBlock,
  buildWorkflowIntelligenceUserPrompt,
} from "@/lib/workflow-intelligence/prompt-blocks"

export {
  buildDemoScenePlans,
  enrichScenesWithWorkflowIntelligence,
  getWorkflowDemoSummary,
  buildScenesFromWorkflowIntelligence,
} from "@/lib/workflow-intelligence/scene-builder"

export {
  detectUserGoal,
  resolveWorkflowFromShortPrompt,
  selectWorkflow,
} from "@/lib/workflow-intelligence/detector"

export {
  PLATFORM_KNOWLEDGE_BASE,
  PLATFORM_FEATURE_LIST,
  buildKnowledgeBaseSummary,
  getPlatformFeature,
} from "@/lib/workflow-intelligence/knowledge-base"

export {
  listAllWorkflows,
  WORKFLOW_FEATURE_PATHS,
} from "@/lib/workflow-intelligence/registry"
