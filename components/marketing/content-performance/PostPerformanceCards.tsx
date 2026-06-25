import { TrendingDown, TrendingUp } from "lucide-react"
import Badge from "@/components/ui/badge"
import { formatAnalyticsCount } from "@/lib/marketing/content-performance/analytics-engine"
import type {
  ContentPerformanceWithRate,
  WorstPostAdvice,
} from "@/lib/marketing/content-performance/types"

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold tabular-nums text-slate-950">{value}</p>
    </div>
  )
}

function PostMetrics({ post }: { post: ContentPerformanceWithRate }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
      <MetricPill label="Reach" value={formatAnalyticsCount(post.reach)} />
      <MetricPill label="Views" value={formatAnalyticsCount(post.views)} />
      <MetricPill label="Likes" value={formatAnalyticsCount(post.likes)} />
      <MetricPill label="Comments" value={formatAnalyticsCount(post.comments)} />
      <MetricPill label="Shares" value={formatAnalyticsCount(post.shares)} />
      <MetricPill label="Saves" value={formatAnalyticsCount(post.saves ?? 0)} />
      <MetricPill
        label="Engagement"
        value={`${post.engagement_rate}%`}
      />
    </div>
  )
}

export function BestPerformingPostCard({
  post,
}: {
  post: ContentPerformanceWithRate
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
      <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400" />

      <div className="p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-950">Best Performing</h3>
              <p className="text-sm font-medium text-slate-500">
                Highest engagement rate
              </p>
            </div>
          </div>
          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-800">
            {post.engagement_rate}% engagement
          </span>
        </div>

        <p className="text-xl font-bold leading-snug text-slate-950">{post.title}</p>

        {post.caption?.trim() ? (
          <p className="mt-2 line-clamp-2 text-sm font-medium text-slate-600">
            {post.caption.trim()}
          </p>
        ) : null}

        <div className="mt-3">
          <Badge className="border border-slate-200 bg-white text-slate-800">
            {post.platform || "Unknown platform"}
          </Badge>
        </div>

        <div className="mt-5">
          <PostMetrics post={post} />
        </div>
      </div>
    </article>
  )
}

export function WorstPerformingPostCard({
  post,
  advice,
}: {
  post: ContentPerformanceWithRate
  advice: WorstPostAdvice
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
      <div className="h-1 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400" />

      <div className="p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-950">Needs Improvement</h3>
              <p className="text-sm font-medium text-slate-500">
                Lowest engagement rate
              </p>
            </div>
          </div>
          <span className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-sm font-bold text-rose-800">
            {post.engagement_rate}% engagement
          </span>
        </div>

        <p className="text-xl font-bold leading-snug text-slate-950">{post.title}</p>

        {post.caption?.trim() ? (
          <p className="mt-2 line-clamp-2 text-sm font-medium text-slate-600">
            {post.caption.trim()}
          </p>
        ) : null}

        <div className="mt-3">
          <Badge className="border border-slate-200 bg-white text-slate-800">
            {post.platform || "Unknown platform"}
          </Badge>
        </div>

        <div className="mt-5">
          <PostMetrics post={post} />
        </div>

        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-bold text-amber-900">{advice.headline}</p>
          <ul className="mt-3 space-y-2">
            {advice.tips.map((tip) => (
              <li
                key={tip}
                className="flex gap-2 text-sm font-medium leading-relaxed text-amber-950"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  )
}
