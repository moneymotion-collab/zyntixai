"use client"

import { Minus, TrendingDown, TrendingUp } from "lucide-react"
import {
  getProgressTrend,
  TREND_BADGE_STYLES,
  type ProgressTrend,
} from "@/lib/progress/progress-trend"

type ProgressTrendBadgeProps = {
  metric: string | null | undefined
  changeValue: number | null | undefined
  trend?: ProgressTrend
}

const TREND_ICONS = {
  improving: TrendingUp,
  declining: TrendingDown,
  stable: Minus,
} as const

export default function ProgressTrendBadge({
  metric,
  changeValue,
  trend,
}: ProgressTrendBadgeProps) {
  const resolved = trend ?? getProgressTrend(metric, changeValue)
  const styles = TREND_BADGE_STYLES[resolved]
  const Icon = TREND_ICONS[resolved]

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles.className}`}
    >
      <Icon className="h-3 w-3" />
      {styles.label}
    </span>
  )
}
