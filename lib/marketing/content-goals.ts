export const CONTENT_GOALS = [
  "Get More Members",
  "Increase Engagement",
  "Promote Personal Training",
  "Build Brand Awareness",
  "Retention",
] as const

export type ContentGoal = (typeof CONTENT_GOALS)[number]

export function isContentGoal(value: string): value is ContentGoal {
  return CONTENT_GOALS.includes(value as ContentGoal)
}

export function parseContentGoals(values: unknown): ContentGoal[] {
  if (!Array.isArray(values)) return []

  return values.filter(
    (value): value is ContentGoal =>
      typeof value === "string" && isContentGoal(value),
  )
}
