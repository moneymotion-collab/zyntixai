import {
  enrichScenesWithImagePrompts,
} from "@/lib/marketing/build-scene-image-prompt"
import {
  enrichScenesWithCinematics,
  parseSceneCameraMotion,
  parseSceneTransition,
} from "@/lib/marketing/video-scene-cinematics"
import {
  FITCORE_COACH_MASCOT,
  getMascotDescription,
  getMascotStyle,
} from "@/lib/marketing/brand-mascot"
import type {
  VideoScript,
  VideoScriptMascot,
  VideoScriptScene,
} from "@/lib/marketing/video-script-types"
import {
  applyStyleThumbnailDefaults,
} from "@/lib/marketing/video-thumbnail-guides"
import { mapShowcaseAssetsToScenes } from "@/lib/marketing/app-showcase-engine"
import {
  clampZoomLevel,
  parseBlurBackground,
  parseSceneLayoutStyle,
} from "@/lib/marketing/scene-visual-layer"
import {
  clampAnimationDuration,
  parseSceneAnimationType,
  parseSceneCaptionPosition,
  parseSceneHighlightStyle,
} from "@/lib/marketing/scene-animation"
import {
  isShowcaseDemoStyle,
  normalizeShowcaseScenes,
} from "@/lib/marketing/normalize-showcase-scene-fields"
import {
  buildWorkflowFromPrompt,
  type AppWorkflowDefinition,
} from "@/lib/marketing/app-workflow-director"
import { enrichScenesWithWorkflowIntelligence } from "@/lib/workflow-intelligence"
import {
  stylesRequiringMascot,
} from "@/lib/marketing/video-templates/app-showcase-template"
import {
  normalizeGeneratorVideoStyle,
  type GeneratorVideoStyle,
} from "@/lib/marketing/video-styles"
import {
  applyVideoGeneratorSchemaFallbacks,
} from "@/lib/marketing/video-generator-ai-schema"
import {
  alignScenesToPlatformModules,
  PLATFORM_SHOWCASE_SCRIPT_MODULES,
} from "@/lib/video/platform-module-script"
import { alignScenesToStoryStructure } from "@/lib/marketing/story-structure"
import type { DemoScenePlan } from "@/lib/workflow-intelligence/types"
import type { WorkflowType } from "@/lib/workflow-intelligence/workflow-types"

const WORKFLOW_DEMO_HOOK_FALLBACK =
  "Run your coaching business in one place."
const WORKFLOW_DEMO_CTA_FALLBACK = "Start your free trial today."

function isWorkflowDemoParseContext(
  style: GeneratorVideoStyle,
  workflowType: string,
  options?: ParseVideoScriptOptions,
): boolean {
  if (isShowcaseDemoStyle(style)) return true

  const forcedStyle = options?.forcedStyle?.trim()
  if (forcedStyle && isShowcaseDemoStyle(normalizeGeneratorVideoStyle(forcedStyle))) {
    return true
  }

  if (workflowType) return true

  if (options?.workflowType?.toString().trim()) return true

  return false
}

function parseOptionalString(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function parseDuration(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.round(value)
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.trim())
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.round(parsed)
    }
  }

  return null
}

const DEFAULT_VIDEO_HASHTAGS = [
  "fitness",
  "gymtips",
  "reels",
  "gymreels",
] as const

export type ParseVideoScriptOptions = {
  forcedStyle?: string
  prompt?: string
  workflow?: AppWorkflowDefinition
  workflowType?: WorkflowType | string
  workflowSummary?: string
  scenePlans?: DemoScenePlan[]
  useStoryStructure?: boolean
}

export type ParseVideoScriptResult =
  | { ok: true; script: VideoScript }
  | { ok: false; reason: string }

function parseScene(value: unknown): VideoScriptScene | null {
  if (!value || typeof value !== "object") return null

  const scene = value as {
    text?: unknown
    on_screen_text?: unknown
    onScreenText?: unknown
    visual?: unknown
    visual_description?: unknown
    visualDescription?: unknown
    camera_motion?: unknown
    cameraMotion?: unknown
    transition?: unknown
    duration?: unknown
    story_beat?: unknown
    storyBeat?: unknown
    module?: unknown
    character_action?: unknown
    characterAction?: unknown
    image_prompt?: unknown
    imagePrompt?: unknown
    asset_key?: unknown
    assetKey?: unknown
    asset_url?: unknown
    assetUrl?: unknown
    image_url?: unknown
    imageUrl?: unknown
    screenshot_url?: unknown
    screenshotUrl?: unknown
    ui_focus_area?: unknown
    uiFocusArea?: unknown
    cursor_action?: unknown
    cursorAction?: unknown
    overlay_text?: unknown
    overlayText?: unknown
    narration?: unknown
    professional_purpose?: unknown
    professionalPurpose?: unknown
    crop_focus?: unknown
    cropFocus?: unknown
    highlight_area?: unknown
    highlightArea?: unknown
    blur_background?: unknown
    blurBackground?: unknown
    zoom_level?: unknown
    zoomLevel?: unknown
    layout_style?: unknown
    layoutStyle?: unknown
    animation_type?: unknown
    animationType?: unknown
    animation_duration?: unknown
    animationDuration?: unknown
    caption_position?: unknown
    captionPosition?: unknown
    highlight_style?: unknown
    highlightStyle?: unknown
    workflow_step?: unknown
    workflowStep?: unknown
    step_id?: unknown
    stepId?: unknown
  }

  const text = parseOptionalString(
    scene.text ?? scene.on_screen_text ?? scene.onScreenText,
  )
  const visual = parseOptionalString(
    scene.visual ?? scene.visual_description ?? scene.visualDescription,
  )
  const camera_motion = parseSceneCameraMotion(
    scene.camera_motion ?? scene.cameraMotion,
  )
  const transition = parseSceneTransition(scene.transition)
  const story_beat = parseOptionalString(scene.story_beat ?? scene.storyBeat)
  const module = parseOptionalString(scene.module)
  const character_action = parseOptionalString(
    scene.character_action ?? scene.characterAction,
  )
  const image_prompt = parseOptionalString(
    scene.image_prompt ?? scene.imagePrompt,
  )
  const asset_key = parseOptionalString(scene.asset_key ?? scene.assetKey)
  const asset_url = parseOptionalString(scene.asset_url ?? scene.assetUrl)
  const image_url = parseOptionalString(scene.image_url ?? scene.imageUrl)
  const screenshot_url = parseOptionalString(
    scene.screenshot_url ?? scene.screenshotUrl,
  )
  const visual_description = parseOptionalString(
    scene.visual_description ?? scene.visualDescription,
  )
  const ui_focus_area = parseOptionalString(
    scene.ui_focus_area ?? scene.uiFocusArea,
  )
  const cursor_action = parseOptionalString(
    scene.cursor_action ?? scene.cursorAction,
  )
  const overlay_text = parseOptionalString(
    scene.overlay_text ?? scene.overlayText,
  )
  const narration = parseOptionalString(scene.narration)
  const professional_purpose = parseOptionalString(
    scene.professional_purpose ?? scene.professionalPurpose,
  )
  const crop_focus = parseOptionalString(scene.crop_focus ?? scene.cropFocus)
  const highlight_area = parseOptionalString(
    scene.highlight_area ?? scene.highlightArea,
  )
  const blur_background =
    scene.blur_background !== undefined || scene.blurBackground !== undefined
      ? parseBlurBackground(scene.blur_background ?? scene.blurBackground)
      : undefined
  const zoom_level =
    scene.zoom_level !== undefined || scene.zoomLevel !== undefined
      ? clampZoomLevel(scene.zoom_level ?? scene.zoomLevel)
      : undefined
  const layout_style_raw = parseOptionalString(
    scene.layout_style ?? scene.layoutStyle,
  )
  const layout_style = layout_style_raw
    ? parseSceneLayoutStyle(layout_style_raw)
    : undefined
  const animation_type = parseSceneAnimationType(
    scene.animation_type ?? scene.animationType,
  )
  const animation_duration_raw =
    scene.animation_duration ?? scene.animationDuration
  const animation_duration =
    animation_duration_raw !== undefined
      ? clampAnimationDuration(
          typeof animation_duration_raw === "number"
            ? animation_duration_raw
            : Number.parseFloat(String(animation_duration_raw)),
        )
      : undefined
  const caption_position = parseSceneCaptionPosition(
    scene.caption_position ?? scene.captionPosition,
  )
  const highlight_style = parseSceneHighlightStyle(
    scene.highlight_style ?? scene.highlightStyle,
  )
  const workflow_step = parseOptionalString(
    scene.workflow_step ??
      scene.workflowStep ??
      scene.step_id ??
      scene.stepId,
  )

  const duration = parseDuration(scene.duration) ?? 2

  if (!text && !overlay_text && !visual) return null
  const resolvedText = text || overlay_text || visual.slice(0, 80)
  const resolvedVisualDescription =
    visual_description || visual || resolvedText
  return {
    text: resolvedText,
    visual: visual || resolvedVisualDescription,
    image_prompt,
    camera_motion,
    transition,
    duration,
    ...(workflow_step ? { workflow_step } : {}),
    ...(story_beat ? { story_beat } : {}),
    ...(module ? { module } : {}),
    ...(character_action ? { character_action } : {}),
    ...(asset_key ? { asset_key } : {}),
    ...(asset_url ? { asset_url } : {}),
    ...(image_url ? { image_url, imageUrl: image_url } : {}),
    ...(screenshot_url ? { screenshot_url } : {}),
    visual_description: resolvedVisualDescription,
    ...(ui_focus_area ? { ui_focus_area } : {}),
    ...(cursor_action ? { cursor_action } : {}),
    ...(overlay_text ? { overlay_text } : {}),
    ...(narration ? { narration } : {}),
    ...(professional_purpose ? { professional_purpose } : {}),
    ...(crop_focus ? { crop_focus } : {}),
    ...(highlight_area ? { highlight_area } : {}),
    ...(blur_background !== undefined ? { blur_background } : {}),
    ...(zoom_level !== undefined ? { zoom_level } : {}),
    ...(layout_style ? { layout_style } : {}),
    ...(animation_type ? { animation_type } : {}),
    ...(animation_duration !== undefined ? { animation_duration } : {}),
    ...(caption_position ? { caption_position } : {}),
    ...(highlight_style ? { highlight_style } : {}),
  }
}

function parseMascot(value: unknown): VideoScriptMascot | undefined {
  if (typeof value === "string") {
    const name = value.trim()
    if (!name) return undefined

    return {
      name,
      description: getMascotDescription(),
      style: getMascotStyle(),
      personality: FITCORE_COACH_MASCOT.personality.join(", "),
    }
  }

  if (!value || typeof value !== "object") return undefined

  const mascot = value as {
    name?: unknown
    description?: unknown
    style?: unknown
    personality?: unknown
    voiceTone?: unknown
  }

  const name = typeof mascot.name === "string" ? mascot.name.trim() : ""
  const description =
    typeof mascot.description === "string" ? mascot.description.trim() : ""
  const style = typeof mascot.style === "string" ? mascot.style.trim() : ""
  const personality =
    typeof mascot.personality === "string"
      ? mascot.personality.trim()
      : typeof mascot.voiceTone === "string"
        ? mascot.voiceTone.trim()
        : ""

  if (!name && !description && !style && !personality) return undefined

  return {
    name: name || FITCORE_COACH_MASCOT.name,
    description: description || getMascotDescription(),
    style: style || getMascotStyle(),
    personality:
      personality || FITCORE_COACH_MASCOT.voiceTone.join(", "),
  }
}

function defaultMascot(): VideoScriptMascot {
  return {
    name: FITCORE_COACH_MASCOT.name,
    description: getMascotDescription(),
    style: getMascotStyle(),
    personality: FITCORE_COACH_MASCOT.voiceTone.join(", "),
  }
}

function applyThumbnailDefaults(
  style: ReturnType<typeof normalizeGeneratorVideoStyle>,
  hook: string,
  cta: string,
  scenes: VideoScriptScene[],
  thumbnail_title: string,
  thumbnail_text: string,
  thumbnail_visual: string,
): Pick<VideoScript, "thumbnail_title" | "thumbnail_text" | "thumbnail_visual"> {
  return applyStyleThumbnailDefaults(
    style,
    hook,
    cta,
    scenes,
    thumbnail_title,
    thumbnail_text,
    thumbnail_visual,
  )
}

function parseThumbnailFields(
  raw: Record<string, unknown>,
  style: ReturnType<typeof normalizeGeneratorVideoStyle>,
  hook: string,
  cta: string,
  scenes: VideoScriptScene[],
): Pick<VideoScript, "thumbnail_title" | "thumbnail_text" | "thumbnail_visual"> {
  const thumbnail_title = parseOptionalString(
    raw.thumbnail_title ?? raw.thumbnailTitle,
  )
  const thumbnail_text = parseOptionalString(
    raw.thumbnail_text ?? raw.thumbnailText,
  )
  const thumbnail_visual = parseOptionalString(
    raw.thumbnail_visual ?? raw.thumbnailVisual,
  )

  return applyThumbnailDefaults(
    style,
    hook,
    cta,
    scenes,
    thumbnail_title,
    thumbnail_text,
    thumbnail_visual,
  )
}

function parseHashtags(value: unknown): string[] {
  if (Array.isArray(value)) {
    const hashtags = value
      .filter((tag): tag is string => typeof tag === "string")
      .map((tag) => tag.trim().replace(/^#/, ""))
      .filter(Boolean)

    if (hashtags.length > 0) {
      return hashtags
    }
  }

  if (typeof value === "string" && value.trim()) {
    const hashtags = value
      .split(/[\s,]+/)
      .map((tag) => tag.trim().replace(/^#/, ""))
      .filter(Boolean)

    if (hashtags.length > 0) {
      return hashtags
    }
  }

  return [...DEFAULT_VIDEO_HASHTAGS]
}

function buildCaptionFallback(hook: string, cta: string): string {
  if (hook && cta) {
    return `${hook} ${cta}`
  }

  return hook || cta
}

export function parseVideoScriptWithResult(
  value: unknown,
  options?: ParseVideoScriptOptions,
): ParseVideoScriptResult {
  if (!value || typeof value !== "object") {
    return { ok: false, reason: "Response was not a JSON object." }
  }

  const raw = value as {
    hook?: unknown
    scenes?: unknown
    cta?: unknown
    style?: unknown
    mascot?: unknown
    musicMood?: unknown
    music_mood?: unknown
    caption?: unknown
    post_caption?: unknown
    postCaption?: unknown
    hashtags?: unknown
    thumbnail_title?: unknown
    thumbnailTitle?: unknown
    thumbnail_text?: unknown
    thumbnailText?: unknown
    thumbnail_visual?: unknown
    thumbnailVisual?: unknown
    workflow_type?: unknown
    workflowType?: unknown
    workflow_summary?: unknown
    workflowSummary?: unknown
  }

  const hook = typeof raw.hook === "string" ? raw.hook.trim() : ""
  const cta = typeof raw.cta === "string" ? raw.cta.trim() : ""
  const workflow_type = parseOptionalString(
    raw.workflow_type ?? raw.workflowType,
  )
  const workflow_summary = parseOptionalString(
    raw.workflow_summary ?? raw.workflowSummary,
  )
  const style = options?.forcedStyle
    ? normalizeGeneratorVideoStyle(options.forcedStyle)
    : normalizeGeneratorVideoStyle(
        typeof raw.style === "string" ? raw.style : undefined,
      )
  const isWorkflowDemo = isWorkflowDemoParseContext(
    style,
    workflow_type,
    options,
  )
  const resolvedHook = hook || (isWorkflowDemo ? WORKFLOW_DEMO_HOOK_FALLBACK : "")
  const resolvedCta = cta || (isWorkflowDemo ? WORKFLOW_DEMO_CTA_FALLBACK : "")
  const musicMood =
    parseOptionalString(raw.musicMood ?? raw.music_mood) || undefined
  const caption =
    parseOptionalString(raw.caption ?? raw.post_caption ?? raw.postCaption) ||
    buildCaptionFallback(resolvedHook, resolvedCta)
  const hashtags = parseHashtags(raw.hashtags)

  if (!resolvedHook && !isWorkflowDemo) {
    return { ok: false, reason: "Missing or empty hook." }
  }

  if (!resolvedCta && !isWorkflowDemo) {
    return { ok: false, reason: "Missing or empty call to action." }
  }

  if (!Array.isArray(raw.scenes)) {
    return { ok: false, reason: "Scenes must be an array." }
  }

  let scenes = enrichScenesWithCinematics(
    raw.scenes
      .map(parseScene)
      .filter((scene): scene is VideoScriptScene => scene != null),
    style,
  )

  if (isWorkflowDemo) {
    if (scenes.length === 0) {
      return {
        ok: false,
        reason: "Workflow demo style requires at least one valid scene.",
      }
    }

    const workflow =
      options?.workflow ??
      buildWorkflowFromPrompt(options?.prompt ?? "").workflow

    scenes = enrichScenesWithWorkflowIntelligence(
      scenes,
      workflow.id,
      style,
    )
    scenes = mapShowcaseAssetsToScenes(scenes, style)
    scenes = normalizeShowcaseScenes(scenes, {
      style,
      scenePlans: options?.scenePlans,
    })
    scenes = alignScenesToPlatformModules(
      scenes,
      scenes.length === PLATFORM_SHOWCASE_SCRIPT_MODULES.length
        ? PLATFORM_SHOWCASE_SCRIPT_MODULES
        : undefined,
    )
  } else if (scenes.length === 0) {
    return { ok: false, reason: "No valid scenes with text and duration." }
  }

  if (options?.useStoryStructure) {
    scenes = alignScenesToStoryStructure(scenes)
  }

  let mascot = parseMascot(raw.mascot)
  if (stylesRequiringMascot().includes(style)) {
    if (!mascot) {
      mascot = defaultMascot()
    }
  } else {
    mascot = undefined
  }

  scenes = enrichScenesWithImagePrompts(scenes, mascot, style)

  const thumbnail = parseThumbnailFields(
    raw,
    style,
    resolvedHook,
    resolvedCta,
    scenes,
  )

  const baseScript: VideoScript = {
    hook: resolvedHook,
    scenes,
    cta: resolvedCta,
    style,
    caption,
    hashtags,
    ...thumbnail,
    ...(workflow_type ? { workflow_type } : {}),
    ...(workflow_summary ? { workflow_summary } : {}),
    ...(mascot ? { mascot } : {}),
    ...(musicMood ? { musicMood } : {}),
  }

  const script =
    isWorkflowDemo
      ? applyVideoGeneratorSchemaFallbacks(baseScript, {
          style,
          prompt: options?.prompt,
          workflowType: options?.workflowType ?? workflow_type,
          workflowSummary: options?.workflowSummary ?? workflow_summary,
          scenePlans: options?.scenePlans,
          mascot,
        })
      : baseScript

  return {
    ok: true,
    script,
  }
}

export function parseVideoScript(
  value: unknown,
  options?: ParseVideoScriptOptions,
): VideoScript | null {
  const result = parseVideoScriptWithResult(value, options)
  return result.ok ? result.script : null
}

export function parseVideoScriptFromText(
  text: string,
  options?: ParseVideoScriptOptions,
): VideoScript | null {
  const result = parseVideoScriptFromTextWithResult(text, options)
  return result.ok ? result.script : null
}

export function parseVideoScriptFromTextWithResult(
  text: string,
  options?: ParseVideoScriptOptions,
): ParseVideoScriptResult {
  const trimmed = text.trim()
  if (!trimmed) {
    return { ok: false, reason: "AI response was empty." }
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fencedMatch?.[1]?.trim() ?? trimmed

  const jsonStart = candidate.indexOf("{")
  const jsonEnd = candidate.lastIndexOf("}")
  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
    return { ok: false, reason: "No JSON object found in AI response." }
  }

  try {
    return parseVideoScriptWithResult(
      JSON.parse(candidate.slice(jsonStart, jsonEnd + 1)),
      options,
    )
  } catch {
    return { ok: false, reason: "AI response contained invalid JSON." }
  }
}

export function formatVideoHashtags(hashtags: string[] | undefined): string {
  if (!hashtags?.length) {
    return "#gymreels #fitness #reels #gymtips #tiktok"
  }

  return hashtags
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
    .join(" ")
}
