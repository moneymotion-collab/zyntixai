import { isAiMockMode } from "@/lib/ai-coach/mock-mode"
import {
  analyzePerformanceInsights,
  findBestPostingTime,
} from "@/lib/marketing/analyze-performance-insights"
import { withEngagementRate } from "@/lib/marketing/aggregate-content-performance"
import type { BrandContentInsights } from "@/lib/marketing/brand-content-insights-types"
import { parseBrandContentInsightsResponse } from "@/lib/marketing/brand-content-insights-types"
import type { AnalyticsRowWithPost } from "@/lib/marketing/fetch-analytics-rows"

const SYSTEM_PROMPT =
  "You are a senior marketing data analyst. Output ONLY JSON."

const INSIGHTS_SCHEMA = `{
  "top_patterns": [
    "..."
  ],
  "best_hooks": [
    "..."
  ],
  "best_content_types": [
    "..."
  ],
  "best_posting_times": [
    "..."
  ],
  "what_to_do_next": [
    "..."
  ]
}`

export type BrandInsightsPostPayload = {
  title: string
  caption: string
  category: string
  content_type: string
  hooks: string
  platform: string
  scheduled_at: string | null
  published_at: string | null
  views: number
  likes: number
  comments: number
  shares: number
  saves: number
  engagement_rate: number
}

export function buildBrandInsightsPayload(
  rows: AnalyticsRowWithPost[],
): BrandInsightsPostPayload[] {
  return rows
    .map(withEngagementRate)
    .filter((row) => row.views > 0)
    .map((row) => ({
      title: row.content_posts?.title?.trim() || row.title,
      caption: row.content_posts?.caption?.trim() ?? "",
      category: row.content_posts?.category?.trim() ?? "",
      content_type: row.content_posts?.content_type?.trim() ?? "",
      hooks: row.content_posts?.topic?.trim() ?? "",
      platform: row.platform,
      scheduled_at: row.content_posts?.scheduled_at ?? null,
      published_at: row.content_posts?.published_at ?? null,
      views: row.views,
      likes: row.likes,
      comments: row.comments,
      shares: row.shares,
      saves: row.saves,
      engagement_rate: row.engagement_rate,
    }))
}

export function buildRulesBrandContentInsights(
  rows: AnalyticsRowWithPost[],
): BrandContentInsights {
  const rules = analyzePerformanceInsights(rows)
  const rated = rows.map(withEngagementRate).filter((row) => row.views > 0)
  const topPosts = [...rated]
    .sort((a, b) => b.engagement_rate - a.engagement_rate)
    .slice(0, 3)

  const bestTime = findBestPostingTime(rows)

  return {
    top_patterns: [
      rules.insights.summary,
      ...rules.insights.recommendations.slice(0, 2),
    ].filter(Boolean),
    best_hooks: topPosts
      .map((row) => row.content_posts?.topic?.trim() || row.content_posts?.title?.trim() || "")
      .filter(Boolean),
    best_content_types: rules.insights.best_content_type
      ? [rules.insights.best_content_type]
      : [],
    best_posting_times:
      bestTime !== "Not enough data" ? [bestTime] : [],
    what_to_do_next: rules.insights.recommendations,
  }
}

function buildAnalysisPrompt(posts: BrandInsightsPostPayload[]): string {
  return `Analyze these posts and find patterns that lead to high engagement.

DATA:
${JSON.stringify(posts)}

Return ONLY JSON:
${INSIGHTS_SCHEMA}`
}

export async function generateBrandContentInsights(
  rows: AnalyticsRowWithPost[],
): Promise<
  | { ok: true; insights: BrandContentInsights; source: "ai" | "rules" }
  | { ok: false; error: string; fallback?: BrandContentInsights }
> {
  const posts = buildBrandInsightsPayload(rows)
  const rulesFallback = buildRulesBrandContentInsights(rows)

  if (posts.length === 0) {
    return { ok: false, error: "No data", fallback: rulesFallback }
  }

  if (isAiMockMode()) {
    return { ok: true, insights: rulesFallback, source: "rules" }
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
        { role: "user", content: buildAnalysisPrompt(posts) },
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

  const insights = parseBrandContentInsightsResponse(content)
  if (!insights) {
    return {
      ok: false,
      error: "AI response was not valid JSON.",
      fallback: rulesFallback,
    }
  }

  return { ok: true, insights, source: "ai" }
}
