import { APP_SHOWCASE_BASE_PATH } from "@/lib/marketing/workflow-scene-asset-resolver";
import type { SaasVisualVariant } from "@/lib/video/resolve-saas-visual-variant";
import type { SceneVisualFields } from "@/lib/video/resolve-scene-visual";

/** Canonical module ids used on every video scene. */
export type SceneModuleId =
  | "dashboard"
  | "members"
  | "workouts"
  | "nutrition"
  | "progress"
  | "sessions"
  | "marketing"
  | "analytics"
  | "ai_coach"
  | "problem"
  | "platform_overview";

const MODULE_ALIASES: Record<string, SceneModuleId> = {
  dashboard: "dashboard",
  overview: "platform_overview",
  platform: "platform_overview",
  platform_overview: "platform_overview",
  "platform overview": "platform_overview",
  problem: "problem",
  "the problem": "problem",
  members: "members",
  member: "members",
  clients: "members",
  client: "members",
  crm: "members",
  workouts: "workouts",
  workout: "workouts",
  training: "workouts",
  programs: "workouts",
  nutrition: "nutrition",
  meal: "nutrition",
  meals: "nutrition",
  macros: "nutrition",
  progress: "progress",
  "progress tracking": "progress",
  tracking: "progress",
  sessions: "sessions",
  session: "sessions",
  booking: "sessions",
  schedule: "sessions",
  marketing: "marketing",
  marketing_ai: "marketing",
  marketingai: "marketing",
  "marketing ai": "marketing",
  "marketing-ai": "marketing",
  content: "marketing",
  analytics: "analytics",
  ai_coach: "ai_coach",
  aicoach: "ai_coach",
  "ai coach": "ai_coach",
  "ai-coach": "ai_coach",
  coach: "ai_coach",
};

export const MODULE_DEFAULT_ASSET: Partial<Record<SceneModuleId, string>> = {
  dashboard: `${APP_SHOWCASE_BASE_PATH}/dashboard.png`,
  platform_overview: `${APP_SHOWCASE_BASE_PATH}/dashboard.png`,
  members: `${APP_SHOWCASE_BASE_PATH}/members.png`,
  workouts: `${APP_SHOWCASE_BASE_PATH}/workouts.png`,
  nutrition: `${APP_SHOWCASE_BASE_PATH}/nutrition.png`,
  progress: `${APP_SHOWCASE_BASE_PATH}/progress.png`,
  sessions: `${APP_SHOWCASE_BASE_PATH}/sessions.png`,
  marketing: `${APP_SHOWCASE_BASE_PATH}/marketing-ai.png`,
  analytics: `${APP_SHOWCASE_BASE_PATH}/analytics.png`,
  ai_coach: `${APP_SHOWCASE_BASE_PATH}/video-generator.png`,
};

const MODULE_ASSET_PATTERNS: Record<SceneModuleId, RegExp[]> = {
  dashboard: [/dashboard/],
  platform_overview: [/dashboard/],
  problem: [/dashboard/, /problem/],
  members: [/\/members(?:\.|-|$)/, /member-view/],
  workouts: [/workouts/, /workout-detail/, /assign-workout/],
  nutrition: [/nutrition/, /assign-nutrition/],
  progress: [/progress/],
  sessions: [/sessions/],
  marketing: [
    /marketing-ai/,
    /content-ideas/,
    /calendar/,
    /published/,
    /video-generator/,
  ],
  analytics: [/analytics/, /recommendations/],
  ai_coach: [/ai-coach/, /video-generator/],
};

export function normalizeSceneModule(
  raw?: string | null,
): SceneModuleId | null {
  if (!raw?.trim()) return null;

  const trimmed = raw.trim().toLowerCase();
  const spaced = trimmed.replace(/[_-]+/g, " ");
  const compact = spaced.replace(/\s+/g, "");

  return (
    MODULE_ALIASES[trimmed] ??
    MODULE_ALIASES[spaced] ??
    MODULE_ALIASES[compact] ??
    MODULE_ALIASES[spaced.replace(/\s+/g, "_")] ??
    null
  );
}

/** Infer module from on-screen copy when scene.module is missing. */
export function inferSceneModuleFromText(
  text: string,
  visual = "",
): SceneModuleId {
  const haystack = `${text} ${visual}`.toLowerCase();

  if (/\b(problem|juggle|fragmented|multiple apps|spreadsheets?|6\+ apps)\b/.test(haystack)) {
    return "problem";
  }
  if (
    /\b(overview|all-in-one|unified platform|entire business|one platform|replace every tool)\b/.test(
      haystack,
    )
  ) {
    return "platform_overview";
  }
  if (/\b(members?|clients?)\b/.test(haystack)) return "members";
  if (/\b(workouts?|training)\b/.test(haystack)) return "workouts";
  if (/\b(nutrition|meals?|macros?)\b/.test(haystack)) return "nutrition";
  if (/\b(progress|results|track)\b/.test(haystack)) return "progress";
  if (/\b(sessions?|booking)\b/.test(haystack)) return "sessions";
  if (/\b(content|marketing|posts?)\b/.test(haystack)) return "marketing";
  if (/\b(analytics|engagement|growth)\b/.test(haystack)) return "analytics";
  if (/\b(coach|ai assistant)\b/.test(haystack)) return "ai_coach";

  return "dashboard";
}

export function resolveSceneModule(input: {
  module?: string | null;
  text?: string;
  visual_description?: string;
  visual?: string;
  overlay_text?: string;
  narration?: string;
}): SceneModuleId {
  const fromModule = normalizeSceneModule(input.module);
  if (fromModule) return fromModule;

  const text = [
    input.text,
    input.overlay_text,
    input.narration,
    input.visual_description,
    input.visual,
  ]
    .filter(Boolean)
    .join(" ");

  return inferSceneModuleFromText(text);
}

export function moduleToVisualVariant(module: SceneModuleId): SaasVisualVariant {
  const map: Record<SceneModuleId, SaasVisualVariant> = {
    dashboard: "dashboard",
    platform_overview: "platform_overview",
    problem: "problem",
    members: "members",
    workouts: "workouts",
    nutrition: "nutrition",
    progress: "progress",
    sessions: "sessions",
    marketing: "marketing_ai",
    analytics: "analytics",
    ai_coach: "ai_coach",
  };
  return map[module];
}

export function assetUrlMatchesModule(
  url: string,
  module: SceneModuleId,
): boolean {
  const lower = url.toLowerCase();
  return MODULE_ASSET_PATTERNS[module].some((pattern) => pattern.test(lower));
}

function cleanUrl(value: string | undefined | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export type ModuleAlignedVisual = {
  module: SceneModuleId;
  variant: SaasVisualVariant;
  selectedUrl: string | null;
  usedFallback: boolean;
  source: "image_url" | "screenshot_url" | "asset_url" | "fallback";
};

/** Pick visual URL only when it matches the scene module; otherwise use module default. */
export function resolveModuleAlignedVisual(
  scene: SceneVisualFields & {
    module?: string;
    overlay_text?: string;
    narration?: string;
  },
): ModuleAlignedVisual {
  const module = resolveSceneModule(scene);
  const variant = moduleToVisualVariant(module);

  const candidates: Array<{
    url: string | null;
    source: ModuleAlignedVisual["source"];
  }> = [
    {
      url: cleanUrl(scene.image_url) ?? cleanUrl(scene.imageUrl),
      source: "image_url",
    },
  ];

  for (const candidate of candidates) {
    if (candidate.url) {
      return {
        module,
        variant,
        selectedUrl: candidate.url,
        usedFallback: false,
        source: candidate.source,
      };
    }
  }

  return {
    module,
    variant,
    selectedUrl: null,
    usedFallback: true,
    source: "fallback",
  };
}

export function logSceneModuleDebug(
  sceneIndex: number,
  scene: { text?: string; module?: string },
  mapping: ModuleAlignedVisual,
): void {
  console.log("[FitCoreVideoTemplate] scene mapping", {
    sceneIndex,
    sceneModule: mapping.module,
    selectedVisual: mapping.variant,
    sceneText: scene.text?.trim() ?? "",
    selectedUrl: mapping.selectedUrl,
    usedFallback: mapping.usedFallback,
    visualSource: mapping.source,
  });
}
