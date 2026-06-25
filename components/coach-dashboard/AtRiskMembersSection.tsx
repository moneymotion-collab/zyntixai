"use client"

import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  Clock3,
  ShieldAlert,
  Target,
  User,
} from "lucide-react"
import EmptyState from "@/components/ui/empty-state"
import GlassCard from "@/components/ui/glass-card"
import { renderEmptyStateAction } from "@/lib/copy/empty-state-presets"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import { Skeleton } from "@/components/ui/skeleton"
import type { AtRiskLevel, AtRiskMembersCenter } from "@/lib/coach-dashboard/types"

type AtRiskMembersSectionProps = {
  atRiskMembers: AtRiskMembersCenter
  loading?: boolean
  error?: string | null
}

const RISK_LEVEL_BADGE_STYLES: Record<AtRiskLevel, string> = {
  high: "border-red-500/30 bg-red-500/10 text-red-200",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  low: "border-yellow-500/30 bg-yellow-500/10 text-yellow-200",
}

const REASON_BADGE_STYLE =
  "inline-flex rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-100"

const SUMMARY_CARD_STYLES: Record<
  "high" | "medium" | "low" | "total",
  { accent: string; highlight?: boolean }
> = {
  high: {
    accent: "from-red-500/20 to-rose-500/10 text-red-300",
    highlight: true,
  },
  medium: {
    accent: "from-amber-500/20 to-orange-500/10 text-amber-300",
  },
  low: {
    accent: "from-yellow-500/20 to-amber-500/10 text-yellow-300",
  },
  total: {
    accent: "from-violet-500/20 to-purple-500/10 text-violet-300",
  },
}

function RiskLevelBadge({ level, label }: { level: AtRiskLevel; label: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${RISK_LEVEL_BADGE_STYLES[level]}`}
    >
      {label}
    </span>
  )
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  accent,
  highlight,
  loading,
}: {
  label: string
  value: number
  icon: typeof AlertTriangle
  accent: string
  highlight?: boolean
  loading?: boolean
}) {
  return (
    <GlassCard
      className={`p-5 sm:p-6 ${highlight && value > 0 ? "border-red-400/30 bg-red-500/[0.04]" : ""}`}
      hover
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-400">{label}</p>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br ${accent}`}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </div>
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-9 w-12" />
      ) : (
        <p className="mt-3 text-3xl font-bold tabular-nums text-white sm:text-4xl">
          {value}
        </p>
      )}
    </GlassCard>
  )
}

function AtRiskClientCard({
  member,
}: {
  member: AtRiskMembersCenter["members"][number]
}) {
  return (
    <article className="glass-panel rounded-2xl p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white">{member.memberName}</p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-slate-400">
            <Clock3 className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden />
            Last activity: {member.lastActivityDateLabel}
          </p>
        </div>
        <RiskLevelBadge level={member.riskLevel} label={member.riskLevelLabel} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {member.riskReasonLabels.map((label) => (
          <span key={label} className={REASON_BADGE_STYLE}>
            {label}
          </span>
        ))}
      </div>

      <div className="mt-5 border-t border-white/10 pt-4">
        <Link
          href={`/members/${member.memberId}`}
          className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:border-cyan-400/50 hover:bg-cyan-500/15 hover:text-white"
        >
          Open client
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </article>
  )
}

export function AtRiskMembersSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="glass-panel space-y-3 p-5 sm:p-6">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-12" />
          </div>
        ))}
      </div>
      <div className="glass-panel space-y-3 p-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export default function AtRiskMembersSection({
  atRiskMembers,
  loading,
  error,
}: AtRiskMembersSectionProps) {
  const { summary, members } = atRiskMembers

  return (
    <GlassCard
      id="coach-at-risk-members"
      className="relative scroll-mt-8 overflow-hidden border-red-500/20 bg-gradient-to-br from-red-500/[0.05] via-white/[0.02] to-amber-500/[0.04] p-6 sm:p-8"
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-red-500/10 blur-3xl" />

      <div className="relative mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-red-400">
            At-risk client center
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            At-Risk Clients
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Clients flagged from check-ins, habits, workouts, progress logs,
            goals, and open reminders.
          </p>
        </div>
        <Link
          href="/progress"
          className="text-sm font-medium text-cyan-400 transition hover:text-cyan-300"
        >
          Open progress dashboard →
        </Link>
      </div>

      {error ? (
        <div className="relative mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="relative mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="High priority"
          value={summary.highRiskCount}
          icon={ShieldAlert}
          accent={SUMMARY_CARD_STYLES.high.accent}
          highlight={SUMMARY_CARD_STYLES.high.highlight}
          loading={loading}
        />
        <SummaryCard
          label="Medium priority"
          value={summary.mediumRiskCount}
          icon={AlertTriangle}
          accent={SUMMARY_CARD_STYLES.medium.accent}
          loading={loading}
        />
        <SummaryCard
          label="Low priority"
          value={summary.lowRiskCount}
          icon={User}
          accent={SUMMARY_CARD_STYLES.low.accent}
          loading={loading}
        />
        <SummaryCard
          label="Total at risk"
          value={summary.totalAtRisk}
          icon={Target}
          accent={SUMMARY_CARD_STYLES.total.accent}
          loading={loading}
        />
      </div>

      {loading ? (
        <div className="relative space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <EmptyState
          {...SAAS_EMPTY.atRisk}
          icon={<ShieldAlert className="h-6 w-6" />}
          action={renderEmptyStateAction("atRisk")}
        />
      ) : (
        <ul className="relative space-y-4">
          {members.map((member) => (
            <li key={member.memberId}>
              <AtRiskClientCard member={member} />
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  )
}
