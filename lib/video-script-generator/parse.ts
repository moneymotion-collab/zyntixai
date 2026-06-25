import type {
  VideoScriptGeneratorOutput,
  VideoScriptGeneratorScene,
} from "@/lib/video-script-generator/types"

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function clampDuration(value: unknown, index?: number): number {
  const num = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(num) || num <= 0) return index === 0 ? 2 : 4
  return Math.min(6, Math.max(2, Math.round(num)))
}

function parseScene(raw: unknown, index: number): VideoScriptGeneratorScene | null {
  if (!raw || typeof raw !== "object") return null

  const record = raw as Record<string, unknown>
  const text = readString(record.text)
  const visual = readString(record.visual)

  if (!text && !visual) return null

  return {
    text: text || `Scene ${index + 1}`,
    visual: visual || text || `Visual for scene ${index + 1}`,
    duration: clampDuration(record.duration, index),
  }
}

function parseCaptions(value: unknown, scenes: VideoScriptGeneratorScene[]): string[] {
  if (Array.isArray(value)) {
    const captions = value
      .map((item) => readString(item))
      .filter(Boolean)

    if (captions.length > 0) {
      while (captions.length < scenes.length) {
        const index = captions.length
        captions.push(scenes[index]?.text || "")
      }
      return captions.slice(0, scenes.length)
    }
  }

  if (typeof value === "string" && value.trim()) {
    const lines = value
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)

    if (lines.length > 0) {
      while (lines.length < scenes.length) {
        const index = lines.length
        lines.push(scenes[index]?.text || "")
      }
      return lines.slice(0, scenes.length)
    }
  }

  return scenes.map((scene) => scene.text)
}

export type ParseVideoScriptGeneratorResult =
  | { ok: true; script: Omit<VideoScriptGeneratorOutput, "subtitles"> }
  | { ok: false; reason: string }

export function parseVideoScriptGeneratorResponse(
  raw: unknown,
): ParseVideoScriptGeneratorResult {
  if (!raw || typeof raw !== "object") {
    return { ok: false, reason: "Response is not a JSON object." }
  }

  const record = raw as Record<string, unknown>
  const title = readString(record.title)
  const hook = readString(record.hook)
  const voiceover = readString(record.voiceover)
  const CTA = readString(record.CTA) || readString(record.cta)

  const rawScenes = Array.isArray(record.scenes) ? record.scenes : []
  const scenes = rawScenes
    .map((scene, index) => parseScene(scene, index))
    .filter((scene): scene is VideoScriptGeneratorScene => scene !== null)

  if (!title) {
    return { ok: false, reason: "Missing title." }
  }

  if (!hook) {
    return { ok: false, reason: "Missing hook." }
  }

  if (scenes.length === 0) {
    return { ok: false, reason: "At least one scene is required." }
  }

  if (!voiceover) {
    return { ok: false, reason: "Missing voiceover." }
  }

  if (!CTA) {
    return { ok: false, reason: "Missing CTA." }
  }

  const captions = parseCaptions(record.captions, scenes)

  return {
    ok: true,
    script: {
      title,
      hook,
      scenes,
      voiceover,
      captions,
      CTA,
    },
  }
}

export function parseVideoScriptGeneratorFromText(
  text: string,
): ParseVideoScriptGeneratorResult {
  const trimmed = text.trim()

  try {
    return parseVideoScriptGeneratorResponse(JSON.parse(trimmed))
  } catch {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { ok: false, reason: "No JSON object found in response." }
    }

    try {
      return parseVideoScriptGeneratorResponse(JSON.parse(jsonMatch[0]))
    } catch {
      return { ok: false, reason: "Could not parse JSON from response." }
    }
  }
}
