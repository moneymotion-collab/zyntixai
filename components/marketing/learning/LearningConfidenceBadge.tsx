import {
  confidenceTierLabel,
  getConfidenceTier,
} from "@/lib/marketing/learning/compute-confidence-score"
import { confidenceBadgeClass } from "@/components/marketing/learning/learning-ui-utils"
import { ShieldCheck } from "lucide-react"

export default function LearningConfidenceBadge({ score }: { score: number }) {
  const tier = getConfidenceTier(score)

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
        <ShieldCheck className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Confidence score
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-2xl font-bold text-slate-900">{score}%</span>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${confidenceBadgeClass(score)}`}
          >
            {confidenceTierLabel(tier)}
          </span>
        </div>
      </div>
    </div>
  )
}
