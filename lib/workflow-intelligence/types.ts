import type { FitCoreShowcaseAssetKey } from "@/lib/marketing/app-showcase-engine"
import type {
  SceneAnimationType,
  SceneCaptionPosition,
  SceneHighlightStyle,
} from "@/lib/marketing/scene-animation"
import type { SceneLayoutStyle } from "@/lib/marketing/scene-visual-layer"
import type { SceneCameraMotion, SceneTransition } from "@/lib/marketing/video-scene-cinematics"
import type { VideoScriptScene } from "@/lib/marketing/video-script-types"
import type { AppWorkflowId } from "@/lib/marketing/app-workflow-director"

export const PLATFORM_FEATURE_IDS = [
  "dashboard",
  "members",
  "workouts",
  "nutrition",
  "sessions",
  "marketing_ai",
  "content_ideas",
  "calendar",
  "published",
  "analytics",
] as const

export type PlatformFeatureId = (typeof PLATFORM_FEATURE_IDS)[number]

export type PlatformFeatureKnowledge = {
  id: PlatformFeatureId
  label: string
  route: string
  assetKey: FitCoreShowcaseAssetKey
  purpose: string
  businessValue: string
  nextLogicalStep: PlatformFeatureId | null
  keywords: string[]
  primaryUiElements: string[]
  typicalUserActions: string[]
  demoFocusAreas: string[]
}

export type UserGoalCategory =
  | "grow_business"
  | "coach_clients"
  | "create_content"
  | "track_results"
  | "explore_platform"

export type DetectedUserGoal = {
  rawPrompt: string
  normalizedPrompt: string
  category: UserGoalCategory
  confidence: number
  matchedKeywords: string[]
  inferredObjective: string
}

export type WorkflowSelection = {
  workflowId: AppWorkflowId
  workflowLabel: string
  confidence: number
  reason: string
  featurePath: PlatformFeatureId[]
  sceneSteps: import("@/lib/workflow-intelligence/workflow-types").WorkflowSceneStepId[]
}

export type DemoScenePlan = {
  step: number
  stepId: import("@/lib/workflow-intelligence/workflow-types").WorkflowSceneStepId
  featureId: PlatformFeatureId
  storyBeat: string
  ui_focus_area: string
  cursor_action: string
  overlay_text: string
  narration: string
  professional_purpose: string
  cinematicDirection: string
  camera_motion: SceneCameraMotion
  transition: SceneTransition
  duration: number
  asset_key: FitCoreShowcaseAssetKey
  asset_url: string
  /** True when the mapped PNG exists under public/app-showcase/. */
  screenshot_available: boolean
  /** DALL-E fallback when screenshot is unavailable. */
  image_prompt: string
  crop_focus: string
  highlight_area: string
  blur_background: boolean
  zoom_level: number
  layout_style: SceneLayoutStyle
  animation_type: SceneAnimationType
  animation_duration: number
  caption_position: SceneCaptionPosition
  highlight_style: SceneHighlightStyle
}

export type WorkflowIntelligencePlan = {
  goal: DetectedUserGoal
  workflow: WorkflowSelection
  workflowType: import("@/lib/workflow-intelligence/workflow-types").WorkflowType
  workflowSummary: string
  scenes: DemoScenePlan[]
  knowledgeContext: string
  directorPromptBlock: string
}

export type WorkflowIntelligenceOutput = {
  workflow_type: import("@/lib/workflow-intelligence/workflow-types").WorkflowType
  workflow_summary: string
  goal: DetectedUserGoal
  workflow: WorkflowSelection
  scenes: EnrichedDemoScene[]
}

export type BuildDemoPlanInput = {
  prompt: string
  goal?: string
  targetAudience?: string
  brandName?: string
  style?: string
}

export type EnrichedDemoScene = VideoScriptScene & {
  featureId: PlatformFeatureId
  stepId: import("@/lib/workflow-intelligence/workflow-types").WorkflowSceneStepId
}
