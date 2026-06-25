import {
  APP_WORKFLOW_IDS,
  APP_WORKFLOWS,
  detectWorkflowFromPrompt,
  type AppWorkflowId,
} from "@/lib/marketing/app-workflow-director"
import {
  getPlatformFeatureByKeyword,
  PLATFORM_FEATURE_LIST,
} from "@/lib/workflow-intelligence/knowledge-base"
import {
  buildWorkflowSelection,
  getWorkflowsForGoalCategory,
} from "@/lib/workflow-intelligence/registry"
import type {
  DetectedUserGoal,
  UserGoalCategory,
  WorkflowSelection,
} from "@/lib/workflow-intelligence/types"

const GOAL_CATEGORY_KEYWORDS: Record<UserGoalCategory, string[]> = {
  coach_clients: [
    "coach",
    "client",
    "member",
    "workout",
    "nutrition",
    "training",
    "program",
    "assign",
    "plan",
  ],
  create_content: [
    "content",
    "post",
    "social",
    "video",
    "reel",
    "tiktok",
    "instagram",
    "marketing",
    "publish",
    "calendar",
    "ideas",
  ],
  grow_business: [
    "grow",
    "sign up",
    "signup",
    "leads",
    "acquire",
    "scale",
    "business",
    "revenue",
    "clients",
    "autopilot",
  ],
  track_results: [
    "analytics",
    "metrics",
    "performance",
    "roi",
    "retention",
    "progress",
    "results",
    "data",
    "insights",
  ],
  explore_platform: [
    "overview",
    "tour",
    "demo",
    "platform",
    "features",
    "all",
    "full",
    "showcase",
    "everything",
  ],
}

const SHORT_PROMPT_OBJECTIVES: Array<{
  patterns: RegExp[]
  objective: string
  workflowId: AppWorkflowId
  category: UserGoalCategory
}> = [
  {
    patterns: [/workout/i, /training/i, /exercise/i, /program/i],
    objective: "Demonstrate fast workout plan creation and assignment",
    workflowId: "create_workout_plan",
    category: "coach_clients",
  },
  {
    patterns: [/nutrition/i, /meal/i, /macro/i, /diet/i],
    objective: "Demonstrate nutrition planning and client delivery",
    workflowId: "create_nutrition_plan",
    category: "coach_clients",
  },
  {
    patterns: [
      /social/i,
      /content/i,
      /marketing/i,
      /post/i,
      /calendar/i,
      /publish/i,
      /video/i,
    ],
    objective: "Demonstrate AI-powered content creation and publishing",
    workflowId: "social_media_manager",
    category: "create_content",
  },
  {
    patterns: [/member/i, /client/i, /crm/i],
    objective: "Show client management and coaching workflow",
    workflowId: "create_workout_plan",
    category: "coach_clients",
  },
  {
    patterns: [/session/i, /schedule/i, /booking/i],
    objective: "Show scheduling and session management",
    workflowId: "full_platform_overview",
    category: "coach_clients",
  },
  {
    patterns: [/analytics/i, /metrics/i, /roi/i, /performance/i],
    objective: "Prove business outcomes with analytics",
    workflowId: "full_platform_overview",
    category: "track_results",
  },
]

function normalizePrompt(prompt: string): string {
  return prompt.trim().toLowerCase().replace(/\s+/g, " ")
}

function scoreKeywords(text: string, keywords: string[]): number {
  let score = 0
  for (const keyword of keywords) {
    if (text.includes(keyword.toLowerCase())) {
      score += keyword.includes(" ") ? 3 : 1
    }
  }
  return score
}

export function detectUserGoal(
  prompt: string,
  explicitGoal?: string,
): DetectedUserGoal {
  const combined = [prompt, explicitGoal ?? ""].filter(Boolean).join(" ")
  const normalized = normalizePrompt(combined)

  if (!normalized) {
    return {
      rawPrompt: prompt,
      normalizedPrompt: "",
      category: "explore_platform",
      confidence: 0.5,
      matchedKeywords: [],
      inferredObjective: "Give a complete platform overview for new prospects",
    }
  }

  const categoryScores = (
    Object.entries(GOAL_CATEGORY_KEYWORDS) as Array<
      [UserGoalCategory, string[]]
    >
  )
    .map(([category, keywords]) => ({
      category,
      score: scoreKeywords(normalized, keywords),
      matched: keywords.filter((k) => normalized.includes(k.toLowerCase())),
    }))
    .sort((a, b) => b.score - a.score)

  const topCategory = categoryScores[0]
  const category =
    topCategory.score > 0 ? topCategory.category : "explore_platform"

  const featureMatch = getPlatformFeatureByKeyword(normalized)
  const matchedKeywords = [
    ...topCategory.matched,
    ...(featureMatch
      ? featureMatch.keywords.filter((k) => normalized.includes(k.toLowerCase()))
      : []),
  ]

  for (const entry of SHORT_PROMPT_OBJECTIVES) {
    if (entry.patterns.some((pattern) => pattern.test(combined))) {
      return {
        rawPrompt: prompt,
        normalizedPrompt: normalized,
        category: entry.category,
        confidence: Math.min(0.95, 0.6 + topCategory.score * 0.05),
        matchedKeywords,
        inferredObjective: explicitGoal?.trim() || entry.objective,
      }
    }
  }

  const featureObjective = featureMatch
    ? `Highlight ${featureMatch.label}: ${featureMatch.purpose}`
    : null

  return {
    rawPrompt: prompt,
    normalizedPrompt: normalized,
    category,
    confidence: Math.min(0.9, 0.4 + topCategory.score * 0.08),
    matchedKeywords,
    inferredObjective:
      explicitGoal?.trim() ||
      featureObjective ||
      "Showcase platform value and drive sign-ups",
  }
}

export function selectWorkflow(
  prompt: string,
  goal?: DetectedUserGoal,
): WorkflowSelection {
  const detectedGoal = goal ?? detectUserGoal(prompt)
  const normalized = detectedGoal.normalizedPrompt

  const legacyWorkflowId = detectWorkflowFromPrompt(
    [prompt, detectedGoal.inferredObjective].join(" "),
  )
  const legacyScore = scoreKeywords(
    normalized,
    APP_WORKFLOWS[legacyWorkflowId].keywords,
  )

  const categoryCandidates = getWorkflowsForGoalCategory(detectedGoal.category)
  const categoryScores = categoryCandidates.map((id) => ({
    id,
    score:
      scoreKeywords(normalized, APP_WORKFLOWS[id].keywords) +
      (id === legacyWorkflowId ? 2 : 0),
  }))
  categoryScores.sort((a, b) => b.score - a.score)

  const best = categoryScores[0]
  const workflowId =
    best.score > legacyScore ? best.id : legacyWorkflowId

  const confidence = Math.min(
    0.98,
    detectedGoal.confidence + (best.score > 0 ? 0.1 : 0),
  )

  const feature = getPlatformFeatureByKeyword(normalized)
  const reason = feature
    ? `Matched feature "${feature.label}" and goal category "${detectedGoal.category}"`
    : `Matched goal category "${detectedGoal.category}" with workflow keywords`

  return buildWorkflowSelection(workflowId, confidence, reason)
}

export function resolveWorkflowFromShortPrompt(
  prompt: string,
  options?: { goal?: string },
): {
  goal: DetectedUserGoal
  workflow: WorkflowSelection
} {
  const goal = detectUserGoal(prompt, options?.goal)
  const workflow = selectWorkflow(prompt, goal)
  return { goal, workflow }
}

export function getAllWorkflowIds(): readonly AppWorkflowId[] {
  return APP_WORKFLOW_IDS
}

export function scoreAllWorkflows(prompt: string): Array<{
  workflowId: AppWorkflowId
  label: string
  score: number
}> {
  const normalized = normalizePrompt(prompt)
  return APP_WORKFLOW_IDS.map((id) => ({
    workflowId: id,
    label: APP_WORKFLOWS[id].label,
    score: scoreKeywords(normalized, APP_WORKFLOWS[id].keywords),
  })).sort((a, b) => b.score - a.score)
}

export function getRelevantFeaturesForPrompt(prompt: string): string[] {
  const normalized = normalizePrompt(prompt)
  return PLATFORM_FEATURE_LIST.filter(
    (feature) => scoreKeywords(normalized, feature.keywords) > 0,
  ).map((feature) => feature.label)
}
