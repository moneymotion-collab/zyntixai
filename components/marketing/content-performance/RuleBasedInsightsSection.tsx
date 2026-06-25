import { AlertTriangle, CheckCircle2, Sparkles } from "lucide-react"
import type { RuleBasedInsight } from "@/lib/marketing/content-performance/types"

const TONE_STYLES: Record<
  RuleBasedInsight["tone"],
  { border: string; bg: string; text: string; icon: typeof Sparkles }
> = {
  success: {
    border: "border-emerald-200",
    bg: "bg-emerald-50",
    text: "text-emerald-900",
    icon: CheckCircle2,
  },
  warning: {
    border: "border-amber-200",
    bg: "bg-amber-50",
    text: "text-amber-900",
    icon: AlertTriangle,
  },
  danger: {
    border: "border-rose-200",
    bg: "bg-rose-50",
    text: "text-rose-900",
    icon: AlertTriangle,
  },
}

export default function RuleBasedInsightsSection({
  insights,
}: {
  insights: RuleBasedInsight[]
}) {
  if (insights.length === 0) return null

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
      <div className="h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500" />

      <div className="p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-950">AI Insights</h2>
            <p className="text-sm font-medium text-slate-500">
              Rule-based performance guidance
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {insights.map((insight) => {
            const styles = TONE_STYLES[insight.tone]
            const Icon = styles.icon

            return (
              <article
                key={insight.id}
                className={`rounded-xl border p-4 ${styles.border} ${styles.bg}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${styles.text}`} />
                  <div>
                    <h3 className={`text-sm font-bold uppercase tracking-wide ${styles.text}`}>
                      {insight.title}
                    </h3>
                    <p className={`mt-2 text-base font-semibold leading-relaxed ${styles.text}`}>
                      {insight.message}
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
