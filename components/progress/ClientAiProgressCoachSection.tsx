"use client"

import {
  Bot,
  MessageSquare,
  Sparkles,
  TrendingUp,
  TriangleAlert,
  User,
} from "lucide-react"
import ProgressEmptyState from "@/components/progress/ProgressEmptyState"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import { Skeleton } from "@/components/ui/skeleton"
import { PROGRESS_PRO_CARD } from "@/components/progress/progress-pro-ui"
import type { AiProgressCoachInsight } from "@/lib/progress/compute-ai-progress-coach"

type ClientAiProgressCoachSectionProps = {
  insight: AiProgressCoachInsight
  loading?: boolean
}

export default function ClientAiProgressCoachSection({
  insight,
  loading = false,
}: ClientAiProgressCoachSectionProps) {
  return (
    <section className={`relative overflow-hidden ${PROGRESS_PRO_CARD} border-violet-500/20 bg-gradient-to-br from-violet-500/[0.08] via-white/[0.03] to-cyan-500/[0.06] p-6 sm:p-8`}>
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-violet-200">
            <Bot className="h-3.5 w-3.5" aria-hidden />
            AI Progress Coach
          </div>
          <h3 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
            Coaching summary
          </h3>
          <p className="mt-2 max-w-2xl text-sm text-gray-400">
            Generated from live check-ins, goals, alerts, and progress trends.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-xs font-medium uppercase tracking-wider text-gray-300">
            <Sparkles className="h-4 w-4 text-violet-300" aria-hidden />
            Rule-Based Insights
          </span>
        </div>
      </div>

      {loading ? (
        <div className="relative space-y-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      ) : !insight.hasData ? (
        <ProgressEmptyState
          {...SAAS_EMPTY.coachInsights}
          icon={<Bot className="h-5 w-5" />}
          compact
        />
      ) : (
        <div className="relative space-y-4">
          <InsightBlock
            icon={User}
            label="Member summary"
            content={insight.memberSummary}
            accent="text-cyan-400"
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <InsightBlock
              icon={TrendingUp}
              label="Progress trend"
              content={insight.progressTrend}
              accent="text-emerald-400"
            />
            <InsightBlock
              icon={TriangleAlert}
              label="Biggest risk"
              content={insight.biggestRisk}
              accent="text-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <InsightBlock
              icon={Sparkles}
              label="Best positive signal"
              content={insight.bestPositiveSignal}
              accent="text-violet-400"
              tone="positive"
            />
            <InsightBlock
              icon={Bot}
              label="Recommended coach action"
              content={insight.recommendedCoachAction}
              accent="text-cyan-400"
              tone="action"
            />
          </div>

          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.06] p-5">
            <div className="flex items-start gap-3">
              <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" aria-hidden />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-cyan-300/80">
                  Suggested message to send
                </p>
                <p className="mt-2 text-sm leading-relaxed text-gray-200">
                  {insight.suggestedMemberMessage}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function InsightBlock({
  icon: Icon,
  label,
  content,
  accent,
  tone = "default",
}: {
  icon: typeof User
  label: string
  content: string
  accent: string
  tone?: "default" | "positive" | "action"
}) {
  const boxClass =
    tone === "positive"
      ? "border-emerald-500/15 bg-emerald-500/[0.04]"
      : tone === "action"
        ? "border-violet-500/15 bg-violet-500/[0.04]"
        : "border-white/10 bg-[#0b1224]/50"

  return (
    <div className={`rounded-2xl border p-5 ${boxClass}`}>
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${accent}`} aria-hidden />
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
          {label}
        </p>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-gray-200">{content}</p>
    </div>
  )
}
