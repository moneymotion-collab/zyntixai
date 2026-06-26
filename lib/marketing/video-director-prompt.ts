import {
  buildSceneImagePromptDirectorRules,
  SCENE_IMAGE_PROMPT_EXAMPLE,
} from "@/lib/marketing/build-scene-image-prompt"
import {
  buildMascotPromptBlock,
  type MascotFieldOverrides,
} from "@/lib/marketing/brand-mascot"
import { buildVideoStyleCinematicPromptList } from "@/lib/marketing/video-scene-cinematics"
import { buildVideoStyleThumbnailPromptList } from "@/lib/marketing/video-thumbnail-guides"
import {
  APP_WORKFLOWS,
  buildWorkflowFromPrompt,
  buildWorkflowJsonSceneExample,
  getWorkflowSceneCount,
  type AppWorkflowDefinition,
} from "@/lib/marketing/app-workflow-director"
import {
  buildAppShowcaseAiJsonExample,
  buildVideoGeneratorAiSchemaPromptBlock,
  formatVideoGeneratorAiSchemaJson,
} from "@/lib/marketing/video-generator-ai-schema"
import { buildVisualLayerDirectorRules } from "@/lib/marketing/scene-visual-layer"
import { buildSceneAnimationDirectorRules } from "@/lib/marketing/scene-animation"
import {
  buildWorkflowIntelligenceDirectorBlock,
  detectUserGoal,
} from "@/lib/workflow-intelligence"
import { toWorkflowType, buildWorkflowSummary } from "@/lib/workflow-intelligence/workflow-types"
import {
  buildStoryStructureDirectorBlock,
  isStoryStructureCompatibleStyle,
  STORY_STRUCTURE_SCENE_COUNT,
} from "@/lib/marketing/story-structure"
import { buildFitCoreVisualIdentityDirectorBlock } from "@/lib/marketing/visual-identity"
import {
  buildShowcaseSystemPrompt as buildAppShowcaseSystemPrompt,
  isAppShowcaseStyle,
} from "@/lib/marketing/saas-showcase-engine"
import {
  SCENE_CAMERA_MOTIONS,
  SCENE_TRANSITIONS,
} from "@/lib/marketing/video-scene-cinematics"
import {
  buildGeneratorVideoStylePromptList,
  buildVideoStyleAutoSelectInstructions,
  GENERATOR_VIDEO_STYLES,
} from "@/lib/marketing/video-styles"

export const VIDEO_DIRECTOR_SCENE_REQUIRED_FIELDS = [
  "text",
  "visual",
  "image_prompt",
  "camera_motion",
  "transition",
  "duration",
] as const

export const VIDEO_DIRECTOR_SCENE_JSON_SCHEMA = `{
  "text": "On-screen copy (max 12 words)",
  "visual": "Cinematic visual direction — subject, environment, lighting, mood",
  "image_prompt": "Detailed Visual Engine prompt for image generation (never empty)",
  "camera_motion": "slow zoom in",
  "transition": "motion blur",
  "duration": 2
}`

export const VIDEO_DIRECTOR_SCENE_EXAMPLE = {
  text: "Still managing clients manually?",
  visual: "Fitness coach working late behind laptop in dim gym office, overwhelmed expression",
  image_prompt:
    "Cinematic medium shot of a tired fitness coach in athletic wear working late behind a laptop in a dim modern gym office, warm desk lamp and cool blue screen glow, shallow depth of field, premium commercial photography, vertical 9:16",
  camera_motion: "slow zoom in",
  transition: "motion blur",
  duration: 2,
}

export const VIDEO_DIRECTOR_JSON_SCHEMA = `{
  "hook": "",
  "style": "viral_caption",
  "thumbnail_title": "Stop Wasting Hours",
  "thumbnail_text": "Create content in minutes",
  "thumbnail_visual": "Zyntix Coach overwhelmed with multiple apps open, bold text overlay, high contrast.",
  "scenes": [
    {
      "text": "Stop wasting hours creating content.",
      "visual": "Zyntix Coach overwhelmed with multiple apps open.",
      "image_prompt": "Cinematic medium shot of a tired fitness coach working late behind a laptop in a dim modern gym office, warm desk lamp and cool blue screen glow, shallow depth of field, premium commercial photography, vertical 9:16",
      "camera_motion": "slow zoom in",
      "transition": "motion blur",
      "duration": 2
    }
  ],
  "cta": "",
  "caption": "",
  "hashtags": ["fitness", "gymtips", "reels"],
  "musicMood": ""
}`

export const VIDEO_DIRECTOR_MASCOT_JSON_SCHEMA = `{
  "hook": "",
  "style": "mascot_story",
  "thumbnail_title": "Stop Wasting Hours",
  "thumbnail_text": "Create content in minutes",
  "thumbnail_visual": "Zyntix Coach mascot front and center, neon blue glow, scroll-stopping cover frame.",
  "mascot": {
    "name": "",
    "description": "",
    "style": "",
    "personality": ""
  },
  "scenes": [
    {
      "text": "Stop wasting hours creating content.",
      "visual": "Zyntix Coach mascot points at a cluttered coaching dashboard.",
      "image_prompt": "Cinematic medium shot of a tired fitness coach working late behind a laptop in a dim modern gym office, warm desk lamp and cool blue screen glow, shallow depth of field, premium commercial photography, vertical 9:16",
      "camera_motion": "tracking follow",
      "transition": "motion blur",
      "duration": 2
    }
  ],
  "cta": "",
  "caption": "",
  "hashtags": ["fitness", "gymtips", "reels"],
  "musicMood": ""
}`

function buildMascotJsonSchemaExample(overrides?: MascotFieldOverrides): string {
  const block = buildMascotPromptBlock(undefined, overrides)
  const lines = block.split("\n")
  const read = (prefix: string) =>
    lines.find((line) => line.startsWith(prefix))?.slice(prefix.length).trim() ?? ""

  return JSON.stringify(
    {
      hook: "",
      style: "mascot_story",
      thumbnail_title: "Stop Wasting Hours",
      thumbnail_text: "Create content in minutes",
      thumbnail_visual:
        "Zyntix Coach mascot front and center, neon blue glow, scroll-stopping cover frame.",
      mascot: {
        name: read("Mascot name: "),
        description: read("Mascot description: "),
        style: read("Mascot style: "),
        personality: read("Voice tone: "),
      },
      scenes: [
        {
          text: "Stop wasting hours creating content.",
          visual: "Zyntix Coach mascot points at a cluttered coaching dashboard.",
          image_prompt: SCENE_IMAGE_PROMPT_EXAMPLE,
          camera_motion: "tracking follow",
          transition: "motion blur",
          duration: 2,
        },
      ],
      cta: "",
      caption: "",
      hashtags: ["fitness", "gymtips", "reels"],
      musicMood: "",
    },
    null,
    2,
  )
}

function buildSaasDemoWorkflowSystemPrompt(
  _mascotOverrides?: MascotFieldOverrides,
  workflow: AppWorkflowDefinition = APP_WORKFLOWS.full_platform_overview,
  prompt?: string,
): string {
  const sceneCount = getWorkflowSceneCount(workflow.id)
  const goal = detectUserGoal(prompt ?? "")
  const jsonSchema = formatVideoGeneratorAiSchemaJson(
    buildAppShowcaseAiJsonExample({
      workflow,
      workflowType: toWorkflowType(workflow.id),
      workflowSummary: buildWorkflowSummary(workflow.id, goal.inferredObjective),
      inferredObjective: goal.inferredObjective,
      style: "saas_demo",
      includeMascot: false,
    }),
  )

  const workflowBlock = buildWorkflowIntelligenceDirectorBlock(workflow, goal)

  return `You are the App Workflow Director — a premium SaaS demo commercial director for Zyntix Coach.

${buildFitCoreVisualIdentityDirectorBlock()}

Create saas_demo videos that feel like professional SaaS product commercials — not static screenshot slideshows.

${workflowBlock}

Required style slug: saas_demo

Required output:
1. hook — scroll-stopping business pain opener (max 12 words)
2. style — must be "saas_demo"
3. workflow_type — snake_case workflow id from Workflow Intelligence
4. workflow_summary — purpose and scene path summary
5. scenes — EXACTLY ${sceneCount} scenes following the workflow path above
6. cta — clear trial or demo call to action
7. thumbnail_title — short bold SaaS cover headline (2-5 words)
8. thumbnail_text — business benefit subline (max 8 words)
9. thumbnail_visual — cinematic cover frame with platform UI context
10. caption — professional social post caption (1-3 sentences)
11. hashtags — array of 4-8 tags without requiring the # prefix

${buildVideoGeneratorAiSchemaPromptBlock()}

Scene rules (ALL ${sceneCount} scenes):
- Each scene MUST include workflow_step, asset_key, text, overlay_text, ui_focus_area, cursor_action, narration, professional_purpose, visual, image_prompt, camera_motion, transition, duration, crop_focus, highlight_area, blur_background, zoom_level, layout_style, animation_type, animation_duration, caption_position, and highlight_style
- No mascot field — this is a UI-first product demo
- asset_key and asset_url: use the workflow asset keys from the path above
- image_prompt: cinematic Visual Engine prompt for AI image generation (never empty — no flat screenshots)
${buildSceneImagePromptDirectorRules()}
- camera_motion: prefer ${SCENE_CAMERA_MOTIONS.slice(0, 8).join(", ")} — vary across scenes
- transition: prefer ${SCENE_TRANSITIONS.slice(0, 8).join(", ")} — vary across scenes

${buildSceneAnimationDirectorRules()}

${buildVisualLayerDirectorRules()}

Global rules:
- Output JSON only
- Never leave any required field empty
- EXACTLY ${sceneCount} scenes in workflow order
- Tie every beat to the user's prompt, target audience, and business goal

JSON shape:
${jsonSchema}`
}

export function buildVideoDirectorSystemPrompt(
  mascotOverrides?: MascotFieldOverrides,
  options?: {
    forceStyle?: string
    prompt?: string
    workflow?: AppWorkflowDefinition
    useStoryStructure?: boolean
  },
): string {
  const workflow =
    options?.workflow ??
    (options?.prompt
      ? buildWorkflowFromPrompt(options.prompt).workflow
      : APP_WORKFLOWS.full_platform_overview)

  if (isAppShowcaseStyle(options?.forceStyle)) {
    return buildAppShowcaseSystemPrompt(
      mascotOverrides,
      workflow,
      options?.prompt,
    )
  }

  if (options?.forceStyle === "saas_demo") {
    return buildSaasDemoWorkflowSystemPrompt(
      mascotOverrides,
      workflow,
      options?.prompt,
    )
  }

  const mascotExampleSchema = mascotOverrides
    ? buildMascotJsonSchemaExample(mascotOverrides)
    : VIDEO_DIRECTOR_MASCOT_JSON_SCHEMA
  const mascotBlock = buildMascotPromptBlock(undefined, mascotOverrides)
  const allowedStyles = GENERATOR_VIDEO_STYLES.join(", ")
  const styleSelectionBlock = options?.forceStyle
    ? `Use this exact style: ${options.forceStyle}. Do not choose a different style.`
    : buildVideoStyleAutoSelectInstructions()

  const useStoryStructure =
    options?.useStoryStructure === true &&
    isStoryStructureCompatibleStyle(options?.forceStyle)

  const sceneCountRule = useStoryStructure
    ? `EXACTLY ${STORY_STRUCTURE_SCENE_COUNT} scenes when Story Structure Engine is active (see below)`
    : "2 to 4 scenes for most styles; EXACTLY 7 scenes when style is app_showcase (one per platform module)"

  const storyStructureBlock = useStoryStructure
    ? `

${buildStoryStructureDirectorBlock()}

When Story Structure Engine is active:
- Override default scene count — output EXACTLY ${STORY_STRUCTURE_SCENE_COUNT} scenes
- Prefer problem_solution, premium_ad, viral_caption, or mascot_story visual treatment
- Every scene object MUST include story_beat`
    : ""

  return `You are a premium AI video ad director for fitness and coach marketing.

${buildFitCoreVisualIdentityDirectorBlock()}

Create short-form video scripts for commercial social media ads with cinematic visual direction.

Never use real celebrities, real influencers, public figures, or lookalikes.
Only create original brand-safe characters and mascots.

Allowed styles (only these):
${buildGeneratorVideoStylePromptList()}

Style selection:
${styleSelectionBlock}

Cinematic direction per style (match the chosen style):
${buildVideoStyleCinematicPromptList()}

Thumbnail direction per style (REQUIRED for every style — match the chosen style):
${buildVideoStyleThumbnailPromptList()}

Style output rules:
- viral_caption: kinetic text overlays, bold hook, fast educational beats. No mascot field.
- problem_solution: problem beat → tension beat → solution beat. No mascot field.
- premium_ad: cinematic visuals, minimal copy, luxury pacing. No mascot field.
- saas_demo: dashboard/UI mockups, feature callouts, workflow demo framing. No mascot field.
- app_showcase: EXACTLY 7-scene Zyntix Coach SaaS platform demo. MUST include mascot. Fixed module workflow: Dashboard → Members → Workouts → Nutrition → Sessions → Marketing AI → Analytics. Use this brand mascot:
${mascotBlock}
- mascot_story: character-led narrative. MUST include mascot object. Use this brand mascot:
${mascotBlock}

Required output for EVERY style:
1. hook — scroll-stopping opening line
2. scenes — ${sceneCountRule}. Every scene object MUST include these required keys:
${VIDEO_DIRECTOR_SCENE_JSON_SCHEMA}
   app_showcase scenes also require: story_beat, module, character_action
   Story Structure Engine scenes also require: story_beat (Hook, Problem, Why it happens, Solution, Features, Results, CTA)
${storyStructureBlock}
3. cta — clear call to action
4. thumbnail_title — short bold cover headline (2-5 words, ALL CAPS friendly)
5. thumbnail_text — supporting subline for the cover (max 8 words)
6. thumbnail_visual — cinematic cover frame direction: subject, composition, lighting, and mood for the scroll-stopping thumbnail
7. caption — social post caption (1-3 sentences)
8. hashtags — array of 4-8 tags without requiring the # prefix
9. musicMood — short mood descriptor for background music
10. style — one allowed slug: ${allowedStyles}

Scene cinematic rules:
- Every scene MUST include text, visual, image_prompt, camera_motion, transition, and duration
- visual must read like a shot list entry — who/what is on screen and how it looks
- image_prompt must be a standalone, detailed image-generation prompt for the Visual Engine
${buildSceneImagePromptDirectorRules()}
- camera_motion and transition must fit the chosen style's cinematic guide above
- Vary camera_motion and transition across scenes; do not repeat the same pair twice in a row

Thumbnail rules (ALL styles):
- thumbnail_title, thumbnail_text, and thumbnail_visual are REQUIRED on every script
- Match the chosen style's thumbnail guide above — title tone, text tone, and visual composition
- thumbnail_visual describes the cover frame only (no on-image text — title/text are separate fields)
- Thumbnail must feel scroll-stopping and distinct from individual scene visuals

Mascot rules (mascot_story and app_showcase):
- mascot must be an object with name, description, style, and personality
- mascot.personality is the mascot voice tone
- Fill mascot fields from the brand mascot block; never leave them empty
- NEVER output mascot as a string
- Omit mascot completely for all other styles

app_showcase scene order (exactly 7 — one module per scene):
1. Dashboard — morning command center, KPIs and schedule overview
2. Members — CRM, profiles, goals, retention
3. Workouts — program builder and assignment
4. Nutrition — macros, meal templates, client plans
5. Sessions — calendar, booking, reminders
6. Marketing AI — content generation and calendar
7. Analytics — growth metrics, retention, ROI proof

Global rules:
- Output JSON only
- Never leave hook, cta, caption, musicMood, thumbnail_title, thumbnail_text, thumbnail_visual, scene text, scene visual, scene image_prompt, camera_motion, or transition empty
- hashtags must contain at least 4 items
- Max 4 scenes (except app_showcase requires exactly 7; Story Structure Engine requires exactly ${STORY_STRUCTURE_SCENE_COUNT})
- Match platform pacing and the user's stated goal

Default JSON shape (non-mascot styles):
${VIDEO_DIRECTOR_JSON_SCHEMA}

mascot_story JSON shape:
${mascotExampleSchema}`
}
