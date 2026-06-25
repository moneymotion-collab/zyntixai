import { getRowEngagementTotal } from "@/lib/marketing/content-performance/engagement"
import { getContentPerformanceTimestamp } from "@/lib/marketing/content-performance/timestamp"
import type {
  ContentPerformanceRow,
  ContentPerformanceTimePoint,
  PlatformPerformancePoint,
} from "@/lib/marketing/content-performance/types"
import { buildPlatformPerformance } from "@/lib/marketing/content-performance/analytics-engine"

function weekLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

export function buildEngagementOverTimeData(
  rows: ContentPerformanceRow[],
): ContentPerformanceTimePoint[] {
  const buckets = new Map<
    string,
    { views: number; engagement: number; sortKey: number }
  >()

  for (const row of rows) {
    const recorded = new Date(getContentPerformanceTimestamp(row))
    if (Number.isNaN(recorded.getTime())) continue

    const weekStart = new Date(recorded)
    weekStart.setDate(recorded.getDate() - recorded.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const key = weekStart.toISOString().slice(0, 10)
    const current = buckets.get(key) ?? {
      views: 0,
      engagement: 0,
      sortKey: weekStart.getTime(),
    }

    buckets.set(key, {
      views: current.views + row.views,
      engagement: current.engagement + getRowEngagementTotal(row),
      sortKey: current.sortKey,
    })
  }

  return [...buckets.entries()]
    .sort((a, b) => a[1].sortKey - b[1].sortKey)
    .map(([key, bucket]) => ({
      label: weekLabel(new Date(key)),
      views: bucket.views,
      engagement: bucket.engagement,
    }))
}

export function buildViewsOverTimeData(
  rows: ContentPerformanceRow[],
): ContentPerformanceTimePoint[] {
  return buildEngagementOverTimeData(rows)
}

export function buildPlatformChartData(
  rows: ContentPerformanceRow[],
): PlatformPerformancePoint[] {
  return buildPlatformPerformance(rows)
}
