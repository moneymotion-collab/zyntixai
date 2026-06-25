"use client"

import Link from "next/link"
import { Check, ListTodo, X } from "lucide-react"
import EmptyState from "@/components/ui/empty-state"
import GlassCard from "@/components/ui/glass-card"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import type { TaskStatus, TodayTask } from "@/lib/coach-workspace/types"

type TodayTasksPanelProps = {
  tasks: TodayTask[]
  taskStatuses: Record<string, TaskStatus>
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onSelectMember: (memberId: string) => void
  filter: TaskStatus
  onFilterChange: (filter: TaskStatus) => void
}

const FILTERS: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To do" },
  { value: "done", label: "Done" },
  { value: "dismissed", label: "Dismissed" },
]

export default function TodayTasksPanel({
  tasks,
  taskStatuses,
  onStatusChange,
  onSelectMember,
  filter,
  onFilterChange,
}: TodayTasksPanelProps) {
  const filteredTasks = tasks.filter((task) => {
    const status = taskStatuses[task.id] ?? "todo"
    return status === filter
  })

  return (
    <GlassCard className="p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-indigo-400/80">
            Daily workflow
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">Today&apos;s Tasks</h2>
          <p className="mt-1 text-sm text-slate-400">
            Rule-based follow-ups generated from live member data.
          </p>
        </div>
        <div className="flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onFilterChange(item.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                filter === item.value
                  ? "bg-indigo-500/20 text-indigo-200"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <EmptyState
          {...(filter === "todo"
            ? SAAS_EMPTY.coachTasks
            : SAAS_EMPTY.workspaceTasksFiltered)}
          icon={<ListTodo className="h-6 w-6" />}
          action={
            filter === "todo" ? (
              <Link href="/dashboard" className="btn-gradient">
                Open dashboard tasks
              </Link>
            ) : undefined
          }
        />
      ) : (
        <ul className="space-y-3">
          {filteredTasks.map((task) => (
            <li
              key={task.id}
              className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3"
            >
              <button
                type="button"
                onClick={() => onSelectMember(task.memberId)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="font-medium text-white">{task.title}</p>
                <p className="text-sm text-slate-400">{task.description}</p>
              </button>
              {filter === "todo" ? (
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => onStatusChange(task.id, "done")}
                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-200 transition hover:bg-emerald-500/20"
                  >
                    <Check className="h-3.5 w-3.5" aria-hidden />
                    Done
                  </button>
                  <button
                    type="button"
                    onClick={() => onStatusChange(task.id, "dismissed")}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                    Dismiss
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onStatusChange(task.id, "todo")}
                  className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:text-white"
                >
                  Reopen
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  )
}
