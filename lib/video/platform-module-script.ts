import type { VideoScriptScene } from "@/lib/marketing/video-script-types";
import {
  inferSceneModuleFromText,
  MODULE_DEFAULT_ASSET,
  normalizeSceneModule,
  resolveSceneModule,
  type SceneModuleId,
} from "@/lib/video/resolve-scene-module";

export type PlatformModuleScriptTemplate = {
  module: SceneModuleId;
  text: string;
  duration: number;
  visual_description: string;
};

/** Canonical copy + visual direction per platform module. */
export const PLATFORM_MODULE_SCRIPT_TEMPLATES: Record<
  SceneModuleId,
  Omit<PlatformModuleScriptTemplate, "module">
> = {
  dashboard: {
    text: "Run your fitness business from one dashboard.",
    duration: 3,
    visual_description:
      "Fitness business owner at standing desk, holographic command center glowing electric blue in dark modern office",
  },
  platform_overview: {
    text: "One platform for your entire fitness business.",
    duration: 3,
    visual_description:
      "Wide cinematic shot of unified coaching command center environment, premium fitness business",
  },
  problem: {
    text: "Coaches juggle 6+ apps to run their business.",
    duration: 3,
    visual_description:
      "Busy coach overwhelmed by messages, tabs, and notifications — chaotic before state",
  },
  members: {
    text: "Manage every member from one place.",
    duration: 3,
    visual_description:
      "Coach reviewing client profiles on laptop in professional gym lounge, warm cinematic lighting",
  },
  workouts: {
    text: "Build and assign workout plans instantly.",
    duration: 3,
    visual_description:
      "Coach building training program on tablet beside gym floor, athletes training in soft background blur",
  },
  nutrition: {
    text: "Create personalized nutrition plans.",
    duration: 3,
    visual_description:
      "Nutrition coach planning meal templates on glowing screen in clean wellness studio",
  },
  progress: {
    text: "Track every client milestone.",
    duration: 3,
    visual_description:
      "Athletic transformation montage moment — coach celebrating client milestone in gym",
  },
  sessions: {
    text: "Schedule sessions without double-booking.",
    duration: 3,
    visual_description:
      "Coach checking calendar on phone between sessions in premium gym reception area",
  },
  marketing: {
    text: "Generate content and schedule posts with Marketing AI.",
    duration: 3,
    visual_description:
      "Modern AI content studio glowing in dark office, coach directing creative workflow",
  },
  analytics: {
    text: "Business analytics that drive growth.",
    duration: 3,
    visual_description:
      "Gym owner studying growth metrics on illuminated display in dark office, confident results moment",
  },
  ai_coach: {
    text: "Your AI coach assistant — always on.",
    duration: 3,
    visual_description:
      "Coach speaking with AI assistant interface as soft blue holographic glow in modern training facility",
  },
};

/** Default 30s platform showcase module order. */
export const PLATFORM_SHOWCASE_SCRIPT_MODULES: SceneModuleId[] = [
  "problem",
  "platform_overview",
  "members",
  "workouts",
  "nutrition",
  "progress",
  "marketing",
  "analytics",
];

export function getPlatformModuleScriptTemplate(
  module: SceneModuleId,
): PlatformModuleScriptTemplate {
  const template = PLATFORM_MODULE_SCRIPT_TEMPLATES[module];
  return {
    module,
    ...template,
  };
}

export function buildPlatformModuleSceneExample(
  module: SceneModuleId,
): PlatformModuleScriptTemplate {
  return getPlatformModuleScriptTemplate(module);
}

export function buildPlatformModuleJsonSceneExamples(
  modules: SceneModuleId[] = PLATFORM_SHOWCASE_SCRIPT_MODULES,
): PlatformModuleScriptTemplate[] {
  return modules.map((module) => buildPlatformModuleSceneExample(module));
}

export function moduleTextMatchesModule(
  module: SceneModuleId,
  text: string,
): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  const template = PLATFORM_MODULE_SCRIPT_TEMPLATES[module];
  if (template.text.trim().toLowerCase() === trimmed.toLowerCase()) {
    return true;
  }

  return inferSceneModuleFromText(trimmed) === module;
}

function moduleToAssetKey(module: SceneModuleId): string {
  switch (module) {
    case "marketing":
      return "marketing-ai";
    case "platform_overview":
    case "problem":
    case "dashboard":
      return "dashboard";
    case "ai_coach":
      return "video-generator";
    default:
      return module;
  }
}

function moduleToWorkflowStep(module: SceneModuleId): string {
  switch (module) {
    case "marketing":
      return "marketing_ai";
    case "platform_overview":
      return "dashboard";
    default:
      return module;
  }
}

/**
 * Ensure scene.module, scene.text, and scene.visual_description stay aligned.
 * When text and module disagree, module wins and copy is corrected to the template.
 */
export function alignSceneToPlatformModule(
  scene: VideoScriptScene,
  forcedModule?: SceneModuleId | string | null,
): VideoScriptScene {
  const explicitModule = normalizeSceneModule(forcedModule ?? scene.module);
  const inferredFromText = resolveSceneModule({
    module: scene.module,
    text: scene.text,
    overlay_text: scene.overlay_text,
    visual_description: scene.visual_description,
    visual: scene.visual,
    narration: scene.narration,
  });

  const resolvedModule =
    explicitModule && moduleTextMatchesModule(explicitModule, scene.text ?? "")
      ? explicitModule
      : explicitModule && !moduleTextMatchesModule(explicitModule, scene.text ?? "")
        ? explicitModule
        : inferredFromText;

  const template = PLATFORM_MODULE_SCRIPT_TEMPLATES[resolvedModule];
  const text = moduleTextMatchesModule(resolvedModule, scene.text ?? "")
    ? scene.text.trim()
    : template.text;

  const visual_description =
    scene.visual_description?.trim() ||
    scene.visual?.trim() ||
    template.visual_description;

  const duration =
    typeof scene.duration === "number" && scene.duration > 0
      ? Math.min(8, Math.max(2, Math.round(scene.duration)))
      : template.duration;

  const asset_key = moduleToAssetKey(resolvedModule);
  const asset_url =
    MODULE_DEFAULT_ASSET[resolvedModule] ??
    scene.asset_url ??
    `/app-showcase/${asset_key}.png`;

  return {
    ...scene,
    module: resolvedModule,
    text,
    overlay_text: text,
    visual_description,
    visual: visual_description,
    duration,
    workflow_step: scene.workflow_step?.trim() || moduleToWorkflowStep(resolvedModule),
    asset_key: scene.asset_key?.trim() || asset_key,
    asset_url,
  };
}

export function alignScenesToPlatformModules(
  scenes: VideoScriptScene[],
  moduleSequence?: SceneModuleId[],
): VideoScriptScene[] {
  const sequence = moduleSequence ?? [];

  return scenes.map((scene, index) => {
    const forcedModule = sequence[index] ?? scene.module;
    return alignSceneToPlatformModule(scene, forcedModule);
  });
}

export function buildPlatformModuleScenePromptBlock(): string {
  const examples = buildPlatformModuleJsonSceneExamples();
  return `Every scene MUST use this exact shape (module, text, duration, visual_description):

${JSON.stringify(examples.slice(0, 3), null, 2)}

Allowed module values (use exactly these snake_case ids):
dashboard, members, workouts, nutrition, progress, sessions, marketing, analytics, ai_coach
For platform showcase videos also: problem, platform_overview

Module alignment rules (STRICT):
- module MUST match the scene text — if the text is about members, module must be "members"
- text MUST describe the same platform module as module
- visual_description MUST describe the UI for that same module (e.g. members → members dashboard)
- duration: 2-5 seconds (integer), default 3
- Do NOT assign a dashboard screenshot to a members scene or vice versa
- Do NOT reuse the same module twice unless the text explicitly matches that module

Reference copy per module:
${examples
  .map(
    (example) =>
      `- ${example.module}: text="${example.text}" | visual="${example.visual_description}"`,
  )
  .join("\n")}`;
}
