"use client"

import {
  Apple,
  CalendarCheck,
  CalendarX,
  Dumbbell,
  Leaf,
  type LucideIcon,
} from "lucide-react"
import ProgressEmptyState from "@/components/progress/ProgressEmptyState"
import { renderEmptyStateAction } from "@/lib/copy/empty-state-presets"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import { ProgressProSectionHeader } from "@/components/progress/progress-pro-ui"
import { PROGRESS_PRO_CARD } from "@/components/progress/progress-pro-ui"
import {
  aggregateRosterAdherence,
  emptyMemberAdherence,
  formatAdherencePercent,
  formatMissedCheckInStatus,
  type MemberAdherenceMetrics,
  type ProgressAdherenceSnapshot,
} from "@/lib/progress/compute-progress-adherence"

type ProgressAdherenceSectionProps = {
  snapshot: ProgressAdherenceSnapshot | null
  memberFilter?: string
  memberIds: string[]
  loading?: boolean
  variant?: "dashboard" | "member"
  memberName?: string
}

type AdherenceCardConfig = {
  id: string
  label: string
  value: string
  detail?: string
  icon: LucideIcon
  accent: string
  empty?: boolean
}

function AdherenceCard({
  label,
  value,
  detail,
  icon: Icon,
  accent,
  loading,
  empty,
}: AdherenceCardConfig & { loading?: boolean }) {
  return (
    <div className={`${PROGRESS_PRO_CARD} p-5 transition hover:border-white/15`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-400">{label}</p>
        <Icon className={`h-4 w-4 shrink-0 ${accent}`} aria-hidden />
      </div>
      {loading ? (
        <div className="skeleton-shimmer mt-3 h-8 w-20 rounded-lg" />
      ) : empty ? (
        <p className="mt-3 text-lg font-semibold text-gray-500">—</p>
      ) : (
        <>
          <p className="mt-3 text-2xl font-bold tabular-nums text-white">{value}</p>
          {detail ? <p className="mt-1 text-xs text-gray-500">{detail}</p> : null}
        </>
      )}
    </div>
  )
}

function buildMemberCards(metrics: MemberAdherenceMetrics): AdherenceCardConfig[] {
  return [
    {
      id: "workout-7d",
      label: "Workouts completed (7d)",
      value: String(metrics.workout.completedLast7Days),
      detail:
        metrics.workout.activeAssignments > 0
          ? `${metrics.workout.activeAssignments} active assignment${metrics.workout.activeAssignments === 1 ? "" : "s"}`
          : "No active workout assignment",
      icon: Dumbbell,
      accent: "text-cyan-400",
    },
    {
      id: "workout-30d",
      label: "Workouts completed (30d)",
      value: String(metrics.workout.completedLast30Days),
      icon: Dumbbell,
      accent: "text-cyan-300",
    },
    {
      id: "nutrition-plan",
      label: "Nutrition plan assigned",
      value: metrics.nutrition.hasActivePlan ? "Yes" : "No",
      detail: metrics.nutrition.planTitle ?? undefined,
      icon: Apple,
      accent: metrics.nutrition.hasActivePlan ? "text-emerald-400" : "text-gray-500",
    },
    {
      id: "nutrition-status",
      label: "Nutrition status",
      value: metrics.nutrition.status
        ? metrics.nutrition.status.replace(/_/g, " ")
        : "—",
      empty: !metrics.nutrition.status,
      icon: Leaf,
      accent: "text-lime-400",
    },
    {
      id: "habit-7d",
      label: "Habit completion (7d)",
      value: formatAdherencePercent(metrics.habit.completionPercent7d),
      detail:
        metrics.habit.completionPercent7d != null
          ? `${metrics.habit.loggedDays7d} of 7 days logged`
          : "No habit logs yet",
      empty: metrics.habit.completionPercent7d == null,
      icon: Leaf,
      accent: "text-violet-400",
    },
    {
      id: "habit-30d",
      label: "Habit completion (30d)",
      value: formatAdherencePercent(metrics.habit.completionPercent30d),
      detail:
        metrics.habit.completionPercent30d != null
          ? `${metrics.habit.loggedDays30d} of 30 days logged`
          : "No habit logs yet",
      empty: metrics.habit.completionPercent30d == null,
      icon: Leaf,
      accent: "text-violet-300",
    },
    {
      id: "checkin-latest",
      label: "Latest check-in",
      value: metrics.checkIn.latestCheckInLabel ?? "—",
      empty: !metrics.checkIn.latestCheckInDate,
      icon: CalendarCheck,
      accent: "text-pink-400",
    },
    {
      id: "checkin-status",
      label: "Check-in status",
      value: formatMissedCheckInStatus(metrics.checkIn),
      icon: metrics.checkIn.missedCheckIn ? CalendarX : CalendarCheck,
      accent: metrics.checkIn.missedCheckIn ? "text-amber-400" : "text-emerald-400",
    },
  ]
}

function buildRosterCards(
  summary: ReturnType<typeof aggregateRosterAdherence>,
): AdherenceCardConfig[] {
  const hasMembers = summary.membersTotal > 0

  return [
    {
      id: "workout-7d",
      label: "Workouts completed (7d)",
      value: String(summary.workoutCompleted7d),
      detail: hasMembers ? `Across ${summary.membersTotal} members` : undefined,
      icon: Dumbbell,
      accent: "text-cyan-400",
      empty: !hasMembers,
    },
    {
      id: "workout-30d",
      label: "Workouts completed (30d)",
      value: String(summary.workoutCompleted30d),
      icon: Dumbbell,
      accent: "text-cyan-300",
      empty: !hasMembers,
    },
    {
      id: "nutrition-active",
      label: "Members on nutrition plan",
      value: hasMembers
        ? `${summary.membersWithActiveNutritionPlan}/${summary.membersTotal}`
        : "—",
      icon: Apple,
      accent: "text-emerald-400",
      empty: !hasMembers,
    },
    {
      id: "workout-active",
      label: "Members with workout plan",
      value: hasMembers
        ? `${summary.membersWithActiveWorkoutPlan}/${summary.membersTotal}`
        : "—",
      icon: Dumbbell,
      accent: "text-sky-400",
      empty: !hasMembers,
    },
    {
      id: "habit-7d",
      label: "Avg habit completion (7d)",
      value: formatAdherencePercent(summary.averageHabitCompletion7d),
      empty: summary.averageHabitCompletion7d == null,
      icon: Leaf,
      accent: "text-violet-400",
    },
    {
      id: "habit-30d",
      label: "Avg habit completion (30d)",
      value: formatAdherencePercent(summary.averageHabitCompletion30d),
      empty: summary.averageHabitCompletion30d == null,
      icon: Leaf,
      accent: "text-violet-300",
    },
    {
      id: "checkin-missed",
      label: "Missed check-ins",
      value: hasMembers ? String(summary.membersMissedCheckIn) : "—",
      detail: hasMembers ? "Members overdue (>7 days)" : undefined,
      icon: CalendarX,
      accent: "text-amber-400",
      empty: !hasMembers,
    },
    {
      id: "checkin-latest",
      label: "Latest roster check-in",
      value: summary.latestCheckInLabel ?? "—",
      empty: !summary.latestCheckInLabel,
      icon: CalendarCheck,
      accent: "text-pink-400",
    },
  ]
}

export default function ProgressAdherenceSection({
  snapshot,
  memberFilter = "all",
  memberIds,
  loading = false,
  variant = "dashboard",
  memberName,
}: ProgressAdherenceSectionProps) {
  const isMemberView = variant === "member" || memberFilter !== "all"
  const scopedMemberId = variant === "member" ? memberIds[0] : memberFilter

  const memberMetrics =
    scopedMemberId && scopedMemberId !== "all"
      ? (snapshot?.byMember.get(scopedMemberId) ??
        (variant === "member" || memberIds.includes(scopedMemberId)
          ? emptyMemberAdherence(scopedMemberId)
          : null))
      : null

  const rosterSummary =
    snapshot && !isMemberView
      ? aggregateRosterAdherence(snapshot, memberIds)
      : null

  const cards =
    isMemberView && memberMetrics
      ? buildMemberCards(memberMetrics)
      : rosterSummary
        ? buildRosterCards(rosterSummary)
        : []

  const showEmpty = !loading && cards.length === 0

  const description =
    variant === "member" && memberName
      ? `Workout, nutrition, habit, and check-in adherence for ${memberName}.`
      : isMemberView && memberMetrics
        ? "Workout, nutrition, habit, and check-in adherence for the selected member."
        : "Roster adherence from workouts, nutrition plans, habits, and check-ins."

  return (
    <section className="mb-8">
      <ProgressProSectionHeader
        eyebrow="Adherence"
        title={variant === "member" ? "Member adherence" : "Coaching adherence"}
        description={description}
        accent="emerald"
      />

      {showEmpty ? (
        <ProgressEmptyState
          {...SAAS_EMPTY.progressAdherence}
          icon={<Dumbbell className="h-5 w-5" />}
          action={renderEmptyStateAction("progressAdherence")}
          compact
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <AdherenceCard key={card.id} {...card} loading={loading} />
          ))}
        </div>
      )}
    </section>
  )
}
