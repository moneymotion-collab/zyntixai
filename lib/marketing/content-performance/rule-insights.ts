import type {
  ContentPerformanceRow,
  RuleBasedInsight,
} from "@/lib/marketing/content-performance/types"
import { buildContentPerformanceKpis } from "@/lib/marketing/content-performance/analytics-engine"

export function buildRuleBasedInsights(
  rows: ContentPerformanceRow[],
): RuleBasedInsight[] {
  if (rows.length === 0) return []

  const { averageEngagementRate } = buildContentPerformanceKpis(rows)
  const insights: RuleBasedInsight[] = []

  if (averageEngagementRate > 7) {
    insights.push({
      id: "engagement-strong",
      title: "Strong performance",
      message:
        "Your content is performing strongly. Create more posts with this style.",
      tone: "success",
    })
  } else if (averageEngagementRate >= 3) {
    insights.push({
      id: "engagement-baseline",
      title: "Good baseline",
      message: "Good baseline. Improve hooks and CTAs.",
      tone: "warning",
    })
  } else {
    insights.push({
      id: "engagement-low",
      title: "Needs improvement",
      message:
        "Content needs stronger hooks, clearer value and better visual structure.",
      tone: "danger",
    })
  }

  const platforms = new Set(
    rows.map((row) => row.platform.trim()).filter(Boolean),
  )
  if (platforms.size > 1) {
    insights.push({
      id: "multi-platform",
      title: "Platform mix",
      message: `You are tracking ${platforms.size} platforms. Double down on the one with the highest engagement rate.`,
      tone: "warning",
    })
  }

  const withViews = rows.filter((row) => row.views > 0)
  if (withViews.length > 0) {
    const saveRate =
      withViews.reduce((sum, row) => sum + (row.saves ?? 0), 0) /
      withViews.reduce((sum, row) => sum + row.views, 0)

    if (saveRate > 0.02) {
      insights.push({
        id: "saves-strong",
        title: "Save-worthy content",
        message:
          "Your audience is saving posts — lean into educational and checklist-style content.",
        tone: "success",
      })
    }
  }

  return insights
}
