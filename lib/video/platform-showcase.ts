import type { SaasVisualVariant } from "@/lib/video/resolve-saas-visual-variant";
import type { PremiumReelScene } from "@/lib/video/premium-reel-ad";
import {
  assetUrlMatchesModule,
  moduleToVisualVariant,
  resolveSceneModule,
  type SceneModuleId,
} from "@/lib/video/resolve-scene-module";

/** Fixed 30-second full-platform SaaS showcase for FitCore AI. */
export const PLATFORM_SHOWCASE_TOTAL_SECONDS = 30;
export const PLATFORM_SHOWCASE_CTA_SECONDS = 2.5;

export type ShowcaseBeatId =
  | "problem"
  | "platform_overview"
  | "members"
  | "workouts"
  | "nutrition"
  | "progress"
  | "marketing_ai"
  | "analytics";

export type PlatformShowcaseBeat = {
  id: ShowcaseBeatId;
  module: string;
  duration: number;
  text: string;
  visual_description: string;
  variant: SaasVisualVariant;
  asset_url?: string;
};

/** 8 content beats + CTA outro (2.5s) = 30s total */
export const PLATFORM_SHOWCASE_BEATS: PlatformShowcaseBeat[] = [
  {
    id: "problem",
    module: "The Problem",
    duration: 3.5,
    text: "Coaches juggle 6+ apps to run their business",
    visual_description:
      "Fragmented coaching tools — spreadsheets, messaging apps, scheduling, nutrition trackers scattered vs one platform",
    variant: "problem",
  },
  {
    id: "platform_overview",
    module: "Platform Overview",
    duration: 3.5,
    text: "One platform for your entire fitness business",
    visual_description:
      "FitCore AI unified dashboard showing members, workouts, nutrition, sessions, marketing and analytics modules",
    variant: "platform_overview",
    asset_url: "/app-showcase/dashboard.png",
  },
  {
    id: "members",
    module: "Members",
    duration: 3,
    text: "Manage every member from one place",
    visual_description:
      "Members module with client profiles, goals, status badges and retention alerts",
    variant: "members",
    asset_url: "/app-showcase/members.png",
  },
  {
    id: "workouts",
    module: "Workouts",
    duration: 3,
    text: "Build and assign workout plans instantly",
    visual_description:
      "Workout plan builder with exercise blocks, sets, reps and assign-to-member flow",
    variant: "workouts",
    asset_url: "/app-showcase/workouts.png",
  },
  {
    id: "nutrition",
    module: "Nutrition",
    duration: 3,
    text: "Create personalized nutrition plans",
    visual_description:
      "Nutrition planning with macro targets, meal templates and client-ready plans",
    variant: "nutrition",
    asset_url: "/app-showcase/nutrition.png",
  },
  {
    id: "progress",
    module: "Progress Tracking",
    duration: 3,
    text: "Track every client milestone",
    visual_description:
      "Progress tracking charts, body metrics, PRs and compliance trends over time",
    variant: "progress",
    asset_url: "/app-showcase/progress.png",
  },
  {
    id: "marketing_ai",
    module: "Marketing AI",
    duration: 3,
    text: "Generate content and schedule posts with Marketing AI",
    visual_description:
      "Marketing AI generating content ideas, video scripts and social calendar for coaches",
    variant: "marketing_ai",
    asset_url: "/app-showcase/marketing-ai.png",
  },
  {
    id: "analytics",
    module: "Analytics",
    duration: 3.5,
    text: "Business analytics that drive growth",
    visual_description:
      "Analytics dashboard with revenue, retention, session fill rate and marketing ROI",
    variant: "analytics",
    asset_url: "/app-showcase/analytics.png",
  },
];

export const PLATFORM_MODULE_BADGES = [
  { label: "Dashboard", color: "#6366f1", variant: "dashboard" as SaasVisualVariant },
  { label: "Members", color: "#38bdf8", variant: "members" as SaasVisualVariant },
  { label: "Workouts", color: "#818cf8", variant: "workouts" as SaasVisualVariant },
  { label: "Nutrition", color: "#34d399", variant: "nutrition" as SaasVisualVariant },
  { label: "Progress", color: "#a78bfa", variant: "progress" as SaasVisualVariant },
  { label: "Sessions", color: "#22d3ee", variant: "sessions" as SaasVisualVariant },
  { label: "Marketing AI", color: "#f472b6", variant: "marketing_ai" as SaasVisualVariant },
  { label: "Analytics", color: "#fbbf24", variant: "analytics" as SaasVisualVariant },
  { label: "AI Coach", color: "#10b981", variant: "ai_coach" as SaasVisualVariant },
];

export function buildPlatformShowcaseScenes(): PremiumReelScene[] {
  return PLATFORM_SHOWCASE_BEATS.map((beat) => ({
    text: beat.text,
    duration: beat.duration,
    module: resolveSceneModule({ module: beat.id, text: beat.text }),
    visual_description: beat.visual_description,
    variant: beat.variant,
    ...(beat.asset_url ? { asset_url: beat.asset_url } : {}),
  }));
}

export function showcaseBeatBodySeconds(): number {
  return PLATFORM_SHOWCASE_BEATS.reduce((sum, beat) => sum + beat.duration, 0);
}

export function calcPlatformShowcaseDurationInFrames(fps: number): number {
  return Math.round(
    (showcaseBeatBodySeconds() + PLATFORM_SHOWCASE_CTA_SECONDS) * fps,
  );
}

export function resolveShowcaseVariant(
  scene: PremiumReelScene & { module?: string; variant?: string },
  _sceneIndex?: number,
): SaasVisualVariant {
  const module = resolveSceneModule(scene);
  return moduleToVisualVariant(module);
}

function beatModuleId(beat: PlatformShowcaseBeat): SceneModuleId {
  return resolveSceneModule({ module: beat.id, text: beat.text });
}

function findScriptSceneForBeat(
  scriptScenes: PremiumReelScene[],
  beat: PlatformShowcaseBeat,
): PremiumReelScene | undefined {
  const targetModule = beatModuleId(beat);
  return scriptScenes.find(
    (scene) => resolveSceneModule(scene) === targetModule,
  );
}

function pickAlignedAsset(
  scriptScene: PremiumReelScene | undefined,
  beat: PlatformShowcaseBeat,
  targetModule: SceneModuleId,
): Partial<Pick<PremiumReelScene, "asset_url" | "image_url" | "screenshot_url">> {
  if (!scriptScene) {
    return beat.asset_url ? { asset_url: beat.asset_url } : {};
  }

  const urls = [
    scriptScene.image_url,
    scriptScene.screenshot_url,
    scriptScene.asset_url,
  ].filter((url): url is string => Boolean(url?.trim()));

  const matched = urls.find((url) => assetUrlMatchesModule(url, targetModule));
  if (matched) {
    if (scriptScene.image_url === matched) return { image_url: matched };
    if (scriptScene.screenshot_url === matched) return { screenshot_url: matched };
    return { asset_url: matched };
  }

  return beat.asset_url ? { asset_url: beat.asset_url } : {};
}

export function badgeIndexForVariant(variant: SaasVisualVariant): number {
  const idx = PLATFORM_MODULE_BADGES.findIndex((b) => b.variant === variant);
  if (idx >= 0) return idx;
  switch (variant) {
    case "problem":
    case "platform_overview":
      return 0;
    case "content_ideas":
    case "calendar":
    case "publishing":
      return 6;
    default:
      return 0;
  }
}

export function shouldUsePlatformShowcase(
  scenes: PremiumReelScene[] | undefined,
): boolean {
  if (!scenes?.length) return true;
  if (scenes.length >= 5) {
    const showcaseModules = new Set(
      PLATFORM_SHOWCASE_BEATS.map((beat) => beatModuleId(beat)),
    );
    const hasModuleTags = scenes.some((scene) =>
      showcaseModules.has(resolveSceneModule(scene)),
    );
    if (hasModuleTags) return false;
  }
  return scenes.length < 5;
}

export function mergeScriptIntoShowcase(
  scriptScenes: PremiumReelScene[],
): PremiumReelScene[] {
  const showcase = buildPlatformShowcaseScenes();
  if (scriptScenes.length === 0) return showcase;

  return PLATFORM_SHOWCASE_BEATS.map((beat) => {
    const targetModule = beatModuleId(beat);
    const scriptScene = findScriptSceneForBeat(scriptScenes, beat);
    const alignedAssets = pickAlignedAsset(scriptScene, beat, targetModule);

    return {
      text: scriptScene?.text?.trim() || beat.text,
      duration:
        scriptScene && scriptScene.duration > 0
          ? scriptScene.duration
          : beat.duration,
      module: targetModule,
      variant: moduleToVisualVariant(targetModule),
      visual_description:
        scriptScene?.visual_description?.trim() || beat.visual_description,
      ...alignedAssets,
      ...(beat.asset_url && !alignedAssets.asset_url && !alignedAssets.image_url
        ? { asset_url: beat.asset_url }
        : {}),
    };
  });
}

export const DEFAULT_PLATFORM_HOOK = PLATFORM_SHOWCASE_BEATS[0].text;

export const DEFAULT_PLATFORM_CTA = "Replace every tool. Run FitCore AI →";

/** Default copy for the video generator UI and thin-script fallbacks. */
export const FITCORE_PLATFORM_SHOWCASE_CAMPAIGN = {
  brandName: "FitCore AI",
  label: "FitCore AI — 30s Platform Showcase",
  targetAudience:
    "Personal trainers, gym owners, and online fitness coaches",
  goal:
    "Show that FitCore AI replaces multiple tools with one complete fitness business platform",
  defaultPrompt: `30-second SaaS showcase for FitCore AI — a complete fitness business platform.

Structure (30 seconds):
1. Problem — coaches juggle 6+ disconnected apps
2. Platform overview — one dashboard for the entire business
3. Members — client CRM in one place
4. Workouts — build and assign programs fast
5. Nutrition — deliver plans that stick
6. Progress — track every client milestone
7. Marketing AI — AI content and scheduling (one section only)
8. Analytics — revenue, retention, and growth
9. CTA — replace every tool with FitCore AI

Include dashboard, members, workouts, nutrition, progress tracking, sessions, marketing AI, analytics, and AI coach across the platform UI. Dynamic transitions between modules.`,
};

export function buildFitcorePlatformShowcasePrompt(): string {
  return FITCORE_PLATFORM_SHOWCASE_CAMPAIGN.defaultPrompt;
}
