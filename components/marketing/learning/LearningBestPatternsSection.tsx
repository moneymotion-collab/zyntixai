import type { LearningProfileView } from "@/lib/marketing/learning/fetch-learning-run-client"
import { Megaphone, Quote, Sparkles } from "lucide-react"

export default function LearningBestPatternsSection({
  profile,
}: {
  profile: LearningProfileView
}) {
  const hasHooks = profile.best_hook_patterns.length > 0
  const hasCtas = profile.best_cta_patterns.length > 0
  const hasPosts = profile.best_performing_posts.length > 0

  if (!hasHooks && !hasCtas && !hasPosts) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-sm text-slate-500">
        No winning patterns detected yet. Publish more varied content to surface
        hooks, CTAs, and formats that resonate.
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500" />
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-600" />
          <h2 className="text-xl font-bold text-slate-950">Best performing patterns</h2>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Hooks, CTAs, and posts that consistently drive engagement
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {hasHooks ? (
            <div className="rounded-xl border border-violet-200/80 bg-violet-50/40 p-4 lg:col-span-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-violet-800">
                <Quote className="h-4 w-4" />
                Winning hooks
              </div>
              <ul className="mt-3 space-y-3">
                {profile.best_hook_patterns.map((pattern) => (
                  <li
                    key={pattern.hook}
                    className="rounded-lg border border-white/80 bg-white/90 p-3"
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      &ldquo;{pattern.hook}&rdquo;
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {pattern.avgEngagementRate}% avg · {pattern.postCount} post
                      {pattern.postCount === 1 ? "" : "s"}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {hasCtas ? (
            <div className="rounded-xl border border-rose-200/80 bg-rose-50/40 p-4 lg:col-span-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-rose-800">
                <Megaphone className="h-4 w-4" />
                Winning CTAs
              </div>
              <ul className="mt-3 space-y-3">
                {profile.best_cta_patterns.map((pattern) => (
                  <li
                    key={pattern.pattern}
                    className="rounded-lg border border-white/80 bg-white/90 p-3"
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {pattern.pattern}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {pattern.avgEngagementRate}% avg · {pattern.postCount} post
                      {pattern.postCount === 1 ? "" : "s"}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {hasPosts ? (
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4 lg:col-span-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                <Sparkles className="h-4 w-4" />
                Top posts
              </div>
              <ul className="mt-3 space-y-3">
                {profile.best_performing_posts.slice(0, 3).map((post) => (
                  <li
                    key={`${post.postId ?? post.title}-${post.engagementRate}`}
                    className="rounded-lg border border-white/80 bg-white/90 p-3"
                  >
                    <p className="text-sm font-semibold text-slate-900">{post.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {post.engagementRate}% · {post.platform} ·{" "}
                      {post.views.toLocaleString()} views
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
