import { CalendarRange, Eye, Radio, TrendingUp, Users } from "lucide-react"
import type { AnalyticsMonthSummary } from "@/lib/marketing/analytics/build-analytics-summary"

type SummaryMetric = {
  label: string
  value: string
  hint?: string
  icon: typeof Radio
  accent: string
}

function buildMetrics(summary: AnalyticsMonthSummary): SummaryMetric[] {
  return [
    {
      label: "Reach",
      value: summary.reachFormatted,
      icon: Radio,
      accent: "from-violet-600 to-indigo-500",
    },
    {
      label: "Views",
      value: summary.viewsFormatted,
      icon: Eye,
      accent: "from-blue-600 to-cyan-500",
    },
    {
      label: "Engagement",
      value: summary.engagementFormatted,
      icon: TrendingUp,
      accent: "from-emerald-500 to-teal-500",
    },
    {
      label: "Growth",
      value: summary.growthFormatted,
      hint: summary.growthLabel,
      icon: Users,
      accent: "from-amber-500 to-orange-500",
    },
  ]
}

export default function AnalyticsSummarySection({
  summary,
}: {
  summary: AnalyticsMonthSummary
}) {
  const metrics = buildMetrics(summary)

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-[0_12px_40px_rgba(15,23,42,0.2)]">
      <div className="border-b border-white/10 px-6 py-5 sm:px-8 sm:py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-violet-300">
              Analytics Summary
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              This Month
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-base font-semibold text-white/90">
            <CalendarRange className="h-5 w-5 text-violet-300" />
            {summary.periodLabel}
          </div>
        </div>
      </div>

      <div className="grid gap-px bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon

          return (
            <article
              key={metric.label}
              className="bg-slate-950/40 px-6 py-6 sm:px-8 sm:py-7"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${metric.accent} shadow-lg`}
                >
                  <Icon className="h-5 w-5" strokeWidth={2.25} />
                </div>
                <p className="text-sm font-bold uppercase tracking-wide text-slate-300">
                  {metric.label}
                </p>
              </div>

              <p className="mt-5 text-4xl font-bold tabular-nums tracking-tight sm:text-[2.5rem] sm:leading-none">
                {metric.value}
              </p>

              {metric.hint ? (
                <p className="mt-2 text-base font-medium text-slate-400">
                  {metric.hint}
                </p>
              ) : null}
            </article>
          )
        })}
      </div>
    </section>
  )
}
