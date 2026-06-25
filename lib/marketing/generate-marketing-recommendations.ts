export type { MarketingRecommendation } from "@/lib/marketing/recommendation-engine"
export {
  generateRecommendations,
  getRecommendationToneClass,
} from "@/lib/marketing/recommendation-engine"

import {
  generateRecommendations,
  type MarketingRecommendation,
} from "@/lib/marketing/recommendation-engine"
import type { AnalyticsRowWithPost } from "@/lib/marketing/fetch-analytics-rows"
import type { MarketingAnalytics } from "@/lib/marketing/mock-analytics"

export function generateMarketingRecommendations(
  analytics: MarketingAnalytics,
  rows: AnalyticsRowWithPost[] = [],
): MarketingRecommendation[] {
  return generateRecommendations({ analytics, rows })
}
