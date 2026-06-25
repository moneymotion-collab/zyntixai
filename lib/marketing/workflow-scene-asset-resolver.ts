export const APP_SHOWCASE_BASE_PATH = "/app-showcase" as const

/** Screenshot keys available under /public/app-showcase/. */
export const PRIMARY_SHOWCASE_SCREENSHOT_KEYS = [
  "dashboard",
  "members",
  "workouts",
  "nutrition",
  "sessions",
  "marketing-ai",
  "content-ideas",
  "video-generator",
  "calendar",
  "published",
  "analytics",
  "progress",
] as const

/** Marketing launch screenshots under /public/app-showcase/ (populated UI). */
export const MARKETING_LAUNCH_SCREENSHOT_KEYS = [
  "marketing-ai-idea-cards",
  "marketing-ai-idea-generator-selected",
  "marketing-ai-calendar-scheduled",
  "marketing-ai-calendar-draft",
] as const

export type MarketingLaunchScreenshotKey =
  (typeof MARKETING_LAUNCH_SCREENSHOT_KEYS)[number]

export type PrimaryShowcaseScreenshotKey =
  (typeof PRIMARY_SHOWCASE_SCREENSHOT_KEYS)[number]

/** Legacy keys kept for backward compatibility with older beats/scripts. */
export type LegacyShowcaseAssetKey =
  | "workout-detail"
  | "assign-workout"
  | "nutrition-detail"
  | "assign-nutrition"
  | "recommendations"
  | "member-view"

export type FitCoreShowcaseAssetKey =
  | PrimaryShowcaseScreenshotKey
  | MarketingLaunchScreenshotKey
  | LegacyShowcaseAssetKey

export type FitCoreShowcaseAsset = {
  asset_key: FitCoreShowcaseAssetKey
  asset_url: string
}

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

export const WORKFLOW_SCENE_ASSET_RESOLUTION: Record<
  WorkflowSceneStepId,
  readonly FitCoreShowcaseAssetKey[]
> = {
  dashboard: ["dashboard"],
  members: ["members"],
  workouts: ["workouts"],
  workout_builder: ["workouts"],
  assign_workout: ["workouts"],
  member_progress: ["progress", "members"],
  nutrition: ["nutrition"],
  nutrition_builder: ["nutrition"],
  assign_nutrition: ["nutrition"],
  sessions: ["sessions"],
  marketing_ai: ["marketing-ai"],
  content_ideas: [
    "marketing-ai-idea-cards",
    "content-ideas",
    "marketing-ai",
  ],
  viral_score: [
    "marketing-ai-idea-generator-selected",
    "marketing-ai-idea-cards",
    "content-ideas",
  ],
  video_generator: ["video-generator"],
  calendar: [
    "marketing-ai-calendar-scheduled",
    "calendar",
    "marketing-ai",
  ],
  scheduled_posts: [
    "marketing-ai-calendar-draft",
    "marketing-ai-calendar-scheduled",
    "published",
  ],
  published: ["published", "marketing-ai-calendar-scheduled"],
  analytics: ["analytics"],
  recommendations: ["analytics"],
  launch_cta: ["marketing-ai"],
}

export type ResolvedWorkflowSceneAsset = {
  stepId: WorkflowSceneStepId
  asset_key: FitCoreShowcaseAssetKey
  asset_url: string
  preferredKey: FitCoreShowcaseAssetKey
  usedFallback: boolean
  screenshotAvailable: boolean
}

function buildAsset(key: FitCoreShowcaseAssetKey): FitCoreShowcaseAsset {
  return {
    asset_key: key,
    asset_url: `${APP_SHOWCASE_BASE_PATH}/${key}.png`,
  }
}

/**
 * Client-safe resolver — maps workflow steps to asset keys without filesystem access.
 * Use `resolveWorkflowSceneAssetOnDisk` from showcase-screenshot-availability.server.ts on the server.
 */
export function isShowcaseScreenshotAvailable(
  _assetKey: FitCoreShowcaseAssetKey,
): boolean {
  return false
}

export function resolveWorkflowSceneAsset(
  stepId: WorkflowSceneStepId,
): ResolvedWorkflowSceneAsset {
  const candidates = WORKFLOW_SCENE_ASSET_RESOLUTION[stepId]
  const preferredKey = candidates[0]
  const asset = buildAsset(preferredKey)

  return {
    stepId,
    asset_key: asset.asset_key,
    asset_url: asset.asset_url,
    preferredKey,
    usedFallback: candidates.length > 1,
    screenshotAvailable: false,
  }
}

export function resolveAssetKeyFromWorkflowStep(
  stepId: string,
): FitCoreShowcaseAssetKey | null {
  const normalized = stepId.trim().toLowerCase().replace(/-/g, "_")
  if (normalized in WORKFLOW_SCENE_ASSET_RESOLUTION) {
    return WORKFLOW_SCENE_ASSET_RESOLUTION[normalized as WorkflowSceneStepId][0]
  }
  return null
}

const MODULE_TO_STEP: Record<string, WorkflowSceneStepId> = {
  dashboard: "dashboard",
  members: "members",
  workouts: "workouts",
  "workout builder": "workout_builder",
  workout_builder: "workout_builder",
  workoutbuilder: "workout_builder",
  "workout detail": "workout_builder",
  "workout-detail": "workout_builder",
  workoutdetail: "workout_builder",
  "assign workout": "assign_workout",
  assign_workout: "assign_workout",
  assignworkout: "assign_workout",
  "assign-workout": "assign_workout",
  "member progress": "member_progress",
  member_progress: "member_progress",
  memberprogress: "member_progress",
  progress: "member_progress",
  "member view": "member_progress",
  "member-view": "member_progress",
  memberview: "member_progress",
  nutrition: "nutrition",
  "nutrition builder": "nutrition_builder",
  nutrition_builder: "nutrition_builder",
  nutritionbuilder: "nutrition_builder",
  "nutrition detail": "nutrition_builder",
  "nutrition-detail": "nutrition_builder",
  nutritiondetail: "nutrition_builder",
  "assign nutrition": "assign_nutrition",
  assign_nutrition: "assign_nutrition",
  assignnutrition: "assign_nutrition",
  "assign-nutrition": "assign_nutrition",
  sessions: "sessions",
  "marketing ai": "marketing_ai",
  marketing_ai: "marketing_ai",
  marketingai: "marketing_ai",
  "marketing-ai": "marketing_ai",
  "content ideas": "content_ideas",
  content_ideas: "content_ideas",
  contentideas: "content_ideas",
  "content-ideas": "content_ideas",
  "viral score": "viral_score",
  viral_score: "viral_score",
  viralscore: "viral_score",
  "video generator": "video_generator",
  video_generator: "video_generator",
  videogenerator: "video_generator",
  "video-generator": "video_generator",
  calendar: "calendar",
  "scheduled posts": "scheduled_posts",
  scheduled_posts: "scheduled_posts",
  scheduledposts: "scheduled_posts",
  published: "published",
  analytics: "analytics",
  recommendations: "recommendations",
  cta: "launch_cta",
  launch_cta: "launch_cta",
  launchcta: "launch_cta",
}

export function resolveWorkflowStepFromModule(
  module: string,
): WorkflowSceneStepId | null {
  const normalized = module.trim().toLowerCase().replace(/[_-]+/g, " ")
  const compact = normalized.replace(/\s+/g, "")

  return (
    MODULE_TO_STEP[normalized] ??
    MODULE_TO_STEP[compact] ??
    MODULE_TO_STEP[normalized.replace(/\s+/g, "_")] ??
    null
  )
}

export function resolveAssetKeyFromModuleLabel(
  module: string,
): FitCoreShowcaseAssetKey | null {
  const stepId = resolveWorkflowStepFromModule(module)
  if (!stepId) return null
  return WORKFLOW_SCENE_ASSET_RESOLUTION[stepId][0]
}

export function resolveShowcaseAssetForModule(
  module: string,
): ResolvedWorkflowSceneAsset | null {
  const stepId = resolveWorkflowStepFromModule(module)
  if (!stepId) return null
  return resolveWorkflowSceneAsset(stepId)
}

export const FITCORE_SHOWCASE_ASSET_KEYS = [
  ...PRIMARY_SHOWCASE_SCREENSHOT_KEYS,
  ...MARKETING_LAUNCH_SCREENSHOT_KEYS,
  "workout-detail",
  "assign-workout",
  "nutrition-detail",
  "assign-nutrition",
  "recommendations",
  "member-view",
] as const satisfies readonly FitCoreShowcaseAssetKey[]

export const FITCORE_SHOWCASE_ASSETS: Record<
  FitCoreShowcaseAssetKey,
  FitCoreShowcaseAsset
> = Object.fromEntries(
  FITCORE_SHOWCASE_ASSET_KEYS.map((key) => [key, buildAsset(key)]),
) as Record<FitCoreShowcaseAssetKey, FitCoreShowcaseAsset>

const LEGACY_MODULE_ASSET_KEY_MAP: Record<string, FitCoreShowcaseAssetKey> = {
  "workout detail": "workout-detail",
  "workout-detail": "workout-detail",
  workoutdetail: "workout-detail",
  "assign-workout": "assign-workout",
  "nutrition detail": "nutrition-detail",
  "nutrition-detail": "nutrition-detail",
  nutritiondetail: "nutrition-detail",
  "assign-nutrition": "assign-nutrition",
  "member view": "member-view",
  "member-view": "member-view",
  memberview: "member-view",
  recommendations: "analytics",
}

function normalizeModuleToken(value: string): string {
  return value.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ")
}

export function moduleToAssetKey(
  module: string | null | undefined,
): FitCoreShowcaseAssetKey | null {
  if (!module?.trim()) return null

  const fromWorkflow = resolveAssetKeyFromModuleLabel(module)
  if (fromWorkflow) return fromWorkflow

  const normalized = normalizeModuleToken(module)
  const legacy = LEGACY_MODULE_ASSET_KEY_MAP[normalized]
  if (legacy) return legacy

  const compact = normalized.replace(/\s+/g, "")
  return LEGACY_MODULE_ASSET_KEY_MAP[compact] ?? null
}

export function getShowcaseAsset(
  assetKey: FitCoreShowcaseAssetKey,
): FitCoreShowcaseAsset {
  return FITCORE_SHOWCASE_ASSETS[assetKey]
}
