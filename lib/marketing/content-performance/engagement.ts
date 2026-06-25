import type { ContentPerformanceRow } from "@/lib/marketing/content-performance/types"

export function estimateContentPerformanceReach(
  row: Pick<ContentPerformanceRow, "views" | "shares" | "saves">,
): number {
  const amplified = row.shares * 2.8 + (row.saves ?? 0) * 1.6
  return Math.round(row.views * 0.78 + amplified)
}

export function getRowEngagementTotal(row: ContentPerformanceRow): number {
  return (
    row.likes + row.comments + row.shares + (row.saves ?? 0)
  )
}

export function getContentPerformanceEngagementRate(
  row: ContentPerformanceRow,
): number {
  if (row.views <= 0) return 0
  return (
    Math.round((getRowEngagementTotal(row) / row.views) * 1000) / 10
  )
}

export function withEngagementRate<
  T extends ContentPerformanceRow & { caption?: string | null },
>(row: T): T & { engagement_rate: number; reach: number } {
  return {
    ...row,
    engagement_rate: getContentPerformanceEngagementRate(row),
    reach: estimateContentPerformanceReach(row),
  }
}
