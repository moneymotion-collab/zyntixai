import {
  isHighEngagement,
  isLowEngagement,
} from "@/lib/marketing/aggregate-content-performance"
import type { AnalyticsRowWithPost } from "@/lib/marketing/fetch-analytics-rows"
import {
  educationalOutperformsPromotional,
  educationalSharedMoreOften,
  suggestsEveningPostingWindow,
} from "@/lib/marketing/content-performance-insights"
import {
  type MarketingAnalytics,
} from "@/lib/marketing/mock-analytics"
import { isTikTokPublishingAvailable } from "@/lib/marketing/platform-availability"
import {
  buildRecommendationDataSnapshot,
  logRecommendationDataMetrics,
} from "@/lib/marketing/recommendations/recommendation-data-thresholds"

export type RecommendationTone = "positive" | "warning" | "info"

export type MarketingRecommendation = {
  id: string
  message: string
  tone: RecommendationTone
}

export type RecommendationEngineData = {
  analytics: MarketingAnalytics
  rows?: AnalyticsRowWithPost[]
}

const TONE_STYLES: Record<RecommendationTone, string> = {
  positive: "border-green-200 bg-green-50 text-green-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-cyan-200 bg-cyan-50 text-cyan-800",
}

export function getRecommendationToneClass(tone: RecommendationTone): string {
  return TONE_STYLES[tone]
}

export function generateRecommendations(
  data: RecommendationEngineData,
): MarketingRecommendation[] {
  const { analytics, rows = [] } = data
  const snapshot = buildRecommendationDataSnapshot(rows)
  logRecommendationDataMetrics("recommendation-engine", snapshot)

  if (!snapshot.hasEnoughData) {
    return [
      {
        id: "no-performance-data",
        message:
          "Not enough performance data yet — publish content and sync analytics to get recommendations.",
        tone: "info",
      },
    ]
  }

  const recommendations: MarketingRecommendation[] = []

  if (snapshot.bestPost) {
    recommendations.push({
      id: "best-post",
      message: `Your top post is "${snapshot.bestPost.title}" at ${snapshot.bestPost.engagementRate}% engagement.`,
      tone: "positive",
    })
  }

  if (snapshot.tier === "compare" || snapshot.tier === "full") {
    if (
      snapshot.worstPost &&
      snapshot.bestPost &&
      snapshot.worstPost.title !== snapshot.bestPost.title
    ) {
      recommendations.push({
        id: "best-vs-worst",
        message: `"${snapshot.bestPost.title}" (${snapshot.bestPost.engagementRate}%) outperformed "${snapshot.worstPost.title}" (${snapshot.worstPost.engagementRate}%) — reuse the winning hook style.`,
        tone: "info",
      })
    }
  }

  if (snapshot.tier !== "full") {
    return recommendations
  }

  if (isHighEngagement(analytics.avgEngagement)) {
    recommendations.push({
      id: "high-engagement",
      message:
        "Your content is performing above average. Keep posting consistently.",
      tone: "positive",
    })
  } else if (isLowEngagement(analytics.avgEngagement)) {
    recommendations.push({
      id: "low-engagement",
      message:
        "Engagement is below target. Increase educational and transformation content.",
      tone: "warning",
    })
  }

  if (analytics.bestPlatform === "TikTok" && isTikTokPublishingAvailable()) {
    recommendations.push({
      id: "platform-tiktok",
      message: "📈 TikTok currently has the highest engagement.",
      tone: "info",
    })
  } else if (analytics.bestPlatform === "TikTok") {
    recommendations.push({
      id: "platform-reels",
      message: "📈 Instagram Reels currently has the highest engagement.",
      tone: "info",
    })
  } else if (analytics.bestPlatform) {
    recommendations.push({
      id: "platform-best",
      message: `📈 ${analytics.bestPlatform} currently has the highest engagement.`,
      tone: "info",
    })
  }

  if (analytics.highestReachPlatform === "Instagram") {
    recommendations.push({
      id: "reach-instagram",
      message: "Instagram generates the highest reach.",
      tone: "info",
    })
  } else if (analytics.highestReachPlatform) {
    recommendations.push({
      id: "reach-best",
      message: `${analytics.highestReachPlatform} generates the highest reach.`,
      tone: "info",
    })
  }

  if (educationalOutperformsPromotional(rows)) {
    recommendations.push({
      id: "educational-wins",
      message: "📈 Educational content is outperforming promotional content.",
      tone: "positive",
    })
  }

  if (educationalSharedMoreOften(rows)) {
    recommendations.push({
      id: "educational-shares",
      message: "Educational content appears to be shared more often.",
      tone: "info",
    })
  }

  if (suggestsEveningPostingWindow(rows)) {
    recommendations.push({
      id: "evening-window",
      message: "📈 Consider posting between 18:00 and 20:00.",
      tone: "info",
    })
  }

  return recommendations
}
