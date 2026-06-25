"use client"

import { CheckCircle2, Clock, Flag, Target } from "lucide-react"
import ProgressEmptyState from "@/components/progress/ProgressEmptyState"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import {
  formatGoalTargetDate,
  formatGoalValue,
  type ClientGoalViewModel,
} from "@/lib/progress/client-goals"

type MemberGoalsDetailSectionProps = {
  goals: ClientGoalViewModel[]
}

export default function MemberGoalsDetailSection({
  goals,
}: MemberGoalsDetailSectionProps) {
  const activeGoals = goals.filter((goal) => goal.status !== "completed")
  const completedGoals = goals.filter((goal) => goal.status === "completed")

  return (
    <section className="mb-8">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-400">
          Goals
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white">Active goals & milestones</h2>
        <p className="mt-1 text-sm text-gray-400">
          Progress toward targets with deadlines and status
        </p>
      </div>

      {goals.length === 0 ? (
        <ProgressEmptyState
          {...SAAS_EMPTY.goals}
          icon={<Target className="h-5 w-5" />}
        />
      ) : (
        <div className="space-y-8">
          {activeGoals.length > 0 ? (
            <div>
              <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-400">
                Active ({activeGoals.length})
              </h3>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {activeGoals.map((goal) => (
                  <GoalDetailCard key={goal.id} goal={goal} />
                ))}
              </div>
            </div>
          ) : null}

          {completedGoals.length > 0 ? (
            <div>
              <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-400">
                Completed
              </h3>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {completedGoals.map((goal) => (
                  <GoalDetailCard key={goal.id} goal={goal} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}

function daysUntilTargetDate(targetDate: string): number {
  const target = new Date(`${targetDate}T23:59:59`).getTime()
  return Math.ceil((target - Date.now()) / (24 * 60 * 60 * 1000))
}

function GoalDetailCard({ goal }: { goal: ClientGoalViewModel }) {
  const statusStyles = STATUS_STYLES[goal.status]
  const daysRemaining = daysUntilTargetDate(goal.targetDate)

  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{goal.title}</h3>
          <p className="mt-1 text-sm text-gray-400">{goal.goalTypeLabel}</p>
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusStyles.badge}`}
        >
          {statusStyles.label}
        </span>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-gray-400">Progress</span>
          <span className="font-semibold text-white">{goal.progressPercent}%</span>
        </div>
        <div className="relative h-3 overflow-hidden rounded-full bg-[#0b1224]">
          <div
            className={`h-full rounded-full transition-all ${statusStyles.bar}`}
            style={{ width: `${goal.progressPercent}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <MetricPill label="Start" value={formatGoalValue(goal.startValue)} />
        <MetricPill label="Current" value={formatGoalValue(goal.currentValue)} highlight />
        <MetricPill label="Target" value={formatGoalValue(goal.targetValue)} />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-sm">
        <div className="flex items-center gap-2 text-gray-400">
          <Clock className="h-4 w-4" />
          {goal.status === "completed" ? (
            <span className="flex items-center gap-1.5 text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              Completed
            </span>
          ) : daysRemaining >= 0 ? (
            <span>{daysRemaining} days remaining</span>
          ) : (
            <span className="text-amber-300">
              {Math.abs(daysRemaining)} days overdue
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <Flag className="h-4 w-4" />
          <span>Target: {formatGoalTargetDate(goal.targetDate)}</span>
        </div>
      </div>
    </article>
  )
}

function MetricPill({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1224] px-3 py-2">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p
        className={`mt-1 font-semibold tabular-nums ${highlight ? "text-cyan-400" : "text-white"}`}
      >
        {value}
      </p>
    </div>
  )
}

const STATUS_STYLES = {
  on_track: {
    label: "On Track",
    badge: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200",
    bar: "bg-cyan-400",
  },
  behind_schedule: {
    label: "Behind Schedule",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    bar: "bg-amber-400",
  },
  completed: {
    label: "Completed",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    bar: "bg-emerald-400",
  },
} as const
