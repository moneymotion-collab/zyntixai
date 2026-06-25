import type { PerformanceInsights } from "@/lib/marketing/performance-insights-types"
import { formatBestTimeShort } from "@/lib/marketing/analyze-performance-insights"

function formatContentTypeLine(insights: PerformanceInsights): string | null {
  if (!insights.best_content_type) return null

  if (insights.content_type_lift_pct && insights.content_type_lift_pct > 0) {
    return `${insights.best_content_type} (${insights.content_type_lift_pct}% higher engagement)`
  }

  return insights.best_content_type
}

export default function AiInsights({
  insights,
}: {
  insights: PerformanceInsights
}) {
  const bestTime = formatBestTimeShort(insights.best_time)
  const contentTypeLine = formatContentTypeLine(insights)

  const hasContent =
    insights.best_hooks.length > 0 ||
    contentTypeLine ||
    (bestTime && bestTime !== "Not enough data") ||
    insights.recommendations.length > 0

  if (!hasContent) return null

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="text-base font-semibold text-gray-900">🧠 AI INSIGHTS</h2>

      <div className="mt-4 space-y-4 text-sm text-gray-800">
        {insights.best_hooks.length > 0 ? (
          <div>
            <p className="font-medium text-gray-900">Best Hooks:</p>
            <ul className="mt-2 list-none space-y-1 pl-0">
              {insights.best_hooks.map((hook) => (
                <li key={hook} className="text-gray-700">
                  - &quot;{hook}&quot;
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {contentTypeLine ? (
          <div>
            <p className="font-medium text-gray-900">Best Content Type:</p>
            <ul className="mt-2 list-none space-y-1 pl-0">
              <li className="text-gray-700">- {contentTypeLine}</li>
            </ul>
          </div>
        ) : null}

        {bestTime && bestTime !== "Not enough data" ? (
          <div>
            <p className="font-medium text-gray-900">Best Time:</p>
            <ul className="mt-2 list-none space-y-1 pl-0">
              <li className="text-gray-700">- {bestTime}</li>
            </ul>
          </div>
        ) : null}
      </div>

      {insights.recommendations.length > 0 ? (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="text-sm font-medium text-gray-900">What to do next</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
            {insights.recommendations.map((recommendation) => (
              <li key={recommendation}>{recommendation}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
