import { isAiMockMode } from "@/lib/ai-coach/mock-mode"
import { analyzePerformanceInsights } from "@/lib/marketing/analyze-performance-insights"
import { aggregateContentPerformance } from "@/lib/marketing/aggregate-content-performance"
import type { AnalyticsRowWithPost } from "@/lib/marketing/fetch-analytics-rows"
import {
  parsePerformanceInsightsResponse,
  type PerformanceInsightsPayload,
} from "@/lib/marketing/performance-insights-types"

const SYSTEM_PROMPT =
  "You are a data-driven marketing analyst. Output ONLY JSON."

const INSIGHTS_SCHEMA = `{
  "best_content_type": "",
  "worst_content_type": "",
  "best_time": "",
  "summary": "",
  "recommendations": [],
  "best_hooks": ["..."],
  "content_type_lift_pct": 0
}`

function buildAnalysisPrompt(analytics: unknown): string {
  return `Analyze this data:
${JSON.stringify(analytics)}

Find best performing content type, worst performing content type, best posting times, engagement patterns, and improvement suggestions.

Return JSON:
${INSIGHTS_SCHEMA}`
}

function extractInsights(
  parsed: PerformanceInsightsPayload | null,
): PerformanceInsightsPayload["insights"] | null {
  if (!parsed) return null
  return parsed.insights
}

function isAnalyticsRowArray(value: unknown): value is AnalyticsRowWithPost[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === "object" &&
    value[0] !== null &&
    "views" in value[0]
  )
}

export async function analyzeAnalyticsWithOpenAi(
  analytics: unknown,
): Promise<
  | { ok: true; insights: PerformanceInsightsPayload["insights"] }
  | {
      ok: false
      error: string
      fallback?: PerformanceInsightsPayload["insights"]
    }
> {
  const rulesFallback = isAnalyticsRowArray(analytics)
    ? analyzePerformanceInsights(analytics).insights
    : undefined

  if (analytics === undefined || analytics === null) {
    return { ok: false, error: "analytics is required." }
  }

  if (isAiMockMode()) {
    if (rulesFallback) {
      return { ok: true, insights: rulesFallback }
    }
    return { ok: false, error: "AI mock mode requires analytics rows." }
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) {
    return {
      ok: false,
      error: "OPENAI_API_KEY is not configured.",
      fallback: rulesFallback,
    }
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildAnalysisPrompt(analytics) },
      ],
      temperature: 0.4,
    }),
  })

  const data = (await response.json()) as {
    error?: { message?: string }
    choices?: Array<{ message?: { content?: string } }>
  }

  if (!response.ok) {
    return {
      ok: false,
      error: data.error?.message ?? "OpenAI request failed.",
      fallback: rulesFallback,
    }
  }

  const content = data.choices?.[0]?.message?.content?.trim()
  if (!content) {
    return {
      ok: false,
      error: "OpenAI returned an empty response.",
      fallback: rulesFallback,
    }
  }

  try {
    const parsed = JSON.parse(content) as unknown
    const normalized = parsePerformanceInsightsResponse(
      JSON.stringify(
        typeof parsed === "object" &&
          parsed !== null &&
          "insights" in parsed
          ? parsed
          : { insights: parsed },
      ),
    )
    const insights = extractInsights(normalized)

    if (!insights) {
      return {
        ok: false,
        error: "Could not parse AI insights response.",
        fallback: rulesFallback,
      }
    }

    return { ok: true, insights }
  } catch {
    return {
      ok: false,
      error: "AI response was not valid JSON.",
      fallback: rulesFallback,
    }
  }
}

export async function generatePerformanceInsights(
  rows: AnalyticsRowWithPost[],
): Promise<
  | { ok: true; result: PerformanceInsightsPayload; source: "ai" | "rules" }
  | { ok: false; error: string; fallback?: PerformanceInsightsPayload }
> {
  const rulesFallback = analyzePerformanceInsights(rows)

  if (rows.length === 0) {
    return {
      ok: true,
      result: {
        insights: {
          best_content_type: "",
          worst_content_type: "",
          best_time: "Not enough data",
          summary:
            "No analytics data available yet. Publish content to start tracking performance.",
          recommendations: [
            "Publish at least 3–5 posts across different content types to establish a baseline.",
          ],
          best_hooks: [],
          content_type_lift_pct: null,
        },
      },
      source: "rules",
    }
  }

  const analyticsPayload = {
    totals: aggregateContentPerformance(rows),
    posts: rows,
  }

  const result = await analyzeAnalyticsWithOpenAi(analyticsPayload)

  if (!result.ok) {
    return {
      ok: false,
      error: result.error,
      fallback: result.fallback
        ? { insights: result.fallback }
        : rulesFallback,
    }
  }

  return {
    ok: true,
    result: { insights: result.insights },
    source: isAiMockMode() ? "rules" : "ai",
  }
}
