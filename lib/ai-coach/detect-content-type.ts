export type AiMessageContentType =
  | "general"
  | "workout"
  | "nutrition"
  | "progress"

export function detectContentType(text: string): AiMessageContentType {
  const lower = text.toLowerCase()

  const workoutSignals = [
    "workout",
    "training",
    "exercise",
    "sets",
    "reps",
    "hypertrophy",
    "deload",
    "squat",
    "bench",
    "deadlift",
    "oefening",
    "trainingsschema",
  ]
  const nutritionSignals = [
    "nutrition",
    "macro",
    "calorie",
    "kcal",
    "protein",
    "carb",
    "fat",
    "meal",
    "voeding",
    "eiwit",
    "koolhydraat",
    "vetten",
  ]
  const progressSignals = [
    "progress",
    "trend",
    "weight",
    "analyse",
    "analysis",
    "metric",
    "body fat",
    "vooruitgang",
    "gewicht",
  ]

  const score = (signals: string[]) =>
    signals.reduce((n, s) => (lower.includes(s) ? n + 1 : n), 0)

  const w = score(workoutSignals)
  const n = score(nutritionSignals)
  const p = score(progressSignals)

  if (w >= n && w >= p && w > 0) return "workout"
  if (n >= w && n >= p && n > 0) return "nutrition"
  if (p > 0) return "progress"
  return "general"
}
