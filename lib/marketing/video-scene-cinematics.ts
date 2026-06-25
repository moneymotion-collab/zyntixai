import type { GeneratorVideoStyle } from "@/lib/marketing/video-styles"
import type { VideoScriptScene } from "@/lib/marketing/video-script-types"

export const SCENE_CAMERA_MOTIONS = [
  "slow zoom in",
  "quick punch in",
  "dolly slide left",
  "dolly slide right",
  "crane rise",
  "pull back reveal",
  "handheld shake",
  "rack focus",
  "orbit pan",
  "top-down push",
  "tracking follow",
  "over-shoulder push",
  "phone tilt parallax",
  "screen push in",
  "lateral pan",
] as const

export const SCENE_TRANSITIONS = [
  "hard cut",
  "motion blur",
  "cross dissolve",
  "fade to black",
  "whip pan",
  "smash cut",
  "slide wipe",
  "zoom transition",
  "swipe left",
  "light leak",
  "soft dissolve",
  "pixel dissolve",
] as const

export type SceneCameraMotion = (typeof SCENE_CAMERA_MOTIONS)[number]
export type SceneTransition = (typeof SCENE_TRANSITIONS)[number]

export type VideoStyleCinematicGuide = {
  visualTone: string
  cameraMotions: readonly SceneCameraMotion[]
  transitions: readonly SceneTransition[]
}

export const VIDEO_STYLE_CINEMATIC_GUIDES: Record<
  GeneratorVideoStyle,
  VideoStyleCinematicGuide
> = {
  viral_caption: {
    visualTone:
      "Bold kinetic typography, high-contrast gym lighting, scroll-stopping hook framing",
    cameraMotions: ["quick punch in", "handheld shake", "slow zoom in"],
    transitions: ["hard cut", "motion blur", "whip pan"],
  },
  problem_solution: {
    visualTone:
      "Dramatic before/after contrast — desaturated tension beats vs bright solution beats",
    cameraMotions: ["slow zoom in", "pull back reveal", "rack focus"],
    transitions: ["cross dissolve", "smash cut", "fade to black"],
  },
  premium_ad: {
    visualTone:
      "Cinematic luxury — shallow depth of field, golden rim light, minimal copy, aspirational framing",
    cameraMotions: ["slow zoom in", "dolly slide left", "crane rise", "rack focus"],
    transitions: ["cross dissolve", "fade to black", "light leak"],
  },
  saas_demo: {
    visualTone:
      "Clean SaaS dashboard mockups, UI callouts, workflow automation, coach business context",
    cameraMotions: ["screen push in", "lateral pan", "top-down push", "orbit pan"],
    transitions: ["slide wipe", "zoom transition", "pixel dissolve"],
  },
  app_showcase: {
    visualTone:
      "Professional SaaS demo — mascot guides through Dashboard, Members, Workouts, Nutrition, Sessions, Marketing AI, and Analytics UI in one coach workflow",
    cameraMotions: [
      "screen push in",
      "lateral pan",
      "tracking follow",
      "top-down push",
      "pull back reveal",
      "orbit pan",
      "rack focus",
    ],
    transitions: [
      "slide wipe",
      "zoom transition",
      "cross dissolve",
      "motion blur",
      "pixel dissolve",
      "soft dissolve",
      "fade to black",
    ],
  },
  mascot_story: {
    visualTone:
      "Character-led narrative with brand mascot in premium fitness environment, neon blue accents",
    cameraMotions: ["slow zoom in", "tracking follow", "over-shoulder push", "orbit pan"],
    transitions: ["motion blur", "soft dissolve", "whip pan"],
  },
}

function normalizeSceneCameraMotion(value: string): string {
  return value.trim().toLowerCase()
}

function normalizeSceneTransition(value: string): string {
  return value.trim().toLowerCase()
}

export function buildVideoStyleCinematicPromptList(): string {
  return (Object.entries(VIDEO_STYLE_CINEMATIC_GUIDES) as [GeneratorVideoStyle, VideoStyleCinematicGuide][])
    .map(
      ([style, guide]) =>
        `- ${style}: ${guide.visualTone}. Prefer camera: ${guide.cameraMotions.join(", ")}. Prefer transitions: ${guide.transitions.join(", ")}.`,
    )
    .join("\n")
}

export function applySceneCinematicDefaults(
  scene: VideoScriptScene,
  style: GeneratorVideoStyle,
  sceneIndex: number,
): VideoScriptScene {
  const guide = VIDEO_STYLE_CINEMATIC_GUIDES[style]
  const cameraMotion =
    scene.camera_motion.trim() ||
    guide.cameraMotions[sceneIndex % guide.cameraMotions.length]
  const transition =
    scene.transition.trim() ||
    guide.transitions[sceneIndex % guide.transitions.length]

  return {
    ...scene,
    camera_motion: cameraMotion,
    transition,
  }
}

export function enrichScenesWithCinematics(
  scenes: VideoScriptScene[],
  style: GeneratorVideoStyle,
): VideoScriptScene[] {
  return scenes.map((scene, index) => applySceneCinematicDefaults(scene, style, index))
}

export function parseSceneCameraMotion(value: unknown): string {
  if (typeof value !== "string") return ""
  return normalizeSceneCameraMotion(value)
}

export function parseSceneTransition(value: unknown): string {
  if (typeof value !== "string") return ""
  return normalizeSceneTransition(value)
}
