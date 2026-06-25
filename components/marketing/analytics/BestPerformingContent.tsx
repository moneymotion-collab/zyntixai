import { Flame, Trophy } from "lucide-react"
import type { PerformancePostSummary } from "@/lib/marketing/analytics/build-performance-summary"
import {
  getViralScoreStyles,
  getViralScoreTier,
} from "@/lib/marketing/viral-score"

function formatCount(value: number): string {
  return value.toLocaleString()
}

function ViralScoreBadge({ score }: { score: number }) {
  const tier = getViralScoreTier(score)
  const styles = getViralScoreStyles(tier)

  return (
    <span
      className={`inline-flex min-w-[4rem] items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-base font-bold tabular-nums ${styles.badge}`}
    >
      <Flame className="h-4 w-4" />
      {score}
    </span>
  )
}

function PerformingPostRow({
  rank,
  post,
}: {
  rank: number
  post: PerformancePostSummary
}) {
  return (
    <tr className="border-b border-slate-100 last:border-b-0">
      <td className="px-5 py-5 sm:px-8">
        <div className="flex items-center gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-base font-bold text-white shadow-sm">
            {rank}
          </span>
          <p className="min-w-0 text-base font-bold leading-snug text-slate-950 sm:text-lg">
            {post.title}
          </p>
        </div>
      </td>
      <td className="hidden px-5 py-5 sm:table-cell sm:px-8">
        <span className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-1.5 text-base font-bold text-slate-800">
          {post.platform}
        </span>
      </td>
      <td className="px-5 py-5 text-right sm:px-8">
        <p className="text-lg font-bold tabular-nums text-slate-950 sm:text-xl">
          {formatCount(post.views)}
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-500 sm:hidden">
          {post.platform}
        </p>
      </td>
      <td className="px-5 py-5 text-right sm:px-8">
        <p className="text-lg font-bold tabular-nums text-slate-950 sm:text-xl">
          {formatCount(post.engagement)}
        </p>
      </td>
      <td className="px-5 py-5 text-right sm:px-8">
        <div className="flex justify-end">
          <ViralScoreBadge score={post.viralScore} />
        </div>
      </td>
    </tr>
  )
}

export default function BestPerformingContent({
  posts,
}: {
  posts: PerformancePostSummary[]
}) {
  const topPosts = posts.slice(0, 5)

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
      <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />

      <div className="p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-[1.75rem]">
              Best Performing Content
            </h2>
            <p className="mt-1 text-base font-medium text-slate-600">
              Top 5 posts by performance
            </p>
          </div>
        </div>

        {topPosts.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center text-base font-medium text-slate-500">
            Publish and track content to see your top performers here.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-left text-sm font-bold uppercase tracking-wide text-slate-600 sm:px-8">
                    Post Title
                  </th>
                  <th className="hidden px-5 py-4 text-left text-sm font-bold uppercase tracking-wide text-slate-600 sm:table-cell sm:px-8">
                    Platform
                  </th>
                  <th className="px-5 py-4 text-right text-sm font-bold uppercase tracking-wide text-slate-600 sm:px-8">
                    Views
                  </th>
                  <th className="px-5 py-4 text-right text-sm font-bold uppercase tracking-wide text-slate-600 sm:px-8">
                    Engagement
                  </th>
                  <th className="px-5 py-4 text-right text-sm font-bold uppercase tracking-wide text-slate-600 sm:px-8">
                    Viral Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {topPosts.map((post, index) => (
                  <PerformingPostRow
                    key={`${post.postId ?? post.title}-${index}`}
                    rank={index + 1}
                    post={post}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
