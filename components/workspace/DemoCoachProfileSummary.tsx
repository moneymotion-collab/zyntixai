"use client"

import {
  CalendarClock,
  Dumbbell,
  Megaphone,
  Sparkles,
  Users,
  UtensilsCrossed,
  Video,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { FITCORE_AI_BRAND_NAME } from "@/lib/brand/fitcore-ai"
import { useIsDemoWorkspace } from "@/app/hooks/useIsDemoWorkspace"
import {
  COACH_DASHBOARD_GRID_GAP,
  DashboardSectionHeader,
} from "@/components/coach-dashboard/coach-dashboard-ui"
import DashboardStatCard from "@/components/ui/dashboard-stat-card"
import {
  DEMO_COACH_PROFILE_NAME,
  DEMO_COACH_PROFILE_STATS,
} from "@/lib/demo/demo-coach-profile"

const STAT_ICONS: Record<string, LucideIcon> = {
  Members: Users,
  "Workout Plans": Dumbbell,
  "Nutrition Plans": UtensilsCrossed,
  Sessions: CalendarClock,
  "Marketing Posts": Megaphone,
  "Video Campaigns": Video,
}

const STAT_ACCENTS: Record<string, string> = {
  Members: "from-indigo-500/25 to-blue-500/10 text-indigo-300",
  "Workout Plans": "from-emerald-500/25 to-teal-500/10 text-emerald-300",
  "Nutrition Plans": "from-amber-500/25 to-orange-500/10 text-amber-300",
  Sessions: "from-sky-500/25 to-cyan-500/10 text-sky-300",
  "Marketing Posts": "from-violet-500/25 to-purple-500/10 text-violet-300",
  "Video Campaigns": "from-rose-500/25 to-pink-500/10 text-rose-300",
}

export default function DemoCoachProfileSummary() {
  const { isDemoWorkspace, loading } = useIsDemoWorkspace()

  if (loading || !isDemoWorkspace) {
    return null
  }

  return (
    <section aria-label="Demo coach profile" className="mb-0">
      <DashboardSectionHeader
        eyebrow="Demo coach profile"
        title={DEMO_COACH_PROFILE_NAME}
        description={`A fully loaded ${FITCORE_AI_BRAND_NAME} coaching business — explore members, plans, marketing, and video campaigns.`}
        badge={
          <span className="badge-premium">
            <Sparkles className="h-3 w-3 text-cyan-300" aria-hidden />
            Demo Profile
          </span>
        }
      />

      <div
        className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 ${COACH_DASHBOARD_GRID_GAP}`}
      >
        {DEMO_COACH_PROFILE_STATS.map((stat) => (
          <DashboardStatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={STAT_ICONS[stat.label]}
            accent={STAT_ACCENTS[stat.label]}
            detail={stat.detail}
          />
        ))}
      </div>
    </section>
  )
}
