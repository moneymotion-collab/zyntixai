"use client"

import Link from "next/link"
import {
  Activity,
  AlertTriangle,
  CalendarCheck,
  HeartPulse,
} from "lucide-react"
import CoachMemberActionButtons from "@/components/coach-dashboard/CoachMemberActionButtons"
import EmptyState from "@/components/ui/empty-state"
import GlassCard from "@/components/ui/glass-card"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import type { MemberHealthScore, MemberHealthStatus } from "@/lib/coach-dashboard/compute-member-health-scores"

type MemberHealthScoresSectionProps = {
  scores: MemberHealthScore[]
  hasData: boolean
}

const STATUS_STYLES: Record<
  MemberHealthStatus,
  { badge: string; score: string; ring: string }
> = {
  strong: {
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    score: "text-emerald-300",
    ring: "from-emerald-400/30 to-emerald-500/10",
  },
  stable: {
    badge: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200",
    score: "text-cyan-300",
    ring: "from-cyan-400/30 to-cyan-500/10",
  },
  needs_attention: {
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    score: "text-amber-300",
    ring: "from-amber-400/30 to-amber-500/10",
  },
  high_risk: {
    badge: "border-red-500/30 bg-red-500/10 text-red-200",
    score: "text-red-300",
    ring: "from-red-400/30 to-red-500/10",
  },
}

export default function MemberHealthScoresSection({
  scores,
  hasData,
}: MemberHealthScoresSectionProps) {
  return (
    <GlassCard className="relative overflow-hidden border-violet-500/20 bg-gradient-to-br from-violet-500/[0.06] via-white/[0.02] to-cyan-500/[0.05] p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-violet-400">
            Wellness intelligence
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            Member Health Scores
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Composite 0–100 score from latest energy, sleep, motivation, and
            7-day check-in consistency. Sorted highest risk first.
          </p>
        </div>
        <Link
          href="/progress"
          className="text-sm font-medium text-cyan-400 transition hover:text-cyan-300"
        >
          Open progress dashboard →
        </Link>
      </div>

      {!hasData ? (
        <EmptyState
          {...SAAS_EMPTY.memberHealth}
          icon={<HeartPulse className="h-6 w-6" />}
          action={
            <Link href="/progress" className="btn-gradient">
              Add Check-in
            </Link>
          }
        />
      ) : (
        <>
          <div className="relative hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[1080px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Member</th>
                  <th className="pb-3 pr-4 font-medium">Score</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Latest check-in</th>
                  <th className="pb-3 pr-4 font-medium">Main risk</th>
                  <th className="pb-3 font-medium">Suggested action</th>
                  <th className="pb-3 pl-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {scores.map((score) => (
                  <HealthScoreTableRow key={score.memberId} score={score} />
                ))}
              </tbody>
            </table>
          </div>

          <ul className="relative space-y-4 lg:hidden">
            {scores.map((score) => (
              <HealthScoreCard key={score.memberId} score={score} />
            ))}
          </ul>
        </>
      )}
    </GlassCard>
  )
}

function HealthScoreTableRow({ score }: { score: MemberHealthScore }) {
  const styles = STATUS_STYLES[score.status]

  return (
    <tr className="group transition hover:bg-white/[0.03]">
      <td className="py-4 pr-4">
        <Link
          href={`/members/${score.memberId}`}
          className="font-medium text-white group-hover:text-cyan-300"
        >
          {score.memberName}
        </Link>
      </td>
      <td className="py-4 pr-4">
        <ScoreBadge value={score.healthScore} className={styles.score} />
      </td>
      <td className="py-4 pr-4">
        <StatusBadge label={score.statusLabel} className={styles.badge} />
      </td>
      <td className="py-4 pr-4 text-slate-300">
        <span className="inline-flex items-center gap-1.5">
          <CalendarCheck className="h-3.5 w-3.5 text-violet-400" aria-hidden />
          {score.latestCheckInDateLabel}
        </span>
      </td>
      <td className="py-4 pr-4 text-slate-300">{score.mainRiskFactor}</td>
      <td className="py-4 text-slate-400">{score.suggestedCoachAction}</td>
      <td className="py-4 pl-4">
        <CoachMemberActionButtons
          memberId={score.memberId}
          memberName={score.memberName}
          latestCheckInId={score.latestCheckInId}
          layout="stack"
        />
      </td>
    </tr>
  )
}

function HealthScoreCard({ score }: { score: MemberHealthScore }) {
  const styles = STATUS_STYLES[score.status]

  return (
    <li>
      <div className="glass-panel rounded-2xl p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">{score.memberName}</p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-400">
              <CalendarCheck className="h-3.5 w-3.5 text-violet-400" aria-hidden />
              {score.latestCheckInDateLabel}
            </p>
          </div>
          <div
            className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br ${styles.ring}`}
          >
            <span className={`text-xl font-bold tabular-nums ${styles.score}`}>
              {score.healthScore}
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StatusBadge label={score.statusLabel} className={styles.badge} />
          <ScoreBadge value={score.healthScore} className={styles.score} compact />
        </div>

        <div className="mt-4 space-y-3 border-t border-white/10 pt-4 text-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Main risk
            </p>
            <p className="mt-1 text-slate-300">{score.mainRiskFactor}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Suggested action
            </p>
            <p className="mt-1 text-slate-400">{score.suggestedCoachAction}</p>
          </div>
        </div>

        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
            Coach actions
          </p>
          <CoachMemberActionButtons
            memberId={score.memberId}
            memberName={score.memberName}
            latestCheckInId={score.latestCheckInId}
          />
        </div>
      </div>
    </li>
  )
}

function ScoreBadge({
  value,
  className,
  compact = false,
}: {
  value: number
  className: string
  compact?: boolean
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/20 font-bold tabular-nums ${compact ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"} ${className}`}
    >
      <Activity className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden />
      {value}
    </span>
  )
}

function StatusBadge({
  label,
  className,
}: {
  label: string
  className: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${className}`}
    >
      {label === "High Risk" || label === "Needs Attention" ? (
        <AlertTriangle className="h-3 w-3" aria-hidden />
      ) : null}
      {label}
    </span>
  )
}
