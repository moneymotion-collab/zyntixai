"use client"

import { Lightbulb, Megaphone, Share2, Sparkles, Video } from "lucide-react"
import { COACH_DASHBOARD_CARD_PADDING, COACH_DASHBOARD_GRID_GAP } from "@/components/coach-dashboard/coach-dashboard-ui"
import GlassCard from "@/components/ui/glass-card"
import type { AiActivityStats } from "@/lib/coach-dashboard/ai-activity-stats"

type CoachAiActivityCardProps = {
  aiActivity: AiActivityStats
  loading?: boolean
}

const METRICS = [
  {
    key: "contentIdeas" as const,
    label: "Content Ideas",
    icon: Lightbulb,
    accent: "from-amber-500/20 to-orange-500/10 text-amber-300",
  },
  {
    key: "campaigns" as const,
    label: "Campaigns",
    icon: Megaphone,
    accent: "from-violet-500/20 to-purple-500/10 text-violet-300",
  },
  {
    key: "videos" as const,
    label: "Videos",
    icon: Video,
    accent: "from-cyan-500/20 to-sky-500/10 text-cyan-300",
  },
  {
    key: "publishedPosts" as const,
    label: "Published Posts",
    icon: Share2,
    accent: "from-emerald-500/20 to-teal-500/10 text-emerald-300",
  },
]

export default function CoachAiActivityCard({
  aiActivity,
  loading,
}: CoachAiActivityCardProps) {
  return (
    <GlassCard className={`relative overflow-hidden border-indigo-500/20 bg-gradient-to-br from-indigo-500/[0.06] via-white/[0.02] to-violet-500/[0.05] ${COACH_DASHBOARD_CARD_PADDING}`}>
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-indigo-500/20 to-violet-500/10 text-indigo-300">
          <Sparkles className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-indigo-400">
            Marketing AI
          </p>
          <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">AI Activity</h2>
          <p className="mt-1 text-sm text-slate-400">
            Your AI marketing engine activity this month
          </p>
        </div>
      </div>

      <div className={`relative grid grid-cols-1 sm:grid-cols-2 ${COACH_DASHBOARD_GRID_GAP}`}>
        {METRICS.map((metric) => {
          const Icon = metric.icon
          return (
            <div
              key={metric.key}
              className="glass-panel flex items-center gap-4 rounded-2xl px-4 py-4"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br ${metric.accent}`}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  {metric.label}
                </p>
                {loading ? (
                  <div className="mt-2 h-8 w-12 animate-pulse rounded-lg bg-white/10" />
                ) : (
                  <p className="mt-1 text-2xl font-bold tabular-nums text-white sm:text-3xl">
                    {aiActivity[metric.key]}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </GlassCard>
  )
}

export function CoachAiActivitySkeleton() {
  return (
    <div className="glass-panel space-y-6 bg-gradient-to-br from-indigo-500/[0.06] via-white/[0.02] to-violet-500/[0.05] p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-white/10" />
        <div className="space-y-2">
          <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
          <div className="h-7 w-36 animate-pulse rounded-xl bg-white/10" />
          <div className="h-4 w-64 max-w-full animate-pulse rounded bg-white/10" />
        </div>
      </div>
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${COACH_DASHBOARD_GRID_GAP}`}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="glass-panel rounded-2xl px-4 py-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 animate-pulse rounded-xl bg-white/10" />
              <div className="space-y-2">
                <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
                <div className="h-8 w-10 animate-pulse rounded-lg bg-white/10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
