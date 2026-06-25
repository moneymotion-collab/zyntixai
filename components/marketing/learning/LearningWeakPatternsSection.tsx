import type { LearningProfileView } from "@/lib/marketing/learning/fetch-learning-run-client"
import {
  categoryBadgeClass,
  formatCategoryLabel,
} from "@/components/marketing/learning/learning-ui-utils"
import { AlertTriangle } from "lucide-react"

export default function LearningWeakPatternsSection({
  profile,
}: {
  profile: LearningProfileView
}) {
  const weakPatterns = profile.repeated_weak_patterns
  const weakPosts = profile.worst_performing_posts

  if (weakPatterns.length === 0 && weakPosts.length === 0) {
    return (
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-1 bg-gradient-to-r from-slate-300 to-slate-400" />
        <div className="p-5 sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">Weak patterns</h2>
          <p className="mt-2 text-sm text-slate-500">
            No repeated underperforming patterns detected. Keep publishing to refine
            this view.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-red-200/60 bg-white shadow-sm">
      <div className="h-1 bg-gradient-to-r from-red-400 via-rose-500 to-orange-400" />
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <h2 className="text-xl font-bold text-slate-950">Weak patterns</h2>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Repeated formats or hooks that consistently underperform
        </p>

        {weakPatterns.length > 0 ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {weakPatterns.map((pattern) => (
              <article
                key={`${pattern.category}-${pattern.pattern}`}
                className="rounded-xl border border-red-100 bg-red-50/50 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${categoryBadgeClass(pattern.category)}`}
                  >
                    {formatCategoryLabel(pattern.category)}
                  </span>
                  <span className="rounded-full border border-red-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-red-700">
                    {pattern.occurrences}× repeated
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-900">
                  {pattern.pattern}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {pattern.avgEngagementRate}% average engagement
                </p>
              </article>
            ))}
          </div>
        ) : null}

        {weakPosts.length > 0 ? (
          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Lowest performers
            </p>
            <ul className="mt-3 space-y-2">
              {weakPosts.map((post) => (
                <li
                  key={`weak-${post.postId ?? post.title}`}
                  className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-sm font-medium text-slate-900">{post.title}</span>
                  <span className="text-xs font-semibold text-red-600">
                    {post.engagementRate}% · {post.platform}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  )
}
