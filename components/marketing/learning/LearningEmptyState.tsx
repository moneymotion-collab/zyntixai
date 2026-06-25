import Link from "next/link"
import { Brain, Calendar, Sparkles } from "lucide-react"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"

export default function LearningEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-gradient-to-b from-slate-50 to-white px-6 py-16 text-center shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-600 shadow-sm">
        <Brain className="h-8 w-8" />
      </div>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-violet-600/80">
        {SAAS_EMPTY.marketingLearning.eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-bold text-slate-900">
        {SAAS_EMPTY.marketingLearning.title}
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
        {SAAS_EMPTY.marketingLearning.description}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/marketing/content-ideas"
          className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          <Sparkles className="h-4 w-4" />
          Generate your first content idea
        </Link>
        <Link
          href="/marketing/calendar"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
        >
          <Calendar className="h-4 w-4" />
          Open calendar
        </Link>
      </div>
    </div>
  )
}
