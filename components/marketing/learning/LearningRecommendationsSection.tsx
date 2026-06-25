import type { LearningRecommendation } from "@/lib/marketing/learning/types"
import {
  priorityBadgeClass,
  priorityLabel,
} from "@/components/marketing/learning/learning-ui-utils"
import { Lightbulb } from "lucide-react"

export default function LearningRecommendationsSection({
  recommendations,
}: {
  recommendations: LearningRecommendation[]
}) {
  if (recommendations.length === 0) {
    return null
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-600" />
          <h2 className="text-xl font-bold text-slate-950">Recommendations</h2>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Strategic guidance based on your performance patterns
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {recommendations.map((item) => (
            <article
              key={item.key}
              className="rounded-xl border border-slate-200 bg-slate-50/80 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${priorityBadgeClass(item.priority)}`}
                >
                  {priorityLabel(item.priority)} priority
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  {item.category.replace(/_/g, " ")}
                </span>
              </div>
              <h3 className="mt-3 text-base font-semibold text-slate-900">
                {item.title}
              </h3>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Why it matters
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {item.whyItMatters}
              </p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Based on your data
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {item.insight}
              </p>
              {item.triggerPostTitle ? (
                <p className="mt-2 text-xs text-slate-500">
                  Triggered by:{" "}
                  <span className="font-medium text-slate-700">
                    {item.triggerPostTitle}
                  </span>
                </p>
              ) : null}
              <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50/70 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                  Next action
                </p>
                <p className="mt-1 text-sm font-medium text-amber-950">
                  {item.action}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
