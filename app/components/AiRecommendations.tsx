import { Sparkles } from "lucide-react"
import type { AnalyticsRowWithPost } from "@/lib/marketing/fetch-analytics-rows"
import {
  generateMarketingRecommendations,
  getRecommendationToneClass,
} from "@/lib/marketing/generate-marketing-recommendations"
import type { MarketingAnalytics } from "@/lib/marketing/mock-analytics"

export default function AiRecommendations({
  analytics,
  rows = [],
}: {
  analytics: MarketingAnalytics
  rows?: AnalyticsRowWithPost[]
}) {
  const recommendations = generateMarketingRecommendations(analytics, rows)

  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">AI Recommendations</h2>
          <p className="text-sm text-gray-500">
            Based on your latest content performance
          </p>
        </div>
      </div>

      <ul className="space-y-3">
        {recommendations.map((item) => (
          <li
            key={item.id}
            className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed ${getRecommendationToneClass(item.tone)}`}
          >
            {item.message}
          </li>
        ))}
      </ul>
    </div>
  )
}
