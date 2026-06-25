export type AutopilotInsights = {
  best_content_type: string
  worst_content_type: string
  best_posting_time: string
  summary: string
}

export type AutopilotNextStrategy = {
  focus: string
  content_changes: string[]
  posting_adjustments: string[]
  new_ideas: string[]
}

export type AutopilotStrategy = {
  insights: AutopilotInsights
  next_strategy: AutopilotNextStrategy
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (item): item is string => typeof item === "string" && item.trim() !== "",
  )
}

function parseString(value: unknown): string {
  return typeof value === "string" ? value : ""
}

export function parseAutopilotStrategyResponse(
  raw: string,
): AutopilotStrategy | null {
  const trimmed = raw.trim()

  try {
    return normalizeAutopilotStrategy(JSON.parse(trimmed))
  } catch {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    try {
      return normalizeAutopilotStrategy(JSON.parse(jsonMatch[0]))
    } catch {
      return null
    }
  }
}

function normalizeAutopilotStrategy(value: unknown): AutopilotStrategy | null {
  if (typeof value !== "object" || value === null) return null

  const record = value as Record<string, unknown>
  const insightsRaw =
    typeof record.insights === "object" && record.insights !== null
      ? (record.insights as Record<string, unknown>)
      : {}
  const strategyRaw =
    typeof record.next_strategy === "object" && record.next_strategy !== null
      ? (record.next_strategy as Record<string, unknown>)
      : {}

  return {
    insights: {
      best_content_type: parseString(insightsRaw.best_content_type),
      worst_content_type: parseString(insightsRaw.worst_content_type),
      best_posting_time: parseString(
        insightsRaw.best_posting_time ?? insightsRaw.best_time,
      ),
      summary: parseString(insightsRaw.summary),
    },
    next_strategy: {
      focus: parseString(strategyRaw.focus),
      content_changes: parseStringArray(strategyRaw.content_changes),
      posting_adjustments: parseStringArray(strategyRaw.posting_adjustments),
      new_ideas: parseStringArray(strategyRaw.new_ideas),
    },
  }
}

export function buildMockAutopilotStrategy(): AutopilotStrategy {
  return {
    insights: {
      best_content_type: "Educational carousel",
      worst_content_type: "Generic promotional post",
      best_posting_time: "Tuesday and Thursday at 18:00",
      summary:
        "Educational content drives the highest saves and shares. Promotional posts underperform without a strong hook.",
    },
    next_strategy: {
      focus: "Double down on educational carousels with actionable tips.",
      content_changes: [
        "Lead with a problem-solution hook in the first slide.",
        "Reduce hard-sell captions; use soft CTAs instead.",
      ],
      posting_adjustments: [
        "Post educational content on Tue/Thu evenings.",
        "Avoid weekend promotional posts until engagement improves.",
      ],
      new_ideas: [
        "Before/after transformation thread with client stories.",
        "Myth-busting reel series in your niche.",
      ],
    },
  }
}
