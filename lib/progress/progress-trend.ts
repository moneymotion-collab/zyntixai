import { improvementScore } from "@/lib/progress/metrics"

export type ProgressTrend = "improving" | "declining" | "stable"

export function getProgressTrend(
  metric: string | null | undefined,
  changeValue: number | null | undefined,
): ProgressTrend {
  const score = improvementScore(metric, changeValue)
  if (score == null || score === 0) return "stable"
  return score > 0 ? "improving" : "declining"
}

export const TREND_BADGE_STYLES: Record<
  ProgressTrend,
  { label: string; className: string }
> = {
  improving: {
    label: "Improving",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  },
  declining: {
    label: "Declining",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  },
  stable: {
    label: "Stable",
    className: "border-slate-500/30 bg-slate-500/10 text-slate-300",
  },
}
