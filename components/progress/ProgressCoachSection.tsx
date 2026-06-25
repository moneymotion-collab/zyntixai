"use client"

import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Minus,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import type { ProgressCoachInsight } from "@/lib/progress/compute-progress-coach-insights"
import type { MemberCoachContext } from "@/lib/progress/fetch-progress-coach-context"
import { summarizeCoachContext } from "@/lib/progress/compute-progress-coach-insights"
import ProgressEmptyState from "@/components/progress/ProgressEmptyState"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"

type ProgressCoachSectionProps = {
  insights: ProgressCoachInsight[]
  memberContexts: Map<string, MemberCoachContext>
}

export default function ProgressCoachSection({
  insights,
  memberContexts,
}: ProgressCoachSectionProps) {
  return (
    <section className="mb-8">
      <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.08] via-white/[0.03] to-cyan-500/[0.06] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-violet-200">
              <Bot className="h-3.5 w-3.5" />
              AI Progress Coach
            </div>
            <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
              Smart coaching insights
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-gray-400">
              Rule-based recommendations from progress logs, goals, workouts, and
              nutrition — no AI calls yet, just actionable signals from live data.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-300">
            <Sparkles className="h-4 w-4 text-violet-300" />
            <span>
              <span className="font-semibold text-white">{insights.length}</span>{" "}
              {insights.length === 1 ? "insight" : "insights"}
            </span>
          </div>
        </div>

        {insights.length === 0 ? (
          <ProgressEmptyState
            {...SAAS_EMPTY.progressAllClear}
            icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}
            compact
          />
        ) : (
          <div className="relative grid grid-cols-1 gap-4 lg:grid-cols-2">
            {insights.map((insight) => (
              <CoachInsightCard
                key={insight.id}
                insight={insight}
                contextSummary={summarizeCoachContext(
                  memberContexts,
                  insight.memberId,
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function CoachInsightCard({
  insight,
  contextSummary,
}: {
  insight: ProgressCoachInsight
  contextSummary: string | null
}) {
  const styles = COACH_INSIGHT_STYLES[insight.insightType]
  const Icon = styles.icon

  return (
    <article
      className={`rounded-2xl border p-5 backdrop-blur-sm transition hover:bg-white/[0.04] ${styles.card}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide ${styles.badge}`}
        >
          <Icon className="h-3.5 w-3.5" />
          {insight.insightLabel}
        </span>
      </div>

      <h3 className="mt-4 text-lg font-semibold text-white">{insight.memberName}</h3>
      <p className="mt-1 text-sm text-gray-400">{insight.metric}</p>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Reason
          </p>
          <p className="mt-1 text-sm leading-relaxed text-gray-300">{insight.reason}</p>
        </div>

        <div className={`rounded-xl border px-4 py-3 ${styles.actionBox}`}>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Recommended action
          </p>
          <p className="mt-1 text-sm font-medium text-white">
            {insight.recommendedAction}
          </p>
        </div>

        {contextSummary ? (
          <p className="text-xs text-gray-500">{contextSummary}</p>
        ) : null}
      </div>
    </article>
  )
}

const COACH_INSIGHT_STYLES = {
  plateau: {
    icon: Minus,
    card: "border-amber-500/25 bg-amber-500/[0.04]",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    actionBox: "border-amber-500/20 bg-amber-500/5",
  },
  fast_improvement: {
    icon: TrendingUp,
    card: "border-emerald-500/25 bg-emerald-500/[0.04]",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    actionBox: "border-emerald-500/20 bg-emerald-500/5",
  },
  decline: {
    icon: TrendingDown,
    card: "border-red-500/25 bg-red-500/[0.04]",
    badge: "border-red-500/30 bg-red-500/10 text-red-200",
    actionBox: "border-red-500/20 bg-red-500/5",
  },
  goal_risk: {
    icon: AlertTriangle,
    card: "border-orange-500/25 bg-orange-500/[0.04]",
    badge: "border-orange-500/30 bg-orange-500/10 text-orange-200",
    actionBox: "border-orange-500/20 bg-orange-500/5",
  },
  completed_goal: {
    icon: CheckCircle2,
    card: "border-cyan-500/25 bg-cyan-500/[0.04]",
    badge: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200",
    actionBox: "border-cyan-500/20 bg-cyan-500/5",
  },
} as const
