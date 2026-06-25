import { TrendingDown, TrendingUp } from "lucide-react"
import type { PerformancePostSummary } from "@/lib/marketing/analytics/build-performance-summary"

function formatCount(value: number): string {
  return value.toLocaleString()
}

export default function PostHighlightCard({
  variant,
  post,
}: {
  variant: "best" | "worst"
  post: PerformancePostSummary | null
}) {
  const isBest = variant === "best"
  const Icon = isBest ? TrendingUp : TrendingDown
  const accent = isBest
    ? "from-emerald-500 to-teal-500"
    : "from-rose-500 to-orange-500"
  const label = isBest ? "Best Post" : "Worst Post"

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">{label}</h2>
          <p className="text-sm text-gray-500">
            {isBest ? "Highest engagement rate" : "Lowest engagement rate"}
          </p>
        </div>
      </div>

      {post ? (
        <div className="space-y-3">
          <p className="text-lg font-semibold leading-snug text-gray-900">
            {post.title}
          </p>
          {post.hook !== post.title ? (
            <p className="text-sm text-gray-500">
              Hook: <span className="text-gray-700">&quot;{post.hook}&quot;</span>
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-700">
              {post.platform}
            </span>
            {post.contentType ? (
              <span className="rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-700">
                {post.contentType}
              </span>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl bg-gray-50 px-3 py-2">
              <p className="text-xs text-gray-500">Views</p>
              <p className="font-semibold text-gray-900">
                {formatCount(post.views)}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 px-3 py-2">
              <p className="text-xs text-gray-500">Engagement</p>
              <p className="font-semibold text-gray-900">
                {formatCount(post.engagement)}
              </p>
            </div>
          </div>
          <p
            className={`text-sm font-medium ${isBest ? "text-emerald-700" : "text-rose-700"}`}
          >
            {post.engagementRate}% engagement rate
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-500">No post data available yet.</p>
      )}
    </article>
  )
}
