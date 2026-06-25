import type { Exercise } from "@/lib/exercise-library"
import { sanitizeDisplayText } from "@/lib/exercise-display"

export type FormStep = {
  step: number
  instruction: string
}

export type CommonMistake = {
  title: string
  description: string
}

export type CoachTip = {
  tip: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function parseFormSteps(value: unknown): FormStep[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item, index) => {
      if (!isRecord(item)) return null
      const instruction =
        typeof item.instruction === "string"
          ? item.instruction
          : typeof item.text === "string"
            ? item.text
            : ""
      if (!instruction.trim()) return null
      const step =
        typeof item.step === "number" && item.step > 0 ? item.step : index + 1
      return { step, instruction: instruction.trim() }
    })
    .filter((item): item is FormStep => item !== null)
    .sort((a, b) => a.step - b.step)
}

export function parseCommonMistakes(value: unknown): CommonMistake[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      if (!isRecord(item)) return null
      const title = typeof item.title === "string" ? item.title.trim() : ""
      const description =
        typeof item.description === "string" ? item.description.trim() : ""
      if (!title && !description) return null
      return { title: title || "Mistake", description }
    })
    .filter((item): item is CommonMistake => item !== null)
}

export function parseCoachTips(value: unknown): CoachTip[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      if (typeof item === "string" && item.trim()) {
        return { tip: item.trim() }
      }
      if (!isRecord(item)) return null
      const tip = typeof item.tip === "string" ? item.tip.trim() : ""
      if (!tip) return null
      return { tip }
    })
    .filter((item): item is CoachTip => item !== null)
}

function isValidImageUrl(url: string): boolean {
  const cleaned = sanitizeDisplayText(url)
  if (!cleaned) return false
  return (
    cleaned.startsWith("http://") ||
    cleaned.startsWith("https://") ||
    cleaned.startsWith("/")
  )
}

export function getExerciseImageUrls(
  exercise: Pick<Exercise, "image_url" | "image_urls">,
): string[] {
  const fromArray = (exercise.image_urls ?? []).filter(
    (url): url is string => typeof url === "string" && isValidImageUrl(url),
  )
  if (fromArray.length > 0) return fromArray
  if (isValidImageUrl(exercise.image_url ?? "")) {
    return [sanitizeDisplayText(exercise.image_url)!]
  }
  return []
}

export function getInstructionSteps(
  exercise: Exercise,
  formSteps: FormStep[] = parseFormSteps(exercise.form_steps),
): FormStep[] {
  if (formSteps.length > 0) return formSteps

  const text = sanitizeDisplayText(exercise.instructions)
  if (!text) return []

  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
  if (lines.length > 1) {
    return lines.map((instruction, index) => ({
      step: index + 1,
      instruction,
    }))
  }

  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean)
  if (sentences.length > 1) {
    return sentences.map((instruction, index) => ({
      step: index + 1,
      instruction,
    }))
  }

  return [{ step: 1, instruction: text }]
}

export function exerciseDetailFields(exercise: Exercise) {
  const formSteps = parseFormSteps(exercise.form_steps)
  const commonMistakes = parseCommonMistakes(exercise.common_mistakes)
  const coachTips = parseCoachTips(exercise.coach_tips)
  const legacyCoachNote =
    coachTips.length === 0 && sanitizeDisplayText(exercise.tips)
      ? sanitizeDisplayText(exercise.tips)
      : null

  return {
    formSteps,
    commonMistakes,
    coachTips,
    legacyCoachNote,
    imageUrls: getExerciseImageUrls(exercise),
  }
}
