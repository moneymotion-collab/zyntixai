export type PerformanceInsights = {
  best_content_type: string
  worst_content_type: string
  best_time: string
  summary: string
  recommendations: string[]
  best_hooks: string[]
  content_type_lift_pct: number | null
}

export type PerformanceInsightsPayload = {
  insights: PerformanceInsights
}

export function parsePerformanceInsightsResponse(
  raw: string,
): PerformanceInsightsPayload | null {
  const trimmed = raw.trim()

  try {
    return normalizePerformanceInsights(JSON.parse(trimmed))
  } catch {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    try {
      return normalizePerformanceInsights(JSON.parse(jsonMatch[0]))
    } catch {
      return null
    }
  }
}

function normalizePerformanceInsights(
  value: unknown,
): PerformanceInsightsPayload | null {
  if (typeof value !== "object" || value === null) return null

  const record = value as Record<string, unknown>
  const insightsRaw =
    typeof record.insights === "object" && record.insights !== null
      ? (record.insights as Record<string, unknown>)
      : record

  const recommendations = Array.isArray(insightsRaw.recommendations)
    ? insightsRaw.recommendations.filter(
        (item): item is string => typeof item === "string" && item.trim() !== "",
      )
    : []

  const bestHooks = Array.isArray(insightsRaw.best_hooks)
    ? insightsRaw.best_hooks.filter(
        (item): item is string => typeof item === "string" && item.trim() !== "",
      )
    : []

  const liftRaw = insightsRaw.content_type_lift_pct
  const contentTypeLiftPct =
    typeof liftRaw === "number" && Number.isFinite(liftRaw) ? liftRaw : null

  return {
    insights: {
      best_content_type:
        typeof insightsRaw.best_content_type === "string"
          ? insightsRaw.best_content_type
          : "",
      worst_content_type:
        typeof insightsRaw.worst_content_type === "string"
          ? insightsRaw.worst_content_type
          : "",
      best_time:
        typeof insightsRaw.best_time === "string" ? insightsRaw.best_time : "",
      summary:
        typeof insightsRaw.summary === "string" ? insightsRaw.summary : "",
      recommendations,
      best_hooks: bestHooks,
      content_type_lift_pct: contentTypeLiftPct,
    },
  }
}
