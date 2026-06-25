"use client"

import {
  AlertTriangle,
  Battery,
  Moon,
  Scale,
  Sparkles,
  type LucideIcon,
} from "lucide-react"
import { ProgressProSectionHeader } from "@/components/progress/progress-pro-ui"
import { PROGRESS_PRO_CARD } from "@/components/progress/progress-pro-ui"
import {
  formatAverageScore,
  formatAverageWeightChange,
  type ClientCheckInInsights,
} from "@/lib/progress/compute-client-checkin-insights"

type ClientCheckInInsightsCardsProps = {
  insights: ClientCheckInInsights
  loading?: boolean
  memberFilterLabel?: string
}

type InsightCardConfig = {
  label: string
  value: string
  icon: LucideIcon
  accent: string
}

function InsightCard({
  label,
  value,
  icon: Icon,
  accent,
  loading,
}: InsightCardConfig & { loading?: boolean }) {
  return (
    <div className={`${PROGRESS_PRO_CARD} p-6 transition hover:border-white/15`}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{label}</p>
        <Icon className={`h-5 w-5 ${accent}`} aria-hidden />
      </div>
      {loading ? (
        <div className="skeleton-shimmer mt-4 h-9 w-24 rounded-lg" />
      ) : (
        <p className="mt-4 text-3xl font-bold tabular-nums text-white">{value}</p>
      )}
    </div>
  )
}

export default function ClientCheckInInsightsCards({
  insights,
  loading = false,
  memberFilterLabel = "All members",
}: ClientCheckInInsightsCardsProps) {
  const cards: InsightCardConfig[] = [
    {
      label: "Average weight change",
      value: formatAverageWeightChange(insights.averageWeightChange),
      icon: Scale,
      accent: "text-cyan-400",
    },
    {
      label: "Average energy",
      value: formatAverageScore(insights.averageEnergy),
      icon: Battery,
      accent: "text-emerald-400",
    },
    {
      label: "Average sleep",
      value: formatAverageScore(insights.averageSleep),
      icon: Moon,
      accent: "text-violet-400",
    },
    {
      label: "Average motivation",
      value: formatAverageScore(insights.averageMotivation),
      icon: Sparkles,
      accent: "text-pink-400",
    },
    {
      label: "Members needing attention",
      value: String(insights.membersNeedingAttention),
      icon: AlertTriangle,
      accent: "text-amber-400",
    },
  ]

  return (
    <div>
      <ProgressProSectionHeader
        eyebrow="Check-in insights"
        title="Premium progress insights"
        description={
          memberFilterLabel === "All members"
            ? "Averages from each member's latest check-in. Weight change compares the two most recent logged weights."
            : `Insights for ${memberFilterLabel}. Weight change compares their two most recent logged weights.`
        }
        accent="cyan"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <InsightCard key={card.label} {...card} loading={loading} />
        ))}
      </div>
    </div>
  )
}
