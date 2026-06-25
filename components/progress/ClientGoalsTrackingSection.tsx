"use client"

import { useMemo, useState } from "react"
import { CalendarCheck, Flag, Plus, Target, TrendingUp } from "lucide-react"
import CreateClientGoalModal from "@/components/progress/CreateClientGoalModal"
import ProgressEmptyState from "@/components/progress/ProgressEmptyState"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import {
  PROGRESS_PRO_BTN_PRIMARY,
  PROGRESS_PRO_BTN_SECONDARY,
  PROGRESS_PRO_CARD,
  ProgressProSectionHeader,
} from "@/components/progress/progress-pro-ui"
import { Skeleton } from "@/components/ui/skeleton"
import {
  createClientGoal,
  filterClientGoalsByMember,
  formatGoalRemaining,
  formatGoalTargetDate,
  formatGoalValue,
  type ClientGoalType,
  type ClientGoalViewModel,
} from "@/lib/progress/client-goals"
import type { ClientCheckInRow } from "@/lib/progress/client-checkins"
import { createClient } from "@/lib/supabase/client"
import { notifyCoachingCoreChanged } from "@/lib/coaching-core/notify"

type MemberOption = {
  id: string
  full_name: string | null
}

type ClientGoalsTrackingSectionProps = {
  members: MemberOption[]
  checkIns: ClientCheckInRow[]
  memberFilter: string
  memberFilterLabel: string
  goals: ClientGoalViewModel[]
  loading?: boolean
  onGoalsChange: () => Promise<void>
}

const STATUS_STYLES = {
  on_track: {
    label: "On Track",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    bar: "bg-emerald-400",
  },
  behind_schedule: {
    label: "Behind Schedule",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    bar: "bg-amber-400",
  },
  completed: {
    label: "Completed",
    badge: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200",
    bar: "bg-cyan-400",
  },
} as const

export default function ClientGoalsTrackingSection({
  members,
  checkIns,
  memberFilter,
  memberFilterLabel,
  goals,
  loading = false,
  onGoalsChange,
}: ClientGoalsTrackingSectionProps) {
  const supabase = createClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalCloseSignal, setModalCloseSignal] = useState(0)
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)

  const filteredGoals = useMemo(
    () => filterClientGoalsByMember(goals, memberFilter),
    [goals, memberFilter],
  )

  const defaultMemberId =
    memberFilter !== "all" ? memberFilter : members.length === 1 ? members[0].id : ""

  async function handleCreateGoal(input: {
    memberId: string
    title: string
    goalType: ClientGoalType
    startValue: number
    targetValue: number
    targetDate: string
  }) {
    setSaving(true)
    setModalError(null)

    const member = members.find((item) => item.id === input.memberId)
    const memberName = member?.full_name?.trim()

    if (!memberName) {
      setModalError("Select a valid member.")
      setSaving(false)
      return
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      setModalError(authError?.message ?? "You must be signed in to create goals.")
      setSaving(false)
      return
    }

    const result = await createClientGoal(supabase, user.id, checkIns, {
      memberId: input.memberId,
      memberName,
      title: input.title,
      goalType: input.goalType,
      startValue: input.startValue,
      targetValue: input.targetValue,
      targetDate: input.targetDate,
    })

    if (result.error) {
      setModalError(result.error)
      setSaving(false)
      return
    }

    await onGoalsChange()
    setSaving(false)
    setModalCloseSignal((current) => current + 1)
    notifyCoachingCoreChanged()
  }

  return (
    <section>
      <ProgressProSectionHeader
        eyebrow="Goals tracking"
        title="Client goals"
        description={
          memberFilter === "all"
            ? "Track member targets with progress synced from check-in weight data."
            : `Goals for ${memberFilterLabel}, synced from their latest check-ins.`
        }
        accent="emerald"
        action={
          <button
            type="button"
            onClick={() => {
              setModalError(null)
              setModalOpen(true)
            }}
            disabled={loading || members.length === 0}
            className={PROGRESS_PRO_BTN_PRIMARY}
          >
            <Plus className="h-4 w-4" />
            Create goal
          </button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-64 w-full rounded-3xl" />
          ))}
        </div>
      ) : filteredGoals.length === 0 ? (
        <ProgressEmptyState
          {...SAAS_EMPTY.goals}
          description={
            memberFilter === "all"
              ? SAAS_EMPTY.goals.description
              : `Create a goal for ${memberFilterLabel} to track weight and body composition targets.`
          }
          icon={<Target className="h-5 w-5" />}
          action={
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              disabled={members.length === 0}
              className={PROGRESS_PRO_BTN_SECONDARY}
            >
              <Plus className="h-4 w-4" />
              Create goal
            </button>
          }
          compact
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filteredGoals.map((goal) => (
            <ClientGoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}

      {modalOpen ? (
        <CreateClientGoalModal
          members={members}
          defaultMemberId={defaultMemberId}
          saving={saving}
          errorMessage={modalError}
          onClose={() => {
            if (!saving) setModalOpen(false)
          }}
          closeSignal={modalCloseSignal}
          onSubmit={(input) => void handleCreateGoal(input)}
        />
      ) : null}
    </section>
  )
}

function ClientGoalCard({ goal }: { goal: ClientGoalViewModel }) {
  const statusStyles = STATUS_STYLES[goal.status]

  return (
    <article className={`${PROGRESS_PRO_CARD} p-6 transition hover:border-white/20`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-lg font-semibold text-white">{goal.title}</h4>
          <p className="mt-1 text-sm text-gray-400">
            {goal.memberName} · {goal.goalTypeLabel}
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusStyles.badge}`}
        >
          {statusStyles.label}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <MetricBlock label="Current" value={formatGoalValue(goal.currentValue)} highlight />
        <MetricBlock label="Target" value={formatGoalValue(goal.targetValue)} />
        <MetricBlock
          label="Remaining"
          value={formatGoalRemaining(goal.remainingAmount, goal.goalType)}
          className="sm:col-span-1 col-span-2"
        />
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-gray-400">Progress</span>
          <span className="font-semibold tabular-nums text-white">
            {goal.progressPercent}%
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-[#0b1224]">
          <div
            className={`h-full rounded-full transition-all ${statusStyles.bar}`}
            style={{ width: `${goal.progressPercent}%` }}
          />
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-[#0b1224]/50 px-4 py-3">
        <div className="flex items-start gap-2">
          <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" aria-hidden />
          <p className="text-sm text-gray-300">{goal.estimatedCompletionStatus}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-sm text-gray-400">
        <span className="inline-flex items-center gap-1.5">
          <CalendarCheck className="h-4 w-4 text-violet-400" aria-hidden />
          Target: {formatGoalTargetDate(goal.targetDate)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Flag className="h-4 w-4" aria-hidden />
          Start: {formatGoalValue(goal.startValue)}
        </span>
      </div>
    </article>
  )
}

function MetricBlock({
  label,
  value,
  highlight = false,
  className = "",
}: {
  label: string
  value: string
  highlight?: boolean
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-[#0b1224]/60 px-3 py-3 ${className}`}
    >
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p
        className={`mt-1 text-sm font-semibold tabular-nums ${highlight ? "text-cyan-400" : "text-white"}`}
      >
        {value}
      </p>
    </div>
  )
}
