import { BarChart3, Brain, Sparkles } from "lucide-react"
import type { RecommendationReadiness } from "@/lib/marketing/recommendations/recommendation-readiness"

const STATE_STYLES = {
  not_enough_data: {
    badge: "border-slate-200 bg-slate-100 text-slate-700",
    icon: BarChart3,
    title: "Not enough data yet",
  },
  learning: {
    badge: "border-amber-200 bg-amber-50 text-amber-800",
    icon: Brain,
    title: "Learning from your posts",
  },
  ready: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: Sparkles,
    title: "Recommendations ready",
  },
} as const

export default function RecommendationsReadinessBanner({
  readiness,
}: {
  readiness: RecommendationReadiness
}) {
  const config = STATE_STYLES[readiness.state]
  const Icon = config.icon

  return (
    <div className="mb-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${config.badge}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {config.title}
          </span>
          <p className="mt-3 text-sm text-gray-700">{readiness.message}</p>
        </div>

        <div className="w-full max-w-xs shrink-0">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
            <span>Posts tracked</span>
            <span>
              {readiness.postCount} / {readiness.minPosts}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-500"
              style={{ width: `${readiness.progressPercent}%` }}
            />
          </div>
          {readiness.totalViews > 0 ? (
            <p className="mt-2 text-xs text-gray-500">
              {readiness.totalViews.toLocaleString()} total views analyzed
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
