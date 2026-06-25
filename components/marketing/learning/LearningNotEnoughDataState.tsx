import { LEARNING_MIN_POSTS } from "@/lib/marketing/learning/types"
import { BarChart3, TrendingUp } from "lucide-react"

export default function LearningNotEnoughDataState({
  postCount,
  message,
  variant = "learning",
}: {
  postCount: number
  message?: string
  variant?: "learning" | "not_enough"
}) {
  const progress = Math.min(100, Math.round((postCount / LEARNING_MIN_POSTS) * 100))
  const remaining = Math.max(0, LEARNING_MIN_POSTS - postCount)
  const isLearning = variant === "learning" && postCount > 0

  return (
    <div className="overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
            <TrendingUp className="h-3.5 w-3.5" />
            {isLearning ? "Learning from your posts" : "Not enough data yet"}
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">
            {isLearning ? "Building your learning profile" : "Almost ready to learn"}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {message ??
              (isLearning
                ? `We're analyzing ${postCount} tracked post${postCount === 1 ? "" : "s"}. Publish ${remaining} more to unlock full pattern detection.`
                : `Publish at least ${LEARNING_MIN_POSTS} posts to unlock learning insights.`)}
          </p>
          <p className="mt-3 text-sm font-medium text-slate-500">
            {remaining > 0
              ? `${remaining} more post${remaining === 1 ? "" : "s"} needed to unlock pattern detection.`
              : "You are at the threshold — run learning again after your next publish."}
          </p>
        </div>

        <div className="w-full max-w-sm rounded-2xl border border-white/80 bg-white/90 p-5 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
            <span className="inline-flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-amber-600" />
              Posts tracked
            </span>
            <span>
              {postCount} / {LEARNING_MIN_POSTS}
            </span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Sync analytics after each publish to accelerate learning.
          </p>
        </div>
      </div>
    </div>
  )
}
