import { BarChart3, Eye, Heart, MessageCircle, Share2, Bookmark } from "lucide-react"
import type { RecommendationRunSummary } from "@/lib/marketing/recommendations/generate-recommendations"

function formatCount(value: number): string {
  return value.toLocaleString()
}

export default function PerformanceSummaryCard({
  summary,
}: {
  summary: RecommendationRunSummary
}) {
  const metrics = [
    { label: "Views", value: formatCount(summary.totalViews), icon: Eye },
    { label: "Likes", value: formatCount(summary.totalLikes), icon: Heart },
    {
      label: "Comments",
      value: formatCount(summary.totalComments),
      icon: MessageCircle,
    },
    { label: "Shares", value: formatCount(summary.totalShares), icon: Share2 },
    { label: "Saves", value: formatCount(summary.totalSaves), icon: Bookmark },
  ]

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">Performance Summary</h2>
          <p className="text-sm text-gray-500">
            {summary.postCount} post{summary.postCount === 1 ? "" : "s"} tracked
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div
              key={metric.label}
              className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
            >
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                <Icon className="h-3.5 w-3.5" />
                {metric.label}
              </div>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                {metric.value}
              </p>
            </div>
          )
        })}
        <div className="rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3 sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-medium uppercase tracking-wide text-cyan-700">
            Total engagement
          </p>
          <p className="mt-1 text-xl font-semibold text-cyan-900">
            {formatCount(summary.totalEngagement)}
          </p>
        </div>
        <div className="rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3 sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-medium uppercase tracking-wide text-cyan-700">
            Avg engagement rate
          </p>
          <p className="mt-1 text-xl font-semibold text-cyan-900">
            {summary.averageEngagementRate}%
          </p>
        </div>
      </div>
    </article>
  )
}
