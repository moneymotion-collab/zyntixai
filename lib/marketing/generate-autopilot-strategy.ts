import { isAiMockMode } from "@/lib/ai-coach/mock-mode"
import { createChatCompletion } from "@/lib/ai-coach/openai"
import {
  buildMockAutopilotStrategy,
  parseAutopilotStrategyResponse,
  type AutopilotStrategy,
} from "@/lib/marketing/autopilot-types"
import { aggregateContentPerformance } from "@/lib/marketing/aggregate-content-performance"
import type { AnalyticsRowWithPost } from "@/lib/marketing/fetch-analytics-rows"

const SYSTEM_PROMPT =
  "You are an elite marketing growth strategist. You improve content performance over time. Output ONLY JSON."

const AUTOPILOT_SCHEMA = `{
  "insights": {
    "best_content_type": "",
    "worst_content_type": "",
    "best_posting_time": "",
    "summary": ""
  },
  "next_strategy": {
    "focus": "",
    "content_changes": [],
    "posting_adjustments": [],
    "new_ideas": []
  }
}`

function buildAutopilotPrompt(analytics: unknown): string {
  return `Analyze this brand performance data:

${JSON.stringify(analytics)}

Return:

${AUTOPILOT_SCHEMA}`
}

export async function generateAutopilotStrategy(
  rows: AnalyticsRowWithPost[],
): Promise<
  | { ok: true; autopilot: AutopilotStrategy }
  | { ok: false; error: string; raw?: string }
> {
  if (rows.length === 0) {
    return { ok: false, error: "No analytics found." }
  }

  if (isAiMockMode()) {
    return { ok: true, autopilot: buildMockAutopilotStrategy() }
  }

  const analyticsPayload = {
    totals: aggregateContentPerformance(rows),
    posts: rows,
  }

  const result = await createChatCompletion([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildAutopilotPrompt(analyticsPayload) },
  ])

  if (!result.ok) {
    return { ok: false, error: result.error }
  }

  const parsed = parseAutopilotStrategyResponse(result.content)

  if (!parsed) {
    return {
      ok: false,
      error: "Invalid AI JSON",
      raw: result.content,
    }
  }

  return { ok: true, autopilot: parsed }
}
