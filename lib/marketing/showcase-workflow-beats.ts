import type {
  SceneCameraMotion,
  SceneTransition,
} from "@/lib/marketing/video-scene-cinematics"
import { buildCinematicVisualFromModule } from "@/lib/marketing/cinematic-visual-prompts"

export const PLATFORM_MODULES = [
  "Dashboard",
  "Members",
  "Workouts",
  "Nutrition",
  "Progress Tracking",
  "Sessions",
  "Marketing AI",
  "Analytics",
  "AI Coach",
] as const

export type PlatformModule = (typeof PLATFORM_MODULES)[number]

export type ShowcaseModuleBeat = {
  module: PlatformModule
  storyBeat: string
  workflowStep: number
  purpose: string
  characterAction: string
  visualDirection: string
  cameraMotion: SceneCameraMotion
  transition: SceneTransition
  defaultDuration: number
}

export const SHOWCASE_WORKFLOW_BEATS: readonly ShowcaseModuleBeat[] = [
  {
    module: "Dashboard",
    storyBeat: "Morning command center",
    workflowStep: 1,
    purpose:
      "Open the day with KPIs, today's schedule, and business health at a glance",
    characterAction:
      "Mascot taps the dashboard, highlights revenue and session count widgets",
    visualDirection: buildCinematicVisualFromModule(
      "Dashboard",
      "Open the day with KPIs, today's schedule, and business health at a glance",
    ),
    cameraMotion: "screen push in",
    transition: "slide wipe",
    defaultDuration: 3,
  },
  {
    module: "Members",
    storyBeat: "Know every client",
    workflowStep: 2,
    purpose:
      "CRM overview — member profiles, goals, status, and who needs attention today",
    characterAction:
      "Mascot scrolls the members list and taps a profile card to open goals",
    visualDirection: buildCinematicVisualFromModule(
      "Members",
      "CRM overview — member profiles, goals, status",
    ),
    cameraMotion: "lateral pan",
    transition: "cross dissolve",
    defaultDuration: 3,
  },
  {
    module: "Workouts",
    storyBeat: "Program in minutes",
    workflowStep: 3,
    purpose:
      "Build and assign workout plans — exercise blocks, progress tracking, less programming time",
    characterAction:
      "Mascot drags an exercise block into a plan and clicks assign to member",
    visualDirection: buildCinematicVisualFromModule(
      "Workouts",
      "Build and assign workout plans",
    ),
    cameraMotion: "tracking follow",
    transition: "zoom transition",
    defaultDuration: 3,
  },
  {
    module: "Nutrition",
    storyBeat: "Fuel the plan",
    workflowStep: 4,
    purpose:
      "Nutrition planning — macro targets, meal templates, client-ready plans fast",
    characterAction:
      "Mascot adjusts macro rings and drops a meal template into the client plan",
    visualDirection: buildCinematicVisualFromModule(
      "Nutrition",
      "Nutrition planning — macro targets and meal templates",
    ),
    cameraMotion: "top-down push",
    transition: "motion blur",
    defaultDuration: 3,
  },
  {
    module: "Sessions",
    storyBeat: "Calendar under control",
    workflowStep: 5,
    purpose:
      "Session scheduling — book 1:1s, group sessions, reminders, no double-booking",
    characterAction:
      "Mascot drags a session onto the calendar and confirms booking with one click",
    visualDirection: buildCinematicVisualFromModule(
      "Sessions",
      "Session scheduling without double-booking",
    ),
    cameraMotion: "over-shoulder push",
    transition: "soft dissolve",
    defaultDuration: 3,
  },
  {
    module: "Marketing AI",
    storyBeat: "Growth on autopilot",
    workflowStep: 6,
    purpose:
      "AI content engine — posts, video scripts, content calendar, consistent marketing",
    characterAction:
      "Mascot clicks generate, reviews AI copy, and drops content onto the calendar",
    visualDirection: buildCinematicVisualFromModule(
      "Marketing AI",
      "AI content engine and content calendar",
    ),
    cameraMotion: "orbit pan",
    transition: "pixel dissolve",
    defaultDuration: 3,
  },
  {
    module: "Analytics",
    storyBeat: "Prove the ROI",
    workflowStep: 7,
    purpose:
      "Analytics dashboard — retention, revenue, content performance, data-driven decisions",
    characterAction:
      "Mascot gestures at upward trend charts and engagement metrics with a confident nod",
    visualDirection: buildCinematicVisualFromModule(
      "Analytics",
      "Analytics dashboard — retention, revenue, growth",
    ),
    cameraMotion: "pull back reveal",
    transition: "fade to black",
    defaultDuration: 4,
  },
] as const

export const APP_SHOWCASE_SCENE_COUNT = SHOWCASE_WORKFLOW_BEATS.length

/** @deprecated Use SHOWCASE_WORKFLOW_BEATS — kept for UI beat labels */
export const APP_SHOWCASE_SCENE_BEATS = SHOWCASE_WORKFLOW_BEATS.map((beat) => ({
  beat: beat.module,
  purpose: beat.purpose,
  visualHint: beat.visualDirection,
  storyBeat: beat.storyBeat,
  characterAction: beat.characterAction,
}))

export function getShowcaseBeatForIndex(index: number): ShowcaseModuleBeat | null {
  return SHOWCASE_WORKFLOW_BEATS[index] ?? null
}

export function buildShowcaseWorkflowSummary(): string {
  return SHOWCASE_WORKFLOW_BEATS.map(
    (beat) =>
      `${beat.workflowStep}. ${beat.module} — ${beat.storyBeat}: ${beat.purpose}`,
  ).join("\n")
}

export function buildShowcaseSceneStructurePrompt(): string {
  return SHOWCASE_WORKFLOW_BEATS.map(
    (beat) =>
      `Scene ${beat.workflowStep} — ${beat.module} (${beat.storyBeat}): ${beat.purpose}. Character action: ${beat.characterAction}. Visual direction: ${beat.visualDirection}. Default camera: ${beat.cameraMotion}. Default transition: ${beat.transition}.`,
  ).join("\n")
}

export function buildShowcasePlatformModulesPrompt(): string {
  return PLATFORM_MODULES.map(
    (module, index) => `${index + 1}. ${module}`,
  ).join("\n")
}
