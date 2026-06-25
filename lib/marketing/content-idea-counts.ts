export const CONTENT_IDEA_COUNTS = [5, 10, 20, 30] as const

export type ContentIdeaCount = (typeof CONTENT_IDEA_COUNTS)[number]

export const DEFAULT_CONTENT_IDEA_COUNT: ContentIdeaCount = 10

export function isContentIdeaCount(value: number): value is ContentIdeaCount {
  return CONTENT_IDEA_COUNTS.includes(value as ContentIdeaCount)
}

export function parseContentIdeaCount(value: unknown): ContentIdeaCount {
  if (typeof value === "number" && isContentIdeaCount(value)) {
    return value
  }

  return DEFAULT_CONTENT_IDEA_COUNT
}
