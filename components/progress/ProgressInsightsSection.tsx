"use client"

import { AlertTriangle, CheckCircle2, Sparkles, TrendingUp } from "lucide-react"
import ProgressEmptyState from "@/components/progress/ProgressEmptyState"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import { formatChange } from "@/lib/progress/fetch-progress-dashboard"
import type { ProgressInsight } from "@/lib/progress/compute-progress-insights"

type ProgressInsightsSectionProps = {
  insights: ProgressInsight[]
}

export default function ProgressInsightsSection({
  insights,
}: ProgressInsightsSectionProps) {
  return (
    <section className="mb-8">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-400">
          Progress Insights
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white">Coach insights</h2>
        <p className="mt-1 text-sm text-gray-400">
          Actionable signals from live progress logs
        </p>
      </div>

      {insights.length === 0 ? (
        <ProgressEmptyState
          {...SAAS_EMPTY.progressAllClear}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}
    </section>
  )
}

function InsightCard({ insight }: { insight: ProgressInsight }) {
  const styles = INSIGHT_STYLES[insight.insightType]
  const Icon = styles.icon

  return (
    <article
      className={`rounded-3xl border p-5 transition hover:bg-white/[0.04] ${styles.card}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide ${styles.badge}`}
        >
          {insight.insightLabel}
        </span>
        <Icon className={`h-5 w-5 shrink-0 ${styles.iconColor}`} />
      </div>

      <h3 className="mt-4 text-lg font-semibold text-white">{insight.memberName}</h3>
      <p className="mt-1 text-sm text-gray-400">{insight.metric}</p>

      {insight.changeValue != null ? (
        <p className={`mt-3 text-sm font-medium tabular-nums ${styles.change}`}>
          Change {formatChange(insight.changeValue)}
        </p>
      ) : null}

      <p className="mt-4 text-sm leading-relaxed text-gray-300">
        {insight.recommendation}
      </p>
    </article>
  )
}

const INSIGHT_STYLES = {
  best_progress: {
    icon: TrendingUp,
    card: "border-emerald-500/20 bg-emerald-500/5",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    iconColor: "text-emerald-400",
    change: "text-emerald-300",
  },
  needs_attention: {
    icon: AlertTriangle,
    card: "border-amber-500/20 bg-amber-500/5",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    iconColor: "text-amber-400",
    change: "text-amber-300",
  },
  consistency: {
    icon: Sparkles,
    card: "border-cyan-500/20 bg-cyan-500/5",
    badge: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200",
    iconColor: "text-cyan-400",
    change: "text-cyan-300",
  },
} as const
