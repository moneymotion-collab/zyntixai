import type { AiLearningProfileSummary } from "@/lib/marketing/learning/types"
import { Brain, Sparkles } from "lucide-react"

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 py-3 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <dt className="text-sm font-semibold text-slate-600">{label}</dt>
      <dd className="text-sm font-bold text-slate-950 sm:text-right">{value}</dd>
    </div>
  )
}

export default function AiLearningProfileCard({
  summary,
}: {
  summary: AiLearningProfileSummary
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/50 shadow-[0_8px_30px_rgba(79,70,229,0.08)]">
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              AI Learning Profile
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">
              Your personalized content playbook
            </h2>
          </div>
        </div>

        <dl className="mt-5 rounded-xl border border-white/80 bg-white/90 px-4 py-1 shadow-sm backdrop-blur sm:px-5">
          <ProfileRow label="Best Content Type:" value={summary.bestContentType} />
          <ProfileRow label="Best Hook Style:" value={summary.bestHookStyle} />
          <ProfileRow label="Best CTA:" value={summary.bestCta} />
          <ProfileRow label="Best Posting Time:" value={summary.bestPostingTime} />
        </dl>

        <div className="mt-4 rounded-xl border border-violet-200/80 bg-violet-50/60 px-4 py-4 sm:px-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-violet-800">
            <Sparkles className="h-4 w-4 shrink-0" />
            Recommendation
          </div>
          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-800">
            {summary.recommendation}
          </p>
        </div>
      </div>
    </section>
  )
}
