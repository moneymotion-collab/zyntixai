export type BrandContentInsights = {
  top_patterns: string[]
  best_hooks: string[]
  best_content_types: string[]
  best_posting_times: string[]
  what_to_do_next: string[]
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  return value.filter(
    (item): item is string => typeof item === "string" && item.trim() !== "",
  )
}

export function parseBrandContentInsightsResponse(
  raw: string,
): BrandContentInsights | null {
  const trimmed = raw.trim()

  try {
    return normalizeBrandContentInsights(JSON.parse(trimmed))
  } catch {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    try {
      return normalizeBrandContentInsights(JSON.parse(jsonMatch[0]))
    } catch {
      return null
    }
  }
}

export function parseBrandContentInsights(
  value: unknown,
): BrandContentInsights | null {
  return normalizeBrandContentInsights(value)
}

function normalizeBrandContentInsights(value: unknown): BrandContentInsights | null {
  if (typeof value !== "object" || value === null) return null

  const record = value as Record<string, unknown>

  return {
    top_patterns: normalizeStringArray(record.top_patterns),
    best_hooks: normalizeStringArray(record.best_hooks),
    best_content_types: normalizeStringArray(record.best_content_types),
    best_posting_times: normalizeStringArray(record.best_posting_times),
    what_to_do_next: normalizeStringArray(record.what_to_do_next),
  }
}
