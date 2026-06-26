import {
  buildSceneImagePromptDirectorRules,
} from "@/lib/marketing/build-scene-image-prompt"
import {
  buildFitCoreBrandedScenePrompt,
  buildFitCoreVisualIdentityDirectorBlock,
} from "@/lib/marketing/visual-identity"
import {
  buildMascotPromptBlock,
  FITCORE_COACH_MASCOT,
  getMascotDescription,
  getMascotStyle,
  type MascotFieldOverrides,
} from "@/lib/marketing/brand-mascot"
import type {
  VideoScript,
  VideoScriptScene,
} from "@/lib/marketing/video-script-types"
import {
  SCENE_CAMERA_MOTIONS,
  SCENE_TRANSITIONS,
  type SceneCameraMotion,
  type SceneTransition,
} from "@/lib/marketing/video-scene-cinematics"
import {
  APP_WORKFLOWS,
  getWorkflowSceneCountForStyle,
  isWorkflowDirectorStyle,
  type AppWorkflowDefinition,
  WORKFLOW_SCENE_COUNT,
  getWorkflowSceneCount,
} from "@/lib/marketing/app-workflow-director"
import {
  buildAppShowcaseAiJsonExample,
  buildVideoGeneratorAiSchemaPromptBlock,
  formatVideoGeneratorAiSchemaJson,
} from "@/lib/marketing/video-generator-ai-schema"
import { buildPlatformModuleScenePromptBlock } from "@/lib/video/platform-module-script"
import {
  buildShowcaseVisualLayerCatalog,
  buildVisualLayerDirectorRules,
  enrichSceneWithVisualLayer,
  PROFESSIONAL_VISUAL_LAYER_RULES,
  type ShowcaseSceneVisualSpec,
} from "@/lib/marketing/scene-visual-layer"
import { getShowcaseVisualPresetForModule } from "@/lib/marketing/showcase-scene-visual-presets"
import {
  moduleToAssetKey,
  getShowcaseAsset,
} from "@/lib/marketing/workflow-scene-asset-resolver"
import {
  buildWorkflowIntelligenceDirectorBlock,
  detectUserGoal,
} from "@/lib/workflow-intelligence"
import {
  buildWorkflowSummary,
  toWorkflowType,
} from "@/lib/workflow-intelligence/workflow-types"
import { APP_SHOWCASE_STYLE, isAppShowcaseStyle } from "@/lib/marketing/video-styles"
import * as showcaseBeats from "@/lib/marketing/showcase-workflow-beats"

export {
  buildShowcaseVisualLayerCatalog,
  PROFESSIONAL_VISUAL_LAYER_RULES,
  type ShowcaseSceneVisualSpec,
} from "@/lib/marketing/scene-visual-layer"
export {
  APP_SHOWCASE_STYLE,
  isAppShowcaseStyle,
} from "@/lib/marketing/video-styles"
export {
  SHOWCASE_MODULE_VISUAL_PRESETS,
  ASSET_VISUAL_PRESETS,
  getShowcaseVisualPresetForModule,
  getShowcaseVisualPresetForAsset,
  type ShowcaseVisualPreset,
} from "@/lib/marketing/showcase-scene-visual-presets"
export {
  APP_SHOWCASE_SCENE_BEATS,
  APP_SHOWCASE_SCENE_COUNT,
  buildShowcasePlatformModulesPrompt,
  buildShowcaseSceneStructurePrompt,
  buildShowcaseWorkflowSummary,
  getShowcaseBeatForIndex,
  PLATFORM_MODULES,
  SHOWCASE_WORKFLOW_BEATS,
  type PlatformModule,
  type ShowcaseModuleBeat,
} from "@/lib/marketing/showcase-workflow-beats"

export type AppShowcaseSceneBeat = showcaseBeats.PlatformModule

export type AppShowcaseGenerateInput = {
  prompt: string
  targetAudience: string
  platform: string
  goal: string
  brandName: string
  brandContext?: string
}

export function buildShowcaseJsonSchema(
  mascotOverrides?: MascotFieldOverrides,
  workflow: AppWorkflowDefinition = APP_WORKFLOWS.full_platform_overview,
  prompt?: string,
): string {
  const goal = detectUserGoal(prompt ?? "")

  return formatVideoGeneratorAiSchemaJson(
    buildAppShowcaseAiJsonExample({
      workflow,
      mascotOverrides,
      workflowType: toWorkflowType(workflow.id),
      workflowSummary: buildWorkflowSummary(workflow.id, goal.inferredObjective),
      inferredObjective: goal.inferredObjective,
    }),
  )
}

export function buildShowcaseSystemPrompt(
  mascotOverrides?: MascotFieldOverrides,
  workflow: AppWorkflowDefinition = APP_WORKFLOWS.full_platform_overview,
  prompt?: string,
): string {
  const mascotBlock = buildMascotPromptBlock(undefined, mascotOverrides)
  const jsonSchema = buildShowcaseJsonSchema(mascotOverrides, workflow, prompt)
  const goal = detectUserGoal(prompt ?? "")
  const workflowBlock = buildWorkflowIntelligenceDirectorBlock(workflow, goal)
  const sceneCount = getWorkflowSceneCount(workflow.id)

  return `You are the SaaS Showcase Engine — a premium video ad director for ZyntixAI, a fitness coaching platform.

${buildFitCoreVisualIdentityDirectorBlock()}

You know these platform modules:
${showcaseBeats.buildShowcasePlatformModulesPrompt()}

${workflowBlock}

Never use real celebrities, real influencers, public figures, or lookalikes.
Always use the Zyntix Coach brand mascot as the on-screen guide:
${mascotBlock}

Purpose:
Generate app_showcase demo videos that walk through a cohesive product workflow for coaching businesses — professional SaaS demo commercials, not screenshot slideshows.

Required style slug: app_showcase

Required output:
1. hook — scroll-stopping business pain opener (max 12 words)
2. style — must be "app_showcase"
3. workflow_type — snake_case workflow id from Workflow Intelligence (e.g. "workout_plan_workflow")
4. workflow_summary — one-line purpose plus scene path summary
5. mascot — REQUIRED object with name, description, style, personality (from brand mascot block)
6. scenes — EXACTLY ${sceneCount} scenes following the selected workflow path above
7. cta — clear trial or demo call to action
8. thumbnail_title — short bold SaaS cover headline (2-5 words)
9. thumbnail_text — business benefit subline (max 8 words)
10. thumbnail_visual — cinematic cover frame with mascot + platform UI context
11. caption — professional social post caption (1-3 sentences)
12. hashtags — array of 4-8 tags without requiring the # prefix

${buildVideoGeneratorAiSchemaPromptBlock()}

Scene rules (ALL ${sceneCount} scenes):
- Each scene MUST include module, text, duration, visual_description (REQUIRED — see module alignment rules below)
- module: snake_case platform module id that MUST match the scene text (dashboard, members, workouts, nutrition, progress, sessions, marketing, analytics, ai_coach)
- text: on-screen copy for that module (max 12 words) — MUST describe the same module
- visual_description: REQUIRED — cinematic scene direction for the same module (environment, character, lighting — not a flat UI screenshot)
- duration: 2-5 seconds per scene (default 3)
- Each scene MUST also include workflow_step, asset_key, overlay_text, ui_focus_area, cursor_action, narration, professional_purpose, character_action, visual, image_prompt, camera_motion, transition, crop_focus, highlight_area, blur_background, zoom_level, and layout_style

${buildPlatformModuleScenePromptBlock()}

- workflow_step: snake_case step id from the workflow path (e.g. "dashboard", "workout_builder")
- text and overlay_text: same value — on-screen copy aligned with module
- ui_focus_area: specific UI element to highlight (e.g. "Create Workout Plan button")
- cursor_action: cursor/mouse movement direction (e.g. "Click create plan, then highlight exercise list")
- narration: voiceover line explaining business value
- professional_purpose: why this scene matters (e.g. "Show speed and workflow clarity")
- character_action: what the mascot does on screen — gestures, clicks, narrates, reacts
- visual: cinematic commercial direction — environment, character, lighting, mood (never empty, never a flat app screenshot)
- asset_key and asset_url: use the workflow asset keys from the path above
- image_prompt: detailed Visual Engine prompt for image generation (never empty)
${buildSceneImagePromptDirectorRules()}
- camera_motion: prefer ${SCENE_CAMERA_MOTIONS.slice(0, 8).join(", ")} — vary across scenes
- transition: prefer ${SCENE_TRANSITIONS.slice(0, 8).join(", ")} — vary across scenes
- duration: 2-5 seconds per scene (finale may be 4-5s)
- Each scene must feel like the next step in one product workflow — not isolated feature dumps
- Show professional SaaS marketing quality — clean UI, black/white/electric blue palette

${buildVisualLayerDirectorRules()}

Thumbnail rules:
- thumbnail_title, thumbnail_text, and thumbnail_visual are REQUIRED
- Cover must feel like a premium B2B SaaS ad, not a consumer fitness reel

Global rules:
- Output JSON only
- Never leave any required field empty
- EXACTLY ${sceneCount} scenes in workflow order — no extras
- Match platform pacing and the stated goal
- Tie every beat to the user's prompt, target audience, and business goal

JSON shape:
${jsonSchema}`
}

export function buildShowcaseUserPrompt(input: AppShowcaseGenerateInput): string {
  return `
Brand name: ${input.brandName}
Platform: ${input.platform}
Target audience: ${input.targetAudience}
Goal: ${input.goal}

Video request:
${input.prompt}

${input.brandContext ?? ""}
  `.trim()
}

export function stylesRequiringMascot(): readonly string[] {
  return ["mascot_story", APP_SHOWCASE_STYLE]
}

export function getMaxScenesForStyle(style: string): number {
  if (isWorkflowDirectorStyle(style)) {
    return getWorkflowSceneCountForStyle(style)
  }
  return isAppShowcaseStyle(style) ? showcaseBeats.APP_SHOWCASE_SCENE_COUNT : 4
}

export function getMinScenesForStyle(style: string): number {
  if (isWorkflowDirectorStyle(style)) {
    return getWorkflowSceneCountForStyle(style)
  }
  return isAppShowcaseStyle(style) ? showcaseBeats.APP_SHOWCASE_SCENE_COUNT : 1
}

export function formatShowcaseSceneVisual(scene: VideoScriptScene): string {
  const parts = [scene.visual.trim()]
  if (scene.character_action?.trim()) {
    parts.push(`Character action: ${scene.character_action.trim()}`)
  }
  return parts.filter(Boolean).join(". ")
}

export function buildShowcaseSceneFromBeat(
  beat: showcaseBeats.ShowcaseModuleBeat,
  mascot?: { name: string; description: string; style: string },
  index = beat.workflowStep - 1,
): VideoScriptScene {
  const resolvedMascot = mascot ?? {
    name: FITCORE_COACH_MASCOT.name,
    description: getMascotDescription(),
    style: getMascotStyle(),
  }
  const visual = beat.visualDirection
  const assetKey = moduleToAssetKey(beat.module)
  const asset = assetKey ? getShowcaseAsset(assetKey) : null
  const preset = getShowcaseVisualPresetForModule(beat.module)
  const ui_focus_area = preset?.highlight_area ?? beat.purpose.split(" — ")[0]

  const base: VideoScriptScene = {
    story_beat: beat.storyBeat,
    module: beat.module,
    text: beat.purpose.split(" — ")[0] ?? beat.module,
    overlay_text: beat.storyBeat,
    character_action: beat.characterAction,
    visual,
    image_prompt: buildFitCoreBrandedScenePrompt(
      {
        sceneDirection: visual,
        onScreenText: beat.purpose.split(" — ")[0] ?? beat.module,
        cameraMotion: beat.cameraMotion,
        characterAction: beat.characterAction,
      },
      {
        mode: "image",
        mascotName: resolvedMascot.name,
        mascotDescription: resolvedMascot.description,
        mascotStyle: resolvedMascot.style,
      },
    ),
    camera_motion: beat.cameraMotion,
    transition: beat.transition,
    duration: beat.defaultDuration,
    ui_focus_area,
    ...(asset
      ? { asset_key: asset.asset_key, asset_url: asset.asset_url }
      : {}),
    ...(preset
      ? {
          crop_focus: preset.crop_focus,
          highlight_area: preset.highlight_area,
          blur_background: preset.blur_background,
          zoom_level: preset.zoom_level,
          layout_style: preset.layout_style,
        }
      : {}),
  }

  return enrichSceneWithVisualLayer(base, index)
}

export function normalizeShowcaseSceneCount(
  scenes: VideoScriptScene[],
): VideoScriptScene[] {
  const trimmed = scenes.slice(0, showcaseBeats.APP_SHOWCASE_SCENE_COUNT)
  const padded = [...trimmed]

  while (padded.length < showcaseBeats.APP_SHOWCASE_SCENE_COUNT) {
    const beat = showcaseBeats.SHOWCASE_WORKFLOW_BEATS[padded.length]
    if (!beat) break
    padded.push(buildShowcaseSceneFromBeat(beat))
  }

  return padded
}

export function enrichShowcaseScenes(scenes: VideoScriptScene[]): VideoScriptScene[] {
  const mascot = {
    name: FITCORE_COACH_MASCOT.name,
    description: getMascotDescription(),
    style: getMascotStyle(),
  }

  return scenes.map((scene, index) => {
    const beat = showcaseBeats.getShowcaseBeatForIndex(index)
    if (!beat) return enrichSceneWithVisualLayer(scene, index)

    const visual = (scene.visual ?? "").trim() || beat.visualDirection
    const character_action =
      scene.character_action?.trim() || beat.characterAction
    const assetKey = moduleToAssetKey(beat.module)
    const asset = assetKey ? getShowcaseAsset(assetKey) : null
    const preset = getShowcaseVisualPresetForModule(beat.module)

    const enriched: VideoScriptScene = {
      ...scene,
      story_beat: scene.story_beat?.trim() || beat.storyBeat,
      module: scene.module?.trim() || beat.module,
      overlay_text: scene.overlay_text?.trim() || beat.storyBeat,
      character_action,
      visual,
      image_prompt:
        scene.image_prompt?.trim() ||
        buildFitCoreBrandedScenePrompt(
          {
            sceneDirection: visual,
            onScreenText: scene.text || beat.module,
            cameraMotion: (scene.camera_motion ?? "").trim() || beat.cameraMotion,
            characterAction: character_action,
          },
          {
            mode: "image",
            mascotName: mascot.name,
            mascotDescription: mascot.description,
            mascotStyle: mascot.style,
          },
        ),
      camera_motion: (scene.camera_motion ?? "").trim() || beat.cameraMotion,
      transition: (scene.transition ?? "").trim() || beat.transition,
      duration: scene.duration > 0 ? scene.duration : beat.defaultDuration,
      ui_focus_area:
        scene.ui_focus_area?.trim() ||
        preset?.highlight_area ||
        beat.purpose.split(" — ")[0],
      ...(asset
        ? {
            asset_key: scene.asset_key?.trim() || asset.asset_key,
            asset_url: scene.asset_url?.trim() || asset.asset_url,
          }
        : {}),
      crop_focus: scene.crop_focus?.trim() || preset?.crop_focus,
      highlight_area: scene.highlight_area?.trim() || preset?.highlight_area,
      blur_background: scene.blur_background ?? preset?.blur_background,
      zoom_level: scene.zoom_level ?? preset?.zoom_level,
      layout_style: scene.layout_style ?? preset?.layout_style,
    }

    return enrichSceneWithVisualLayer(enriched, index)
  })
}

export function buildShowcaseMockVideoScript(
  brandName = FITCORE_COACH_MASCOT.name,
): VideoScript {
  const mascot = {
    name: FITCORE_COACH_MASCOT.name,
    description: getMascotDescription(),
    style: getMascotStyle(),
  }
  const scenes: VideoScriptScene[] = showcaseBeats.SHOWCASE_WORKFLOW_BEATS.map(
    (beat, index) => buildShowcaseSceneFromBeat(beat, mascot, index),
  )

  const enrichedScenes = enrichShowcaseScenes(scenes)

  return {
    hook: "Stop juggling apps to run your coaching business.",
    style: APP_SHOWCASE_STYLE,
    mascot: {
      name: FITCORE_COACH_MASCOT.name,
      description: getMascotDescription(),
      style: getMascotStyle(),
      personality: FITCORE_COACH_MASCOT.voiceTone.join(", "),
    },
    scenes: enrichedScenes,
    cta: `Start your free trial with ${brandName}.`,
    thumbnail_title: "ONE PLATFORM",
    thumbnail_text: "Dashboard to analytics, unified.",
    thumbnail_visual:
      "Zyntix Coach mascot beside premium SaaS dashboard on laptop, neon blue glow, scroll-stopping cover frame.",
    musicMood: "confident, modern, premium SaaS",
    caption: `${brandName} connects dashboard, members, workouts, nutrition, sessions, marketing AI, and analytics in one coach workflow.`,
    hashtags: [
      "fitnessbusiness",
      "personaltrainer",
      "saas",
      "gymowner",
      "ZyntixCoach",
      "coachingsoftware",
    ],
  }
}
