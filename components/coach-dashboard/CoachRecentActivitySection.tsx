"use client"

import Link from "next/link"
import {
  Apple,
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  ClipboardList,
  LayoutGrid,
  ScrollText,
  Target,
  User,
} from "lucide-react"
import EmptyState from "@/components/ui/empty-state"
import GlassCard from "@/components/ui/glass-card"
import { formatCoachActivityRelativeTime } from "@/lib/coach-dashboard/build-coach-recent-activity"
import type { RecentActivityItem } from "@/lib/coach-dashboard/types"
import { renderEmptyStateAction } from "@/lib/copy/empty-state-presets"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import type { LucideIcon } from "lucide-react"

type CoachRecentActivitySectionProps = {
  items: RecentActivityItem[]
}

const ACTIVITY_ICONS: Record<RecentActivityItem["type"], LucideIcon> = {
  client_checkin: ClipboardList,
  workout_completion: CheckCircle2,
  nutrition_assignment: Apple,
  progress_log: ScrollText,
  goal_update: Target,
  session: CalendarClock,
  new_member: User,
  workout_plan: CheckCircle2,
  nutrition_plan: Apple,
  session_booked: CalendarPlus,
}

export default function CoachRecentActivitySection({
  items,
}: CoachRecentActivitySectionProps) {
  return (
    <GlassCard className="relative overflow-hidden border-indigo-500/20 bg-gradient-to-br from-indigo-500/[0.05] via-white/[0.02] to-violet-500/[0.04] p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-indigo-400">
          Command center feed
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
          Recent Activity
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-400">
          Latest check-ins, workouts, nutrition, progress, goals, and sessions
          across your roster.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          {...SAAS_EMPTY.recentActivity}
          icon={<ScrollText className="h-6 w-6" />}
          action={renderEmptyStateAction("recentActivity")}
        />
      ) : (
        <ul className="relative space-y-3">
          {items.map((item) => {
            const Icon = ACTIVITY_ICONS[item.type]

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="glass-panel flex items-start gap-3 rounded-2xl px-4 py-3.5 transition duration-200 hover:border-white/15 hover:bg-white/[0.04]"
                >
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-indigo-500/10 text-indigo-300">
                    <Icon className="h-4 w-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.subtitle} · {formatCoachActivityRelativeTime(item.timestamp)}
                    </p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </GlassCard>
  )
}
