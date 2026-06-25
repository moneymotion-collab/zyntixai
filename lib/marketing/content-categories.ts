export const CONTENT_CATEGORIES = [
  "Transformation",
  "Nutrition",
  "Workout",
  "Motivation",
  "Member Story",
  "Promotion",
  "Educational",
] as const

export type ContentCategory = (typeof CONTENT_CATEGORIES)[number]

export function isContentCategory(value: string): value is ContentCategory {
  return CONTENT_CATEGORIES.includes(value as ContentCategory)
}

export function parseContentCategories(values: unknown): ContentCategory[] {
  if (!Array.isArray(values)) return []

  return values.filter(
    (value): value is ContentCategory =>
      typeof value === "string" && isContentCategory(value),
  )
}

const LEGACY_CONTENT_TYPE_MAP: Record<string, ContentCategory> = {
  educational: "Educational",
  promotional: "Promotion",
}

export function normalizeContentCategory(
  value: string,
): ContentCategory | null {
  if (isContentCategory(value)) return value

  return LEGACY_CONTENT_TYPE_MAP[value.trim().toLowerCase()] ?? null
}
