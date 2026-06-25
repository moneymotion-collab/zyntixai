"use client"

import {
  Clock3,
  Lightbulb,
  Sparkles,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"
import type { AnalyticsAiInsights } from "@/lib/marketing/analytics/build-analytics-ai-insights"

type InsightConfig = {
  icon: LucideIcon
  accent: string
  bar: string
}

const INSIGHT_STYLES: Record<keyof AnalyticsAiInsights, InsightConfig> = {
  performedBest: {
    icon: TrendingUp,
    accent: "from-emerald-500 to-teal-500",
    bar: "from-emerald-500 to-teal-400",
  },
  underperformed: {
    icon: TrendingDown,
    accent: "from-rose-500 to-orange-500",
    bar: "from-rose-500 to-orange-400",
  },
  nextContent: {
    icon: Lightbulb,
    accent: "from-violet-500 to-indigo-500",
    bar: "from-violet-500 to-indigo-400",
  },
  postingTimes: {
    icon: Clock3,
    accent: "from-blue-500 to-cyan-500",
    bar: "from-blue-500 to-cyan-400",
  },
}

function InsightCard({
  insightKey,
  title,
  summary,
  action,
}: {
  insightKey: keyof AnalyticsAiInsights
  title: string
  summary: string
  action: string
}) {
  const config = INSIGHT_STYLES[insightKey]
  const Icon = config.icon

  return (
    <article className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${config.bar}`} />

      <div className="relative flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${config.accent} text-white shadow-md`}
        >
          <Icon className="h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">
            {title}
          </h3>
          <p className="mt-3 text-lg font-bold leading-snug text-slate-950">
            {summary}
          </p>
          <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-base font-semibold leading-relaxed text-slate-800">
            {action}
          </p>
        </div>
      </div>
    </article>
  )
}

export default function AnalyticsAiInsightsSection({
  insights,
}: {
  insights: AnalyticsAiInsights
}) {
  const orderedKeys: Array<keyof AnalyticsAiInsights> = [
    "performedBest",
    "underperformed",
    "nextContent",
    "postingTimes",
  ]

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
      <div className="h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500" />

      <div className="p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-[1.75rem]">
              AI Insights
            </h2>
            <p className="mt-1 text-base font-medium text-slate-600">
              What to publish next
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {orderedKeys.map((key) => {
            const card = insights[key]

            return (
              <InsightCard
                key={key}
                insightKey={key}
                title={card.title}
                summary={card.summary}
                action={card.action}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
