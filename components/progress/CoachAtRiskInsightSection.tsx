"use client"

import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Database,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"
import ProgressEmptyState from "@/components/progress/ProgressEmptyState"
import { renderEmptyStateAction } from "@/lib/copy/empty-state-presets"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import { ProgressProSectionHeader } from "@/components/progress/progress-pro-ui"
import { PROGRESS_PRO_CARD } from "@/components/progress/progress-pro-ui"
import {
  AT_RISK_REASON_LABELS,
  COACH_INSIGHT_CATEGORY_LABELS,
  type CoachInsightCategory,
  type CoachInsightRosterSummary,
  type MemberCoachInsightStatus,
} from "@/lib/progress/compute-coach-insight-status"

type CoachAtRiskInsightSectionProps = {
  roster: CoachInsightRosterSummary | null
  loading?: boolean
  memberFilter?: string
  variant?: "dashboard" | "member"
}

type SummaryCardConfig = {
  category: CoachInsightCategory
  count: number
  icon: LucideIcon
  accent: string
}

const SUMMARY_CARDS: Omit<SummaryCardConfig, "count">[] = [
  {
    category: "needs_attention",
    icon: AlertTriangle,
    accent: "text-amber-400",
  },
  {
    category: "on_track",
    icon: CheckCircle2,
    accent: "text-emerald-400",
  },
  {
    category: "improving",
    icon: TrendingUp,
    accent: "text-cyan-400",
  },
  {
    category: "missing_data",
    icon: Database,
    accent: "text-gray-400",
  },
]

const CATEGORY_STYLES: Record<
  CoachInsightCategory,
  { card: string; badge: string }
> = {
  needs_attention: {
    card: "border-amber-500/20 bg-amber-500/5",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  },
  on_track: {
    card: "border-emerald-500/20 bg-emerald-500/5",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  },
  improving: {
    card: "border-cyan-500/20 bg-cyan-500/5",
    badge: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200",
  },
  missing_data: {
    card: "border-white/10 bg-white/[0.03]",
    badge: "border-white/15 bg-white/5 text-gray-300",
  },
}

function SummaryCountCard({
  category,
  count,
  icon: Icon,
  accent,
  loading,
}: SummaryCardConfig & { loading?: boolean }) {
  return (
    <div className={`${PROGRESS_PRO_CARD} p-5 transition hover:border-white/15`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-400">
          {COACH_INSIGHT_CATEGORY_LABELS[category]}
        </p>
        <Icon className={`h-4 w-4 shrink-0 ${accent}`} aria-hidden />
      </div>
      {loading ? (
        <div className="skeleton-shimmer mt-3 h-8 w-12 rounded-lg" />
      ) : (
        <p className="mt-3 text-3xl font-bold tabular-nums text-white">{count}</p>
      )}
    </div>
  )
}

function MemberInsightCard({
  member,
  showDetailLink = true,
}: {
  member: MemberCoachInsightStatus
  showDetailLink?: boolean
}) {
  const styles = CATEGORY_STYLES[member.category]

  return (
    <article
      className={`rounded-3xl border p-5 transition hover:bg-white/[0.04] ${styles.card}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide ${styles.badge}`}
        >
          {COACH_INSIGHT_CATEGORY_LABELS[member.category]}
        </span>
        {showDetailLink ? (
          <Link
            href={`/progress/${member.memberId}`}
            className="inline-flex items-center gap-1 text-xs text-gray-500 transition hover:text-cyan-400"
          >
            View
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>

      <h3 className="mt-4 text-lg font-semibold text-white">{member.memberName}</h3>
      <p className="mt-3 text-sm leading-relaxed text-gray-300">{member.summary}</p>

      {member.atRiskReasons.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {member.atRiskReasons.map((reason) => (
            <li
              key={reason}
              className="flex items-start gap-2 text-xs text-amber-200/90"
            >
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {AT_RISK_REASON_LABELS[reason]}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  )
}

export default function CoachAtRiskInsightSection({
  roster,
  loading = false,
  memberFilter = "all",
  variant = "dashboard",
}: CoachAtRiskInsightSectionProps) {
  const summary = roster ?? {
    needsAttention: 0,
    onTrack: 0,
    improving: 0,
    missingData: 0,
    members: [],
  }

  const countByCategory: Record<CoachInsightCategory, number> = {
    needs_attention: summary.needsAttention,
    on_track: summary.onTrack,
    improving: summary.improving,
    missing_data: summary.missingData,
  }

  const memberCards = summary.members
  const showMemberList = memberCards.length > 0

  return (
    <section className="mb-8">
      <ProgressProSectionHeader
        eyebrow="Coach signals"
        title={variant === "member" ? "Member insight summary" : "At-risk detection"}
        description={
          variant === "member"
            ? "Status based on check-ins, habits, workouts, progress logs, and goal pace."
            : "See which clients need follow-up based on engagement and goal progress."
        }
        accent="amber"
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {SUMMARY_CARDS.map((card) => (
          <SummaryCountCard
            key={card.category}
            {...card}
            count={countByCategory[card.category]}
            loading={loading}
          />
        ))}
      </div>

      {!loading && summary.members.length === 0 ? (
        <ProgressEmptyState
          {...SAAS_EMPTY.progressAtRiskRoster}
          icon={<Database className="h-5 w-5" />}
          action={renderEmptyStateAction("progressAtRiskRoster")}
          compact
        />
      ) : showMemberList && memberCards.length > 0 ? (
        <div
          className={
            variant === "member"
              ? "max-w-3xl"
              : "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          }
        >
          {memberCards.map((member) => (
            <MemberInsightCard
              key={member.memberId}
              member={member}
              showDetailLink={variant !== "member"}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
