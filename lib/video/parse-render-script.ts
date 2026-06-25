export type RenderScene = {
  text: string
  duration: number
  visual?: string
  imageUrl?: string
  asset_url?: string
  overlay_text?: string
  asset_key?: string
  crop_focus?: string
  highlight_area?: string
  blur_background?: boolean
  zoom_level?: number
  layout_style?: string
  ui_focus_area?: string
  camera_motion?: string
  workflow_step?: string
  module?: string
  animation_duration?: number
}

export type ParsedRenderScript = {
  hook: string
  cta: string
  style?: string
  title?: string
  scenes: RenderScene[]
  usedFallback: boolean
  parsedScript: Record<string, unknown> | null
  sceneSource?: string
}

function parseString(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function parseDuration(value: unknown, fallback = 3): number {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.min(30, Math.max(1, Math.round(value)))
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.trim())
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.min(30, Math.max(1, Math.round(parsed)))
    }
  }

  return fallback
}

/** Parse script from JSON object, JSON string, or plain text fallback. */
export function parseScriptInput(
  script: unknown,
): Record<string, unknown> | null {
  if (script == null) return null

  if (typeof script === "object" && !Array.isArray(script)) {
    return script as Record<string, unknown>
  }

  if (typeof script === "string") {
    const trimmed = script.trim()
    if (!trimmed) return null

    try {
      const parsed = JSON.parse(trimmed) as unknown
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>
      }
    } catch {
      return { text: trimmed }
    }
  }

  return null
}

function sceneTextFromItem(item: Record<string, unknown>): string {
  return (
    parseString(item.text) ||
    parseString(item.on_screen_text) ||
    parseString(item.onScreenText) ||
    parseString(item.overlay_text) ||
    parseString(item.overlayText) ||
    parseString(item.narration) ||
    parseString(item.visual) ||
    parseString(item.visual_description) ||
    parseString(item.visualDescription) ||
    parseString(item.headline) ||
    parseString(item.caption) ||
    ""
  )
}

export function normalizeSceneItem(item: unknown): RenderScene | null {
  if (!item || typeof item !== "object") return null

  const record = item as Record<string, unknown>
  const text = sceneTextFromItem(record)
  if (!text) return null

  const imageUrl =
    parseString(record.imageUrl) ||
    parseString(record.image_url) ||
    parseString(record.asset_url) ||
    parseString(record.assetUrl) ||
    undefined

  return {
    text,
    duration: parseDuration(record.duration ?? record.animation_duration),
    visual: parseString(record.visual) || text,
    imageUrl,
    asset_url: parseString(record.asset_url) || parseString(record.assetUrl) || undefined,
    overlay_text:
      parseString(record.overlay_text) || parseString(record.overlayText) || undefined,
    asset_key: parseString(record.asset_key) || parseString(record.assetKey) || undefined,
    crop_focus: parseString(record.crop_focus) || parseString(record.cropFocus) || undefined,
    highlight_area:
      parseString(record.highlight_area) || parseString(record.highlightArea) || undefined,
    blur_background:
      typeof record.blur_background === "boolean"
        ? record.blur_background
        : typeof record.blurBackground === "boolean"
          ? record.blurBackground
          : undefined,
    zoom_level:
      typeof record.zoom_level === "number"
        ? record.zoom_level
        : typeof record.zoomLevel === "number"
          ? record.zoomLevel
          : undefined,
    layout_style:
      parseString(record.layout_style) || parseString(record.layoutStyle) || undefined,
    ui_focus_area:
      parseString(record.ui_focus_area) || parseString(record.uiFocusArea) || undefined,
    camera_motion:
      parseString(record.camera_motion) || parseString(record.cameraMotion) || undefined,
    workflow_step:
      parseString(record.workflow_step) ||
      parseString(record.workflowStep) ||
      undefined,
    module: parseString(record.module) || undefined,
    animation_duration:
      typeof record.animation_duration === "number"
        ? record.animation_duration
        : typeof record.animationDuration === "number"
          ? record.animationDuration
          : undefined,
  }
}

function scenesFromArray(value: unknown): RenderScene[] {
  if (!Array.isArray(value)) return []

  return value
    .map(normalizeSceneItem)
    .filter((scene): scene is RenderScene => scene != null)
}

function scenesArrayExists(parsed: Record<string, unknown>): boolean {
  for (const key of ["scenes", "slides", "items"] as const) {
    if (Array.isArray(parsed[key]) && parsed[key].length > 0) {
      return true
    }
  }
  return false
}

/** True when the project or script payload has real script content (not just empty JSON). */
export function hasRenderableScriptSource(input: {
  script?: unknown
  dbScenes?: unknown[]
  hook?: string | null
  prompt?: string | null
}): boolean {
  if (scenesFromArray(input.dbScenes ?? []).length > 0) {
    return true
  }

  const parsed = parseScriptInput(input.script)
  if (!parsed) {
    return Boolean(parseString(input.hook) || parseString(input.prompt))
  }

  if (scenesArrayExists(parsed)) {
    return true
  }

  return Boolean(
    parseString(parsed.hook) ||
      parseString(input.hook) ||
      parseString(parsed.text) ||
      parseString(input.prompt),
  )
}

function synthesizeScenesFromScriptFields(input: {
  hook?: string | null
  cta?: string | null
  prompt?: string | null
  parsedScript?: Record<string, unknown> | null
}): RenderScene[] {
  const parsed = input.parsedScript
  const hook =
    parseString(input.hook) ||
    parseString(parsed?.hook) ||
    ""
  const cta =
    parseString(input.cta) ||
    parseString(parsed?.cta) ||
    ""
  const prompt = parseString(input.prompt) || ""
  const plainText = parseString(parsed?.text)
  const synthesized: RenderScene[] = []

  if (hook) {
    synthesized.push({ text: hook, duration: 3 })
  }
  if (plainText && plainText !== hook) {
    synthesized.push({ text: plainText, duration: 4 })
  }
  if (prompt && prompt !== hook && prompt !== plainText) {
    synthesized.push({ text: prompt.slice(0, 160), duration: 4 })
  }
  if (cta && cta !== hook && cta !== prompt && cta !== plainText) {
    synthesized.push({ text: cta, duration: 3 })
  }

  return synthesized
}

/** Extract scenes from script.scenes, .slides, or .items only. */
export function extractScenesFromParsed(
  parsed: Record<string, unknown>,
): RenderScene[] {
  for (const key of ["scenes", "slides", "items"] as const) {
    const scenes = scenesFromArray(parsed[key])
    if (scenes.length > 0) return scenes
  }

  return []
}

export function buildDefaultFallbackScenes(context?: {
  title?: string | null
  prompt?: string | null
}): RenderScene[] {
  const title =
    typeof context?.title === "string" && context.title.trim()
      ? context.title.trim()
      : "Your video"
  const prompt =
    typeof context?.prompt === "string" && context.prompt.trim()
      ? context.prompt.trim()
      : "Add scenes to render your marketing video."

  return [
    { text: title, duration: 3 },
    { text: prompt.slice(0, 160), duration: 4 },
  ]
}

export function resolveRenderScript(input: {
  script?: unknown
  title?: string | null
  prompt?: string | null
  hook?: string | null
  cta?: string | null
  style?: string | null
  dbScenes?: unknown[]
}): ParsedRenderScript {
  const parsedScript = parseScriptInput(input.script)
  const contextHook =
    parseString(parsedScript?.hook) || parseString(input.hook) || ""
  const contextCta =
    parseString(parsedScript?.cta) || parseString(input.cta) || ""
  const style =
    parseString(parsedScript?.style) || parseString(input.style) || undefined
  const title =
    parseString(parsedScript?.title) ||
    parseString(input.title) ||
    "Your video"

  let scenes: RenderScene[] = []
  let usedFallback = false
  let sceneSource = "none"

  const dbSceneList = scenesFromArray(input.dbScenes ?? [])
  if (dbSceneList.length > 0) {
    scenes = dbSceneList
    sceneSource = "video_scenes"
  } else if (parsedScript) {
    scenes = extractScenesFromParsed(parsedScript)
    if (scenes.length > 0) {
      sceneSource = "generated_videos.script"
    }
  }

  if (scenes.length === 0 && hasRenderableScriptSource(input)) {
    scenes = synthesizeScenesFromScriptFields({
      hook: input.hook ?? contextHook,
      cta: input.cta ?? contextCta,
      prompt: input.prompt,
      parsedScript,
    })
    if (scenes.length > 0) {
      sceneSource = parsedScript ? "script_synthesized" : "project_synthesized"
    }
  }

  if (scenes.length === 0) {
    scenes = buildDefaultFallbackScenes({
      title,
      prompt: input.prompt,
    })
    usedFallback = true
    sceneSource = "fallback"
  }

  const hook =
    parseString(input.hook) || contextHook || scenes[0]?.text || title
  const cta =
    parseString(input.cta) ||
    contextCta ||
    scenes[scenes.length - 1]?.text ||
    ""

  return {
    hook,
    cta,
    style,
    title,
    scenes,
    usedFallback,
    parsedScript,
    sceneSource,
  }
}

export function computeVideoDurationSeconds(
  hook: string,
  scenes: RenderScene[],
  cta: string,
  hookSeconds = 2,
  ctaSeconds = 2,
): number {
  const bodySeconds = scenes.reduce(
    (sum, scene) => sum + (scene.duration > 0 ? scene.duration : 3),
    0,
  )

  return hookSeconds + bodySeconds + ctaSeconds
}

export function logRenderCompositionDebug(
  label: string,
  payload: {
    parsedScript: Record<string, unknown> | null
    scenes: RenderScene[]
    hook: string
    cta: string
    title?: string
    durationSeconds: number
    compositionProps: Record<string, unknown>
    frame?: number
    sceneIndex?: number
  },
): void {
  console.log(`[VIDEO_RENDER ${label}] parsed script:`, payload.parsedScript)
  console.log(`[VIDEO_RENDER ${label}] extracted scenes:`, payload.scenes)
  if (payload.frame != null && payload.sceneIndex != null) {
    console.log(
      `[VIDEO_RENDER ${label}] frame ${payload.frame} → scene ${payload.sceneIndex}`,
    )
  }
  console.log(`[VIDEO_RENDER ${label}] video duration: ${payload.durationSeconds}s`)
  console.log(`[VIDEO_RENDER ${label}] composition props:`, payload.compositionProps)
}
