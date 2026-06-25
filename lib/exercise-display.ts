import type { Exercise } from "@/lib/exercise-library"

export function sanitizeDisplayText(value: string | null | undefined): string {
  if (value == null) return ""
  const trimmed = value.trim()
  if (!trimmed) return ""
  const lowered = trimmed.toLowerCase()
  if (lowered === "null" || lowered === "undefined") return ""
  return trimmed
}

export function hasExerciseVideoUrl(url: string | null | undefined): boolean {
  return sanitizeDisplayText(url).length > 0
}

export type VideoEmbed = {
  type: "iframe" | "video"
  src: string
}

function parseYoutubeVideoId(url: string): string | null {
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  )
  return youtubeMatch?.[1] ?? null
}

export function getExerciseVideoThumbnail(
  url: string | null | undefined,
): string | null {
  const cleaned = sanitizeDisplayText(url)
  if (!cleaned) return null

  const youtubeId = parseYoutubeVideoId(cleaned)
  if (youtubeId) {
    return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
  }

  return null
}

export function getExerciseVideoEmbed(
  url: string | null | undefined,
): VideoEmbed | null {
  const cleaned = sanitizeDisplayText(url)
  if (!cleaned) return null

  const youtubeId = parseYoutubeVideoId(cleaned)
  if (youtubeId) {
    return {
      type: "iframe",
      src: `https://www.youtube.com/embed/${youtubeId}`,
    }
  }

  const vimeoMatch = cleaned.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeoMatch) {
    return {
      type: "iframe",
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    }
  }

  if (/\.(mp4|webm|ogg)(\?|$)/i.test(cleaned)) {
    return { type: "video", src: cleaned }
  }

  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
    return { type: "iframe", src: cleaned }
  }

  return null
}

export function formatExerciseMeta(
  primaryMuscle: string,
  equipment: string,
  difficulty: string,
): string {
  return [
    sanitizeDisplayText(primaryMuscle),
    sanitizeDisplayText(equipment),
    sanitizeDisplayText(difficulty),
  ]
    .filter(Boolean)
    .join(" · ")
}

export function formatExercisePrescription(
  sets: number,
  reps: string,
  restSeconds: number,
): string {
  const restLabel = restSeconds === 1 ? "1s rest" : `${restSeconds}s rest`
  return `${sets} sets · ${reps} reps · ${restLabel}`
}

export function exerciseMetaFromRow(
  exercise: Pick<Exercise, "primary_muscle" | "equipment" | "difficulty">,
): string {
  return formatExerciseMeta(
    exercise.primary_muscle,
    exercise.equipment,
    exercise.difficulty,
  )
}
