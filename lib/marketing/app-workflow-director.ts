import {
  buildWorkflowIntelligenceDirectorBlock,
  detectUserGoal,
} from "@/lib/workflow-intelligence"
import {
  FITCORE_SHOWCASE_ASSETS,
  getShowcaseAsset,
  moduleToAssetKey,
  type FitCoreShowcaseAssetKey,
} from "@/lib/marketing/workflow-scene-asset-resolver"
import { resolveShowcaseAssetForModule } from "@/lib/marketing/workflow-scene-asset-resolver"
import { getWorkflowSceneSteps } from "@/lib/workflow-intelligence/registry"
import {
  deriveSceneVisualLayer,
  visualLayerFromAssetKey,
} from "@/lib/marketing/scene-visual-layer"
import { deriveSceneAnimation } from "@/lib/marketing/scene-animation"
import type { VideoScriptScene } from "@/lib/marketing/video-script-types"
import {
  SCENE_CAMERA_MOTIONS,
  SCENE_TRANSITIONS,
  type SceneCameraMotion,
  type SceneTransition,
} from "@/lib/marketing/video-scene-cinematics"
import {
  buildMarketingLaunchDirectorRules,
  buildMarketingLaunchWorkflowBeats,
  MARKETING_LAUNCH_VIDEO_SCENES,
  MARKETING_LAUNCH_ZOOM_LEVEL,
  getMarketingLaunchSceneByStep,
  isMarketingLaunchWorkflow,
} from "@/lib/marketing/marketing-launch-video-workflow"
import { buildSceneAnimationDirectorRules } from "@/lib/marketing/scene-animation"

export const WORKFLOW_DIRECTOR_STYLES = ["app_showcase", "saas_demo"] as const

export type WorkflowDirectorStyle = (typeof WORKFLOW_DIRECTOR_STYLES)[number]

export const APP_WORKFLOW_IDS = [
  "create_workout_plan",
  "create_nutrition_plan",
  "social_media_manager",
  "full_platform_overview",
] as const

export type AppWorkflowId = (typeof APP_WORKFLOW_IDS)[number]

export type WorkflowSceneBeat = {
  step: number
  asset_key: FitCoreShowcaseAssetKey
  module: string
  storyBeat: string
  ui_focus_area: string
  cursor_action: string
  overlay_text: string
  narration: string
  camera_motion: SceneCameraMotion
  transition: SceneTransition
  duration: number
  professional_purpose: string
  visualDirection: string
}

export type AppWorkflowDefinition = {
  id: AppWorkflowId
  label: string
  description: string
  keywords: string[]
  beats: readonly WorkflowSceneBeat[]
}

const WORKOUT_KEYWORDS = [
  "workout plan",
  "workout",
  "training plan",
  "exercise",
  "program builder",
  "assign workout",
  "workout builder",
]

const NUTRITION_KEYWORDS = [
  "nutrition plan",
  "nutrition",
  "meal plan",
  "diet",
  "macro",
  "meal template",
  "assign nutrition",
]

const SOCIAL_KEYWORDS = [
  "social media",
  "marketing ai",
  "marketing launch",
  "launch video",
  "content calendar",
  "content ideas",
  "viral score",
  "scheduled posts",
  "marketing analytics",
  "video generator",
  "marketing",
  "publish",
  "recommendations",
  "growth",
]

const OVERVIEW_KEYWORDS = [
  "platform overview",
  "full platform",
  "all features",
  "complete tour",
  "entire platform",
  "all modules",
  "full demo",
]

function resolveAssetForBeat(beat: WorkflowSceneBeat): {
  asset_key: FitCoreShowcaseAssetKey
  asset_url: string
} {
  const resolved = resolveShowcaseAssetForModule(beat.module)
  if (resolved) {
    return {
      asset_key: resolved.asset_key as FitCoreShowcaseAssetKey,
      asset_url: resolved.asset_url,
    }
  }

  const asset = getShowcaseAsset(beat.asset_key)
  return { asset_key: asset.asset_key, asset_url: asset.asset_url }
}

function buildBeatImagePrompt(beat: WorkflowSceneBeat): string {
  return `Professional SaaS product demo frame: ${beat.module}. Focus on ${beat.ui_focus_area}. ${beat.visualDirection}. Animated cursor mid-action. Vertical 9:16 commercial framing.`
}

function beat(
  step: number,
  asset_key: FitCoreShowcaseAssetKey,
  module: string,
  storyBeat: string,
  fields: Omit<
    WorkflowSceneBeat,
    "step" | "asset_key" | "module" | "storyBeat" | "visualDirection"
  > & { visualDirection?: string },
): WorkflowSceneBeat {
  return {
    step,
    asset_key,
    module,
    storyBeat,
    visualDirection:
      fields.visualDirection ??
      `Professional SaaS demo of ${module} — clean UI, electric blue accents, laptop screen framing`,
    ui_focus_area: fields.ui_focus_area,
    cursor_action: fields.cursor_action,
    overlay_text: fields.overlay_text,
    narration: fields.narration,
    camera_motion: fields.camera_motion,
    transition: fields.transition,
    duration: fields.duration,
    professional_purpose: fields.professional_purpose,
  }
}

export const CREATE_WORKOUT_PLAN_WORKFLOW: AppWorkflowDefinition = {
  id: "create_workout_plan",
  label: "Workout Plan Workflow",
  description:
    "Dashboard → members → workouts → workout_builder → assign_workout → member_progress",
  keywords: WORKOUT_KEYWORDS,
  beats: [
    beat(1, "dashboard", "Dashboard", "Coach command center", {
      ui_focus_area: "Today's schedule and active clients widget",
      cursor_action: "Hover over client count, then click Members in sidebar",
      overlay_text: "Start every day with clarity",
      narration:
        "Your coaching dashboard shows who needs attention and what's on the schedule.",
      camera_motion: "screen push in",
      transition: "slide wipe",
      duration: 3,
      professional_purpose: "Establish the coach's daily starting point",
    }),
    beat(2, "members", "Members", "Pick your client", {
      ui_focus_area: "Member list with goals and status badges",
      cursor_action: "Scroll member list, click a client profile card",
      overlay_text: "Know every client at a glance",
      narration: "Open any member profile to see goals, status, and training history.",
      camera_motion: "lateral pan",
      transition: "cross dissolve",
      duration: 3,
      professional_purpose: "Show CRM speed before building the plan",
    }),
    beat(3, "workouts", "Workouts", "Build the plan", {
      ui_focus_area: "Create Workout Plan button",
      cursor_action: "Click create plan, then highlight exercise list",
      overlay_text: "Build client workouts in minutes",
      narration: "Create and assign workout plans without spreadsheets.",
      camera_motion: "slow zoom in",
      transition: "slide wipe",
      duration: 3,
      professional_purpose: "Show speed and workflow clarity",
    }),
    beat(4, "workout-detail", "Workout Builder", "Craft every set", {
      ui_focus_area: "Exercise blocks with sets, reps, and rest timers",
      cursor_action: "Drag exercise into plan, adjust sets and reps",
      overlay_text: "Program like a pro, faster",
      narration:
        "Drag exercises into blocks, set reps and rest — your plan takes shape in seconds.",
      camera_motion: "tracking follow",
      transition: "zoom transition",
      duration: 3,
      professional_purpose: "Demonstrate depth without complexity",
    }),
    beat(5, "assign-workout", "Assign Workout", "One-click assign", {
      ui_focus_area: "Assign to member drawer with client selector",
      cursor_action: "Click assign, select member, confirm assignment",
      overlay_text: "Assign in one click",
      narration: "Assign the finished plan to your client with a single confirmation.",
      camera_motion: "over-shoulder push",
      transition: "motion blur",
      duration: 3,
      professional_purpose: "Close the coach workflow loop",
    }),
    beat(6, "progress", "Member Progress", "Track results", {
      ui_focus_area: "Progress charts, completion streaks, and client workout adherence",
      cursor_action: "Highlight upward trend line, completion badges, and member activity",
      overlay_text: "Progress you can prove",
      narration:
        "Track client completion and progress so you both stay accountable and motivated.",
      camera_motion: "pull back reveal",
      transition: "fade to black",
      duration: 4,
      professional_purpose: "End with measurable coaching outcomes",
    }),
  ],
}

export const CREATE_NUTRITION_PLAN_WORKFLOW: AppWorkflowDefinition = {
  id: "create_nutrition_plan",
  label: "Nutrition Plan Workflow",
  description:
    "Dashboard → members → nutrition → nutrition_builder → assign_nutrition → member_progress",
  keywords: NUTRITION_KEYWORDS,
  beats: [
    beat(1, "dashboard", "Dashboard", "Coach command center", {
      ui_focus_area: "Nutrition overview widget and today's check-ins",
      cursor_action: "Glance at nutrition compliance, click Members",
      overlay_text: "Nutrition at a glance",
      narration: "See which clients are on track before you build their next meal plan.",
      camera_motion: "screen push in",
      transition: "slide wipe",
      duration: 3,
      professional_purpose: "Frame nutrition as part of daily ops",
    }),
    beat(2, "members", "Members", "Select your client", {
      ui_focus_area: "Member card with macro goals and diet tags",
      cursor_action: "Filter by nutrition goal, open member profile",
      overlay_text: "Goals drive every plan",
      narration: "Every member profile shows macro targets and dietary preferences upfront.",
      camera_motion: "lateral pan",
      transition: "cross dissolve",
      duration: 3,
      professional_purpose: "Connect CRM data to nutrition planning",
    }),
    beat(3, "nutrition", "Nutrition", "Plan meals fast", {
      ui_focus_area: "Create Nutrition Plan button",
      cursor_action: "Click create plan, open meal template library",
      overlay_text: "Meal plans without the math",
      narration: "Build nutrition plans from templates — macros calculated automatically.",
      camera_motion: "slow zoom in",
      transition: "slide wipe",
      duration: 3,
      professional_purpose: "Show template-driven speed",
    }),
    beat(4, "nutrition-detail", "Nutrition Builder", "Fine-tune macros", {
      ui_focus_area: "Macro rings and meal cards per day",
      cursor_action: "Adjust protein target, drag meal into day slot",
      overlay_text: "Macros that match goals",
      narration: "Tune protein, carbs, and fats until the plan fits your client's targets.",
      camera_motion: "tracking follow",
      transition: "zoom transition",
      duration: 3,
      professional_purpose: "Show precision without spreadsheet pain",
    }),
    beat(5, "assign-nutrition", "Assign Nutrition", "Deliver the plan", {
      ui_focus_area: "Assign nutrition drawer with send confirmation",
      cursor_action: "Select member, click assign and notify",
      overlay_text: "Deliver plans instantly",
      narration: "Assign the nutrition plan and notify your client in one step.",
      camera_motion: "over-shoulder push",
      transition: "motion blur",
      duration: 3,
      professional_purpose: "Complete the coach handoff",
    }),
    beat(6, "progress", "Member Progress", "Measure adherence", {
      ui_focus_area: "Nutrition adherence chart, streak counter, and client compliance",
      cursor_action: "Highlight compliance percentage, weekly trend, and member meal logging",
      overlay_text: "Adherence you can see",
      narration: "Track meal logging and macro adherence to prove nutrition coaching ROI.",
      camera_motion: "pull back reveal",
      transition: "fade to black",
      duration: 4,
      professional_purpose: "End with measurable nutrition outcomes",
    }),
  ],
}

export const SOCIAL_MEDIA_MANAGER_WORKFLOW: AppWorkflowDefinition = {
  id: "social_media_manager",
  label: "FitCore AI Launch Campaign",
  description: MARKETING_LAUNCH_VIDEO_SCENES.map((scene) => scene.screenName).join(
    " → ",
  ),
  keywords: SOCIAL_KEYWORDS,
  beats: buildMarketingLaunchWorkflowBeats(),
}

export const FULL_PLATFORM_OVERVIEW_WORKFLOW: AppWorkflowDefinition = {
  id: "full_platform_overview",
  label: "Full Platform Overview",
  description:
    "Dashboard → members → workouts → nutrition → sessions → marketing AI → analytics",
  keywords: OVERVIEW_KEYWORDS,
  beats: [
    beat(1, "dashboard", "Dashboard", "Morning command center", {
      ui_focus_area: "KPI cards and today's schedule strip",
      cursor_action: "Tap dashboard widgets, highlight revenue and session count",
      overlay_text: "Your business at a glance",
      narration: "Start every day with KPIs, schedule, and business health in one view.",
      camera_motion: "screen push in",
      transition: "slide wipe",
      duration: 3,
      professional_purpose: "Open with executive-level clarity",
    }),
    beat(2, "members", "Members", "Know every client", {
      ui_focus_area: "Member list with avatars and goal tags",
      cursor_action: "Scroll members list, tap profile card",
      overlay_text: "CRM built for coaches",
      narration: "Manage every client profile, goal, and status without leaving the platform.",
      camera_motion: "lateral pan",
      transition: "cross dissolve",
      duration: 3,
      professional_purpose: "Show client management depth",
    }),
    beat(3, "workouts", "Workouts", "Program in minutes", {
      ui_focus_area: "Workout plan editor with exercise blocks",
      cursor_action: "Drag exercise block, click assign to member",
      overlay_text: "Plans without spreadsheets",
      narration: "Build and assign workout programs in minutes, not hours.",
      camera_motion: "tracking follow",
      transition: "zoom transition",
      duration: 3,
      professional_purpose: "Demonstrate core coaching workflow",
    }),
    beat(4, "nutrition", "Nutrition", "Fuel the plan", {
      ui_focus_area: "Macro rings and meal template cards",
      cursor_action: "Adjust macros, drop meal template into plan",
      overlay_text: "Nutrition made simple",
      narration: "Create macro-aligned meal plans with templates your clients will follow.",
      camera_motion: "top-down push",
      transition: "motion blur",
      duration: 3,
      professional_purpose: "Show holistic coaching stack",
    }),
    beat(5, "sessions", "Sessions", "Calendar under control", {
      ui_focus_area: "Sessions calendar with time blocks",
      cursor_action: "Drag session onto calendar, confirm booking",
      overlay_text: "Scheduling without chaos",
      narration: "Book sessions, send reminders, and never double-book again.",
      camera_motion: "over-shoulder push",
      transition: "soft dissolve",
      duration: 3,
      professional_purpose: "Show operational efficiency",
    }),
    beat(6, "marketing-ai", "Marketing AI", "Growth on autopilot", {
      ui_focus_area: "Marketing AI panel with content generation",
      cursor_action: "Click generate, review AI copy, add to calendar",
      overlay_text: "Marketing that runs itself",
      narration: "Generate posts, scripts, and calendar content with AI — stay consistent.",
      camera_motion: "orbit pan",
      transition: "pixel dissolve",
      duration: 3,
      professional_purpose: "Highlight growth automation",
    }),
    beat(7, "analytics", "Analytics", "Prove the ROI", {
      ui_focus_area: "Growth charts and retention funnel",
      cursor_action: "Gesture at upward trends and engagement metrics",
      overlay_text: "Decisions backed by data",
      narration: "Track retention, revenue, and content performance to grow with confidence.",
      camera_motion: "pull back reveal",
      transition: "fade to black",
      duration: 4,
      professional_purpose: "Close with measurable business impact",
    }),
  ],
}

export const APP_WORKFLOWS: Record<AppWorkflowId, AppWorkflowDefinition> = {
  create_workout_plan: CREATE_WORKOUT_PLAN_WORKFLOW,
  create_nutrition_plan: CREATE_NUTRITION_PLAN_WORKFLOW,
  social_media_manager: SOCIAL_MEDIA_MANAGER_WORKFLOW,
  full_platform_overview: FULL_PLATFORM_OVERVIEW_WORKFLOW,
}

/** @deprecated Use getWorkflowSceneCount(workflowId) for per-workflow scene counts. */
export const WORKFLOW_SCENE_COUNT = 7

export function getWorkflowSceneCount(workflowId: AppWorkflowId): number {
  return APP_WORKFLOWS[workflowId].beats.length
}

export function isWorkflowDirectorStyle(
  style: string | null | undefined,
): style is WorkflowDirectorStyle {
  const normalized = style?.trim()
  return (
    normalized === "app_showcase" ||
    normalized === "saas_demo"
  )
}

function normalizePromptText(prompt: string): string {
  return prompt.trim().toLowerCase().replace(/\s+/g, " ")
}

function scoreWorkflowKeywords(prompt: string, keywords: string[]): number {
  const normalized = normalizePromptText(prompt)
  let score = 0

  for (const keyword of keywords) {
    if (normalized.includes(keyword.toLowerCase())) {
      score += keyword.includes(" ") ? 3 : 1
    }
  }

  return score
}

export function detectWorkflowFromPrompt(prompt: string): AppWorkflowId {
  const normalized = normalizePromptText(prompt)
  if (!normalized) {
    return "full_platform_overview"
  }

  const scores = APP_WORKFLOW_IDS.map((id) => ({
    id,
    score: scoreWorkflowKeywords(prompt, APP_WORKFLOWS[id].keywords),
  })).sort((a, b) => b.score - a.score)

  if (scores[0].score > 0 && scores[0].score > (scores[1]?.score ?? 0)) {
    return scores[0].id
  }

  return "full_platform_overview"
}

export function getWorkflowDefinition(
  workflowId: AppWorkflowId,
): AppWorkflowDefinition {
  return APP_WORKFLOWS[workflowId]
}

export function buildWorkflowFromPrompt(prompt: string): {
  workflowId: AppWorkflowId
  workflow: AppWorkflowDefinition
} {
  const workflowId = detectWorkflowFromPrompt(prompt)
  return {
    workflowId,
    workflow: getWorkflowDefinition(workflowId),
  }
}

export function buildWorkflowSceneStructurePrompt(
  workflow: AppWorkflowDefinition,
): string {
  return workflow.beats
    .map(
      (beat) =>
        `Scene ${beat.step} — ${beat.module} (${beat.storyBeat}): ${beat.professional_purpose}. UI focus: ${beat.ui_focus_area}. Cursor: ${beat.cursor_action}. Overlay: "${beat.overlay_text}". Narration: "${beat.narration}". Asset: ${beat.asset_key}. Camera: ${beat.camera_motion}. Transition: ${beat.transition}.`,
    )
    .join("\n")
}

export function buildWorkflowJsonSceneExample(
  workflow: AppWorkflowDefinition,
): object[] {
  const sceneSteps = getWorkflowSceneSteps(workflow.id)

  return workflow.beats.map((beat, index) => {
    const asset = resolveAssetForBeat(beat)
    const workflowStep = sceneSteps[index] ?? sceneSteps[sceneSteps.length - 1]
    const layoutDefaults = isMarketingLaunchWorkflow(workflow.id)
      ? {
          layout_style: "premium_saas" as const,
          blur_background: false,
          zoom_level: MARKETING_LAUNCH_ZOOM_LEVEL,
        }
      : visualLayerFromAssetKey(asset.asset_key, index)
    const visualLayer = deriveSceneVisualLayer(
      {
        ui_focus_area: beat.ui_focus_area,
        camera_motion: beat.camera_motion,
        asset_key: asset.asset_key,
        workflow_step: workflowStep,
        ...layoutDefaults,
      },
      index,
    )
    const animation = deriveSceneAnimation({
      index,
      totalScenes: workflow.beats.length,
      workflow_step: workflowStep,
      asset_key: asset.asset_key,
      layout_style: visualLayer.layout_style,
      cursor_action: beat.cursor_action,
      overlay_text: beat.overlay_text,
      visual: beat.visualDirection,
      story_beat: beat.storyBeat,
      professional_purpose: beat.professional_purpose,
    })

    return {
      workflow_step: workflowStep,
      asset_key: asset.asset_key,
      text: beat.overlay_text,
      visual: beat.visualDirection,
      image_prompt: buildBeatImagePrompt(beat),
      ui_focus_area: beat.ui_focus_area,
      cursor_action: beat.cursor_action,
      overlay_text: beat.overlay_text,
      narration: beat.narration,
      camera_motion: beat.camera_motion,
      transition: beat.transition,
      duration: beat.duration,
      professional_purpose: beat.professional_purpose,
      story_beat: beat.storyBeat,
      module: beat.module,
      character_action: beat.cursor_action,
      asset_url: asset.asset_url,
      crop_focus: beat.ui_focus_area || asset.asset_key,
      highlight_area: beat.ui_focus_area,
      blur_background: visualLayer.blur_background,
      zoom_level: visualLayer.zoom_level,
      layout_style: visualLayer.layout_style,
      animation_type: animation.animation_type,
      animation_duration: animation.animation_duration,
      caption_position: animation.caption_position,
      highlight_style: animation.highlight_style,
    }
  })
}

function mergeBeatWithScene(
  scene: VideoScriptScene,
  beat: WorkflowSceneBeat,
  style: string,
  index = beat.step - 1,
): VideoScriptScene {
  const asset = resolveAssetForBeat(beat)
  const launchScene = getMarketingLaunchSceneByStep(beat.step)
  const visualLayer = deriveSceneVisualLayer(
    {
      ui_focus_area: scene.ui_focus_area?.trim() || beat.ui_focus_area,
      camera_motion: scene.camera_motion?.trim() || beat.camera_motion,
      asset_key: asset.asset_key,
      workflow_step: scene.workflow_step,
      module: beat.module,
      crop_focus: scene.crop_focus,
      highlight_area: scene.highlight_area,
      blur_background: launchScene ? false : scene.blur_background,
      zoom_level: launchScene ? MARKETING_LAUNCH_ZOOM_LEVEL : scene.zoom_level,
      layout_style: scene.layout_style,
    },
    index,
  )

  return {
    ...scene,
    story_beat: scene.story_beat?.trim() || beat.storyBeat,
    module: scene.module?.trim() || beat.module,
    text: scene.overlay_text?.trim() || scene.text?.trim() || beat.overlay_text,
    overlay_text: scene.overlay_text?.trim() || beat.overlay_text,
    ui_focus_area: scene.ui_focus_area?.trim() || beat.ui_focus_area,
    cursor_action: scene.cursor_action?.trim() || beat.cursor_action,
    narration: scene.narration?.trim() || beat.narration,
    professional_purpose:
      scene.professional_purpose?.trim() || beat.professional_purpose,
    character_action:
      scene.character_action?.trim() || scene.cursor_action?.trim() || beat.cursor_action,
    visual: scene.visual?.trim() || beat.visualDirection,
    camera_motion: scene.camera_motion?.trim() || beat.camera_motion,
    transition: scene.transition?.trim() || beat.transition,
    duration: scene.duration > 0 ? scene.duration : beat.duration,
    asset_key: scene.asset_key?.trim() || asset.asset_key,
    asset_url: scene.asset_url?.trim() || asset.asset_url,
    imageUrl: scene.imageUrl || scene.asset_url || asset.asset_url,
    image_prompt:
      scene.image_prompt?.trim() || buildBeatImagePrompt(beat),
    crop_focus:
      scene.crop_focus?.trim() ||
      beat.ui_focus_area ||
      asset.asset_key,
    highlight_area:
      scene.highlight_area?.trim() || beat.ui_focus_area,
    blur_background:
      scene.blur_background ?? (launchScene ? false : visualLayer.blur_background),
    zoom_level:
      scene.zoom_level ??
      (launchScene ? MARKETING_LAUNCH_ZOOM_LEVEL : visualLayer.zoom_level),
    layout_style: scene.layout_style ?? visualLayer.layout_style,
  }
}

export function buildSceneFromWorkflowBeat(
  beat: WorkflowSceneBeat,
  style: string,
): VideoScriptScene {
  return mergeBeatWithScene(
    {
      text: beat.overlay_text,
      visual: beat.visualDirection,
      image_prompt: buildBeatImagePrompt(beat),
      camera_motion: beat.camera_motion,
      transition: beat.transition,
      duration: beat.duration,
    },
    beat,
    style,
    beat.step - 1,
  )
}

export function normalizeWorkflowSceneCount(
  scenes: VideoScriptScene[],
  workflow: AppWorkflowDefinition,
  style: string,
): VideoScriptScene[] {
  const targetCount = workflow.beats.length
  const trimmed = scenes.slice(0, targetCount)
  const padded = [...trimmed]

  while (padded.length < targetCount) {
    const beat = workflow.beats[padded.length]
    if (!beat) break
    padded.push(buildSceneFromWorkflowBeat(beat, style))
  }

  return padded
}

export function applyWorkflowDirectorToScenes(
  scenes: VideoScriptScene[],
  workflow: AppWorkflowDefinition,
  style: string,
): VideoScriptScene[] {
  const normalized = normalizeWorkflowSceneCount(scenes, workflow, style)

  return normalized.map((scene, index) => {
    const beat = workflow.beats[index]
    if (!beat) return scene

    const asset = resolveAssetForBeat(beat)

    return mergeBeatWithScene(
      {
        ...scene,
        asset_key: asset.asset_key,
        asset_url: asset.asset_url,
      },
      beat,
      style,
      index,
    )
  })
}

export function buildWorkflowDirectorSystemPromptBlock(
  workflow: AppWorkflowDefinition,
  prompt?: string,
): string {
  if (prompt?.trim()) {
    return buildWorkflowIntelligenceDirectorBlock(
      workflow,
      detectUserGoal(prompt),
    )
  }

  return buildLegacyWorkflowDirectorBlock(workflow)
}

function buildLegacyWorkflowDirectorBlock(
  workflow: AppWorkflowDefinition,
): string {
  const launchRules = isMarketingLaunchWorkflow(workflow.id)
    ? `\n\n${buildMarketingLaunchDirectorRules()}`
    : ""

  return `App Workflow Director — selected workflow: ${workflow.label}
Path: ${workflow.description}

Generate EXACTLY ${workflow.beats.length} scenes in this order:
${buildWorkflowSceneStructurePrompt(workflow)}

Every scene MUST include these professional direction fields:
- asset_key and asset_url (use the asset keys from the workflow path)
- ui_focus_area — specific UI element to highlight (e.g. "Create Workout Plan button")
- cursor_action — mouse/cursor movement (e.g. "Click create plan, then highlight exercise list")
- overlay_text — short on-screen headline (max 8 words)
- narration — voiceover line explaining the business value
- camera_motion — one of: ${SCENE_CAMERA_MOTIONS.slice(0, 8).join(", ")}
- transition — one of: ${SCENE_TRANSITIONS.slice(0, 8).join(", ")}
- duration — 2-5 seconds (finale may be 4-5s)
- professional_purpose — why this scene matters in the demo (e.g. "Show speed and workflow clarity")
- text — same as overlay_text (on-screen copy)
- visual — cinematic SaaS demo direction for the screenshot framing
- crop_focus — which part of the screenshot to emphasize (never empty)
- highlight_area — UI element to visually highlight (usually matches ui_focus_area)
- blur_background — true or false
- zoom_level — number between 1.05 and 1.25
- layout_style — one of: premium_saas, glass_card, floating_dashboard, split_story, dark_commercial
- animation_type — one of: slow_zoom, zoom_highlight, pan_left, pan_right, slide_up, split_reveal, dashboard_focus
- animation_duration — integer seconds between 2 and 4
- caption_position — one of: top, middle, bottom
- highlight_style — one of: pulse, glow, border, spotlight

${buildSceneAnimationDirectorRules()}

Videos must feel like professional SaaS demo commercials — not static screenshot slideshows.
Vary camera_motion and transition across scenes. Each scene advances the product workflow logically.${launchRules}`
}

export function getWorkflowSceneCountForStyle(
  style: string,
  workflowId: AppWorkflowId = "full_platform_overview",
): number {
  return isWorkflowDirectorStyle(style) ? getWorkflowSceneCount(workflowId) : 4
}
