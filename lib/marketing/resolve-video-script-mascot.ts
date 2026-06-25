import {
  FITCORE_COACH_MASCOT,
  getMascotDescription,
  getMascotStyle,
} from "@/lib/marketing/brand-mascot"
import type { VideoScript, VideoScriptMascot } from "@/lib/marketing/video-script-types"
import { stylesRequiringMascot } from "@/lib/marketing/video-templates/app-showcase-template"

type MascotOverrides = {
  name?: string
  description?: string
  style?: string
  voiceTone?: string
}

export function resolveVideoScriptMascot(
  style: string,
  parsed: VideoScript,
  overrides: MascotOverrides,
): VideoScriptMascot | undefined {
  if (!stylesRequiringMascot().includes(style)) {
    return undefined
  }

  return {
    name:
      overrides.name?.trim() ||
      parsed.mascot?.name ||
      FITCORE_COACH_MASCOT.name,
    description:
      overrides.description?.trim() ||
      parsed.mascot?.description ||
      getMascotDescription(),
    style:
      overrides.style?.trim() ||
      parsed.mascot?.style ||
      getMascotStyle(),
    personality:
      parsed.mascot?.personality ||
      overrides.voiceTone?.trim() ||
      FITCORE_COACH_MASCOT.voiceTone.join(", "),
  }
}

export function applyMascotToVideoScript(
  style: string,
  parsed: VideoScript,
  overrides: MascotOverrides,
): VideoScript {
  const mascot = resolveVideoScriptMascot(style, parsed, overrides)

  return {
    ...parsed,
    style,
    ...(mascot ? { mascot } : {}),
  }
}
