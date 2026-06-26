"use client"

import Link from "next/link"
import { useRef, useState, useTransition } from "react"
import {
  ArrowRight,
  Bell,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  LayoutGrid,
  ListTodo,
  ScrollText,
} from "lucide-react"
import EmptyState from "@/components/ui/empty-state"
import GlassCard from "@/components/ui/glass-card"
import { renderEmptyStateAction } from "@/lib/copy/empty-state-presets"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import type {
  CoachTask,
  CoachTaskArea,
  CoachTaskKind,
  CoachTaskPriority,
} from "@/lib/coach-dashboard/compute-coach-tasks"
import { notifyCoachingCoreChanged } from "@/lib/coaching-core/notify"
import { updateMemberClientReminderStatus } from "@/lib/members/member-client-reminders"
import { createClient } from "@/lib/supabase/client"

type CoachTasksSectionProps = {
  tasks: CoachTask[]
  onTaskUpdated?: () => void
}

const PRIORITY_STYLES: Record<
  CoachTaskPriority,
  { badge: string; border: string }
> = {
  high: {
    badge: "border-red-500/30 bg-red-500/10 text-red-200",
    border: "border-red-500/20 hover:border-red-500/35",
  },
  medium: {
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    border: "border-amber-500/20 hover:border-amber-500/35",
  },
  low: {
    badge: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200",
    border: "border-cyan-500/20 hover:border-cyan-500/35",
  },
}

const AREA_ICONS: Record<CoachTaskArea, typeof ScrollText> = {
  Reminders: Bell,
  Sessions: CalendarClock,
  "Check-ins": ClipboardList,
  Progress: ScrollText,
}

const KIND_LABELS: Record<CoachTaskKind, string> = {
  open_reminder: "Open reminder",
  session_today: "Session today",
  check_in_follow_up: "Check-in follow-up",
  progress_update: "Progress update",
}

export default function CoachTasksSection({
  tasks,
  onTaskUpdated,
}: CoachTasksSectionProps) {
  const highCount = tasks.filter((task) => task.priority === "high").length

  return (
    <GlassCard className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.06] via-white/[0.02] to-cyan-500/[0.05] p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-emerald-400">
            Coach command center
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            Coach Tasks
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Open reminders, today&apos;s sessions, and clients needing check-in
            or progress follow-up — high priority reminders first.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-slate-300">
            <ListTodo className="h-4 w-4 text-emerald-400" aria-hidden />
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
          </span>
          {highCount > 0 ? (
            <span className="inline-flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-red-200">
              {highCount} high priority
            </span>
          ) : null}
          <Link
            href="/coach-workspace"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-xs font-medium uppercase tracking-wider text-cyan-300 transition hover:border-cyan-500/30 hover:text-cyan-200"
          >
            <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
            Open workspace
          </Link>
        </div>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          {...SAAS_EMPTY.coachTasks}
          icon={<CheckCircle2 className="h-6 w-6" />}
          action={renderEmptyStateAction("coachTasks")}
        />
      ) : (
        <ul className="relative grid grid-cols-1 gap-4 xl:grid-cols-2">
          {tasks.map((task) => (
            <CoachTaskCard
              key={task.id}
              task={task}
              onTaskUpdated={onTaskUpdated}
            />
          ))}
        </ul>
      )}
    </GlassCard>
  )
}

function CoachTaskCard({
  task,
  onTaskUpdated,
}: {
  task: CoachTask
  onTaskUpdated?: () => void
}) {
  const supabase = useRef(createClient()).current
  const [isPending, startTransition] = useTransition()
  const [actionError, setActionError] = useState<string | null>(null)
  const styles = PRIORITY_STYLES[task.priority]
  const AreaIcon = AREA_ICONS[task.relatedArea]

  const handleMarkReminderDone = () => {
    if (!task.reminderId) return

    setActionError(null)
    startTransition(async () => {
      const { error } = await updateMemberClientReminderStatus(
        supabase,
        task.reminderId!,
        "done",
      )

      if (error) {
        setActionError(error)
        return
      }

      notifyCoachingCoreChanged()
      onTaskUpdated?.()
    })
  }

  return (
    <li>
      <div
        className={`glass-panel rounded-2xl border p-4 sm:p-5 ${styles.border}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white">{task.title}</p>
            <p className="mt-1 text-sm font-medium text-cyan-200/90">
              {task.memberName}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${styles.badge}`}
          >
            {task.priorityLabel}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            <AreaIcon className="h-3 w-3 text-emerald-300" aria-hidden />
            {task.relatedArea}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
            {KIND_LABELS[task.kind]}
          </span>
        </div>

        <p className="mt-4 text-sm text-slate-300">{task.reason}</p>

        {actionError ? (
          <p className="mt-3 text-sm text-red-300">{actionError}</p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
          {task.reminderId ? (
            <button
              type="button"
              onClick={handleMarkReminderDone}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-sm font-medium text-emerald-200 transition hover:border-emerald-400/50 hover:bg-emerald-500/15 hover:text-white disabled:opacity-60"
            >
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              {isPending ? "Saving..." : "Mark reminder as done"}
            </button>
          ) : null}
          <Link
            href={`/members/${task.memberId}`}
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-2 text-sm font-medium text-cyan-200 transition hover:border-cyan-400/50 hover:bg-cyan-500/15 hover:text-white"
          >
            Open client
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <Link
            href="/coach-workspace"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:border-white/15 hover:bg-white/[0.05] hover:text-white"
          >
            <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
            Open Coach Workspace
          </Link>
        </div>
      </div>
    </li>
  )
}
