import { Brain, Lightbulb, Sparkles } from "lucide-react"
import { formatBestTimeShort } from "@/lib/marketing/analyze-performance-insights"
import type { PerformanceInsights } from "@/lib/marketing/performance-insights-types"

function formatContentTypeLine(insights: PerformanceInsights): string | null {
  if (!insights.best_content_type) return null

  if (insights.content_type_lift_pct && insights.content_type_lift_pct > 0) {
    return `${insights.best_content_type} (${insights.content_type_lift_pct}% higher engagement)`
  }

  return insights.best_content_type
}

export default function MarketingDashboardInsights({
  hooks,
  contentTypes,
  insights,
}: {
  hooks: string[]
  contentTypes: string[]
  insights?: PerformanceInsights
}) {
  const bestTime = insights ? formatBestTimeShort(insights.best_time) : null
  const contentTypeLine = insights ? formatContentTypeLine(insights) : null
  const hasRecommendations = (insights?.recommendations.length ?? 0) > 0
  const hasSummary = Boolean(insights?.summary?.trim())
  const hasBestTime = Boolean(bestTime && bestTime !== "Not enough data")

  const isEmpty =
    hooks.length === 0 &&
    contentTypes.length === 0 &&
    !hasRecommendations &&
    !hasSummary &&
    !hasBestTime

  if (isEmpty) {
    return (
      <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white to-violet-50/40 shadow-sm">
        <div className="border-b border-violet-100/80 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-sm">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                AI Insights
              </h2>
              <p className="text-sm text-gray-500">
                Performance patterns from your content
              </p>
            </div>
          </div>
        </div>
        <div className="px-5 py-8">
          <div className="flex items-start gap-3 rounded-xl border border-dashed border-violet-200 bg-white/80 p-4">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-violet-500" />
            <p className="text-sm text-gray-600">
              Publish a few posts to unlock hook, timing, and content-type
              insights powered by your analytics.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white to-violet-50/40 shadow-sm">
      <div className="border-b border-violet-100/80 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-sm">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">AI Insights</h2>
            <p className="text-sm text-gray-500">
              What is working across your content
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 px-5 py-5">
        {hasSummary ? (
          <p className="rounded-xl border border-violet-100 bg-white/90 px-4 py-3 text-sm leading-relaxed text-gray-700">
            {insights!.summary}
          </p>
        ) : null}

        {hooks.length > 0 ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Top hooks
            </p>
            <ul className="mt-3 space-y-2">
              {hooks.map((hook) => (
                <li
                  key={hook}
                  className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-800"
                >
                  &ldquo;{hook}&rdquo;
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {contentTypes.length > 0 || contentTypeLine ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Best content types
            </p>
            <ul className="mt-3 space-y-2">
              {(contentTypeLine ? [contentTypeLine, ...contentTypes] : contentTypes)
                .filter((value, index, array) => array.indexOf(value) === index)
                .map((type) => (
                  <li
                    key={type}
                    className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-800"
                  >
                    <Lightbulb className="h-4 w-4 shrink-0 text-amber-500" />
                    {type}
                  </li>
                ))}
            </ul>
          </div>
        ) : null}

        {hasBestTime ? (
          <div className="rounded-xl border border-cyan-100 bg-cyan-50/60 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
              Best time to post
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900">{bestTime}</p>
          </div>
        ) : null}

        {hasRecommendations ? (
          <div className="border-t border-violet-100/80 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Recommendations
            </p>
            <ul className="mt-3 space-y-2">
              {insights!.recommendations.map((recommendation) => (
                <li
                  key={recommendation}
                  className="flex gap-2 text-sm text-gray-700"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  )
}
