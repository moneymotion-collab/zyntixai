import { getAnalyticsTitle } from "@/lib/marketing/aggregate-content-performance"
import { estimateRowReach } from "@/lib/marketing/analytics/analytics-kpis"
import type { AnalyticsRowWithPost } from "@/lib/marketing/fetch-analytics-rows"
import { mockAnalyticsRows } from "@/lib/marketing/mock-analytics"
import { getRowEngagement } from "@/lib/marketing/recommendations/recommendation-data-thresholds"

export type TimeSeriesChartPoint = {
  label: string
  reach: number
  views: number
  engagement: number
}

export type ContentPerformanceChartPoint = {
  label: string
  fullTitle: string
  views: number
  reach: number
  engagement: number
}

const CONTENT_PERFORMANCE_LIMIT = 6

function weekLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function truncateLabel(title: string, max = 24): string {
  const trimmed = title.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1)}…`
}

function bucketTimeSeries(
  rows: AnalyticsRowWithPost[],
): TimeSeriesChartPoint[] {
  const buckets = new Map<
    string,
    { reach: number; views: number; engagement: number; sortKey: number }
  >()

  for (const row of rows) {
    const created = new Date(row.created_at)
    if (Number.isNaN(created.getTime())) continue

    const weekStart = new Date(created)
    weekStart.setDate(created.getDate() - created.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const key = weekStart.toISOString().slice(0, 10)
    const current = buckets.get(key) ?? {
      reach: 0,
      views: 0,
      engagement: 0,
      sortKey: weekStart.getTime(),
    }

    buckets.set(key, {
      reach: current.reach + estimateRowReach(row),
      views: current.views + row.views,
      engagement: current.engagement + getRowEngagement(row),
      sortKey: current.sortKey,
    })
  }

  return [...buckets.entries()]
    .sort((a, b) => a[1].sortKey - b[1].sortKey)
    .map(([key, bucket]) => ({
      label: weekLabel(new Date(key)),
      reach: bucket.reach,
      views: bucket.views,
      engagement: bucket.engagement,
    }))
}

function mapRowsToContentPerformance(
  rows: AnalyticsRowWithPost[],
): ContentPerformanceChartPoint[] {
  return [...rows]
    .sort((a, b) => b.views - a.views)
    .slice(0, CONTENT_PERFORMANCE_LIMIT)
    .map((row) => {
      const fullTitle = getAnalyticsTitle(row)

      return {
        label: truncateLabel(fullTitle),
        fullTitle,
        views: row.views,
        reach: estimateRowReach(row),
        engagement: getRowEngagement(row),
      }
    })
}

export function getDemoTimeSeriesChartData(): TimeSeriesChartPoint[] {
  return bucketTimeSeries(mockAnalyticsRows)
}

export function buildTimeSeriesChartData(
  rows: AnalyticsRowWithPost[],
): TimeSeriesChartPoint[] {
  return bucketTimeSeries(rows)
}

export function getDemoContentPerformanceChartData(): ContentPerformanceChartPoint[] {
  return mapRowsToContentPerformance(mockAnalyticsRows)
}

export function buildContentPerformanceChartData(
  rows: AnalyticsRowWithPost[],
): ContentPerformanceChartPoint[] {
  return mapRowsToContentPerformance(rows)
}

/** @deprecated Use buildTimeSeriesChartData */
export function buildEngagementChartSeries(
  rows: AnalyticsRowWithPost[],
): Array<{ label: string; views: number; engagement: number }> {
  return buildTimeSeriesChartData(rows).map(({ label, views, engagement }) => ({
    label,
    views,
    engagement,
  }))
}
