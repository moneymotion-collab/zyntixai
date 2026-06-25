export {
  buildWorkflowIntelligencePlan,
  enrichVideoScenesWithIntelligence,
  getWorkflowIntelligenceMetadata,
  runWorkflowIntelligenceEngine,
  buildWorkflowIntelligenceDirectorBlock,
  buildWorkflowIntelligenceContextBlock,
  buildWorkflowIntelligenceUserPrompt,
  buildDemoScenePlans,
  enrichScenesWithWorkflowIntelligence,
  getWorkflowDemoSummary,
  buildScenesFromWorkflowIntelligence,
  detectUserGoal,
  resolveWorkflowFromShortPrompt,
  selectWorkflow,
  PLATFORM_KNOWLEDGE_BASE,
  PLATFORM_FEATURE_LIST,
  buildKnowledgeBaseSummary,
  getPlatformFeature,
  listAllWorkflows,
  WORKFLOW_FEATURE_PATHS,
} from "@/lib/workflow-intelligence/engine"

export {
  WORKFLOW_TYPES,
  WORKFLOW_SCENE_ORDERS,
  WORKFLOW_PURPOSES,
  toWorkflowType,
  toAppWorkflowId,
  buildWorkflowSummary,
  getWorkflowSceneCount,
  formatWorkflowScenePath,
} from "@/lib/workflow-intelligence/workflow-types"

export {
  resolveWorkflowSceneAsset,
  resolveShowcaseAssetForModule,
  isShowcaseScreenshotAvailable,
  WORKFLOW_SCENE_ASSET_RESOLUTION,
  PRIMARY_SHOWCASE_SCREENSHOT_KEYS,
} from "@/lib/marketing/workflow-scene-asset-resolver"

export type { WorkflowIntelligenceResult } from "@/lib/workflow-intelligence/engine"

export type {
  PlatformFeatureId,
  PlatformFeatureKnowledge,
  WorkflowIntelligencePlan,
  WorkflowIntelligenceOutput,
  DemoScenePlan,
  DetectedUserGoal,
  WorkflowSelection,
  UserGoalCategory,
  BuildDemoPlanInput,
  EnrichedDemoScene,
} from "@/lib/workflow-intelligence/types"

export type {
  WorkflowType,
  WorkflowSceneStepId,
} from "@/lib/workflow-intelligence/workflow-types"
