import {
  buildMarketingLaunchDirectorRules,
} from "@/lib/marketing/marketing-launch-video-workflow"
import {
  buildWorkflowDirectorSystemPromptBlock,
  buildWorkflowJsonSceneExample,
  getWorkflowDefinition,
  getWorkflowSceneCount,
  type AppWorkflowDefinition,
} from "@/lib/marketing/app-workflow-director"
import {
  SCENE_CAMERA_MOTIONS,
  SCENE_TRANSITIONS,
} from "@/lib/marketing/video-scene-cinematics"
import {
  buildVisualLayerDirectorRules,
} from "@/lib/marketing/scene-visual-layer"
import { buildSceneAnimationDirectorRules } from "@/lib/marketing/scene-animation"
import {
  buildKnowledgeBaseSummary,
  buildFeatureKnowledgeBlock,
} from "@/lib/workflow-intelligence/knowledge-base"
import { getWorkflowGoalDescription } from "@/lib/workflow-intelligence/registry"
import { buildDemoScenePlans } from "@/lib/workflow-intelligence/scene-builder"
import type {
  DetectedUserGoal,
  WorkflowIntelligencePlan,
  WorkflowSelection,
} from "@/lib/workflow-intelligence/types"
import {
  buildWorkflowSummary,
  toWorkflowType,
} from "@/lib/workflow-intelligence/workflow-types"

export function buildWorkflowIntelligenceContextBlock(
  workflow: WorkflowSelection,
  goal: DetectedUserGoal,
): string {
  const uniqueFeatures = [...new Set(workflow.featurePath)]
  const featureBlocks = uniqueFeatures
    .map((id) => buildFeatureKnowledgeBlock(id))
    .join("\n\n")

  return `Workflow Intelligence — semantic product knowledge (use this instead of relying on screenshots alone):

User goal: ${goal.inferredObjective}
Goal category: ${goal.category}
Confidence: ${Math.round(goal.confidence * 100)}%
Workflow type: ${toWorkflowType(workflow.workflowId)}
Selected workflow: ${workflow.workflowLabel} (${workflow.workflowId})
Selection reason: ${workflow.reason}

Workflow summary:
${buildWorkflowSummary(workflow.workflowId, goal.inferredObjective)}

Workflow objective: ${getWorkflowGoalDescription(workflow.workflowId)}

Platform feature knowledge for this demo:
${featureBlocks}

Full platform map:
${buildKnowledgeBaseSummary()}`
}

export function buildWorkflowIntelligenceDirectorBlock(
  workflow: AppWorkflowDefinition,
  goal: DetectedUserGoal,
): string {
  const plans = buildDemoScenePlans(workflow.id)
  const knowledgeEnrichedScenes = plans
    .map(
      (plan) =>
        `Scene ${plan.step} — ${plan.storyBeat}:
  UI focus: ${plan.ui_focus_area}
  Cursor action: ${plan.cursor_action}
  Overlay text: "${plan.overlay_text}"
  Narration: "${plan.narration}"
  Professional purpose: ${plan.professional_purpose}
  Cinematic direction: ${plan.cinematicDirection}
  Asset: ${plan.asset_key}
  crop_focus: ${plan.crop_focus}
  highlight_area: ${plan.highlight_area}
  blur_background: ${plan.blur_background}
  zoom_level: ${plan.zoom_level}
  layout_style: ${plan.layout_style}
  animation_type: ${plan.animation_type}
  animation_duration: ${plan.animation_duration}
  caption_position: ${plan.caption_position}
  highlight_style: ${plan.highlight_style}`,
    )
    .join("\n")

  const baseBlock = buildWorkflowDirectorSystemPromptBlock(workflow)

  const launchBlock = workflow.id === "social_media_manager"
    ? `\n\n${buildMarketingLaunchDirectorRules()}`
    : ""

  return `${baseBlock}

Workflow Intelligence enrichment (semantic direction — do NOT produce static screenshot slideshows):
User inferred objective: ${goal.inferredObjective}

Knowledge-enriched scene direction:
${knowledgeEnrichedScenes}

Direction rules:
- Describe LIVE UI interactions: animated cursor, highlighted elements, hover states, drawer opens
- Each scene must advance the product workflow logically — purpose → action → business value
- overlay_text: max 8 words, benefit-focused headline
- narration: one sentence explaining why this step matters to the coach's business
- ui_focus_area: name the exact UI element (button, widget, chart, drawer)
- cursor_action: describe mouse movement and click sequence
- visual: cinematic SaaS demo framing with interaction in progress, not a flat screenshot
- Vary camera_motion across scenes: ${SCENE_CAMERA_MOTIONS.slice(0, 8).join(", ")}
- Vary transition across scenes: ${SCENE_TRANSITIONS.slice(0, 8).join(", ")}
- NEVER leave crop_focus, highlight_area, blur_background, zoom_level, or layout_style empty for app_showcase or saas_demo scenes
- NEVER leave animation_type, animation_duration, caption_position, or highlight_style empty for app_showcase or saas_demo scenes

${buildSceneAnimationDirectorRules()}

${buildVisualLayerDirectorRules()}${launchBlock}`
}

export function buildShortPromptExpansionBlock(
  prompt: string,
  goal: DetectedUserGoal,
  workflow: WorkflowSelection,
): string {
  const isShort = prompt.trim().split(/\s+/).length <= 6
  const sceneCount = getWorkflowSceneCount(workflow.workflowId)

  if (!isShort) {
    return `Expand the user's detailed request into a professional SaaS demo aligned with workflow "${workflow.workflowLabel}".`
  }

  return `The user provided a SHORT prompt ("${prompt.trim()}"). Automatically expand it into a full professional product demo:
- Inferred objective: ${goal.inferredObjective}
- Workflow: ${workflow.workflowLabel}
- Do NOT ask for more input — produce a complete ${sceneCount}-scene demo
- Open with a pain-point hook tied to ${goal.category.replace(/_/g, " ")}
- Close with a clear trial/demo CTA
- Every scene must have ui_focus_area, cursor_action, overlay_text, narration, professional_purpose, crop_focus, highlight_area, blur_background, zoom_level, layout_style, animation_type, animation_duration, caption_position, and highlight_style`
}

export function buildWorkflowIntelligenceJsonExample(
  workflow: AppWorkflowDefinition,
): object {
  const base = buildWorkflowJsonSceneExample(workflow)
  const plans = buildDemoScenePlans(workflow.id)

  return base.map((scene, index) => {
    const plan = plans[index]
    if (!plan) return scene

    return {
      ...scene,
      ui_focus_area: plan.ui_focus_area,
      cursor_action: plan.cursor_action,
      overlay_text: plan.overlay_text,
      narration: plan.narration,
      professional_purpose: plan.professional_purpose,
      visual: plan.cinematicDirection,
      image_prompt: plan.image_prompt,
      asset_key: plan.asset_key,
      asset_url: plan.asset_url,
      crop_focus: plan.crop_focus,
      highlight_area: plan.highlight_area,
      blur_background: plan.blur_background,
      zoom_level: plan.zoom_level,
      layout_style: plan.layout_style,
      animation_type: plan.animation_type,
      animation_duration: plan.animation_duration,
      caption_position: plan.caption_position,
      highlight_style: plan.highlight_style,
    }
  })
}

export function attachDirectorPromptToPlan(
  plan: WorkflowIntelligencePlan,
): WorkflowIntelligencePlan {
  const workflow = getWorkflowDefinition(plan.workflow.workflowId)
  return {
    ...plan,
    directorPromptBlock: buildWorkflowIntelligenceDirectorBlock(
      workflow,
      plan.goal,
    ),
  }
}

export function buildWorkflowIntelligenceUserPrompt(input: {
  prompt: string
  goal: DetectedUserGoal
  workflow: WorkflowSelection
  brandName?: string
  targetAudience?: string
  platform?: string
  explicitGoal?: string
  brandContext?: string
}): string {
  const expansion = buildShortPromptExpansionBlock(
    input.prompt,
    input.goal,
    input.workflow,
  )

  return `
Brand: ${input.brandName ?? "FitCore AI"}
Platform: ${input.platform ?? "instagram"}
Target audience: ${input.targetAudience ?? "Fitness coaches and gym owners"}
Business goal: ${input.explicitGoal ?? input.goal.inferredObjective}

${expansion}

User prompt:
${input.prompt}

${input.brandContext ?? ""}
  `.trim()
}
