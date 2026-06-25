import type { LearningNextAction } from "@/lib/marketing/learning/types"
import {
  categoryBadgeClass,
  formatCategoryLabel,
} from "@/components/marketing/learning/learning-ui-utils"
import { ArrowRight, ListChecks } from "lucide-react"

export default function LearningNextActionsSection({
  nextActions,
}: {
  nextActions: LearningNextAction[]
}) {
  if (nextActions.length === 0) {
    return null
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="h-1 bg-gradient-to-r from-slate-700 via-gray-800 to-black" />
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-slate-700" />
          <h2 className="text-xl font-bold text-slate-950">Next actions</h2>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Concrete steps to apply your learning this week
        </p>

        <ol className="mt-5 space-y-3">
          {nextActions.map((item, index) => (
            <li
              key={`${item.category}-${index}`}
              className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${categoryBadgeClass(item.category)}`}
                  >
                    {formatCategoryLabel(item.category)}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-800">
                  {item.action}
                </p>
              </div>
              <ArrowRight className="mt-1 hidden h-4 w-4 shrink-0 text-slate-400 sm:block" />
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
