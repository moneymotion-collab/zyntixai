"use client"

import { useMemo, useState } from "react"
import { Zap } from "lucide-react"
import AnalyticsKpiCards from "@/components/marketing/analytics/AnalyticsKpiCards"
import AnalyticsSummarySection from "@/components/marketing/analytics/AnalyticsSummarySection"
import AnalyticsAiInsightsSection from "@/components/marketing/analytics/AnalyticsAiInsightsSection"
import BestPerformingContent from "@/components/marketing/analytics/BestPerformingContent"
import BestPlatformCard from "@/components/marketing/analytics/BestPlatformCard"
import ContentPerformanceChart from "@/components/marketing/analytics/ContentPerformanceChart"
import ContentTypeBreakdownSection from "@/components/marketing/analytics/ContentTypeBreakdownSection"
import EngagementOverTimeChart from "@/components/marketing/analytics/EngagementOverTimeChart"
import ReachOverTimeChart from "@/components/marketing/analytics/ReachOverTimeChart"
import MarketingRecommendationsPanel from "@/components/marketing/MarketingRecommendationsPanel"
import { buildAnalyticsKpis } from "@/lib/marketing/analytics/analytics-kpis"
import { buildAnalyticsMonthSummary } from "@/lib/marketing/analytics/build-analytics-summary"
import {
  buildContentPerformanceChartData,
  buildTimeSeriesChartData,
} from "@/lib/marketing/analytics/analytics-chart-data"
import { buildAnalyticsAiInsights } from "@/lib/marketing/analytics/build-analytics-ai-insights"
import {
  buildBestPerformingPosts,
  getPlatformStats,
  type PlatformStat,
} from "@/lib/marketing/analytics/build-performance-summary"
import { buildContentTypeBreakdown } from "@/lib/marketing/analytics/content-type-breakdown"
import { resolveAnalyticsDisplay } from "@/lib/marketing/analytics/resolve-analytics-display"
import { DEMO_SECTION_GAP } from "@/components/marketing/analytics/demo-video-styles"
import type { AnalyticsRowWithPost } from "@/lib/marketing/fetch-analytics-rows"
import type { RecommendationRunSummary } from "@/lib/marketing/recommendations/generate-recommendations"

export default function MarketingAnalyticsContent({
  initialSummary,
  platformStats,
  rows,
  usingFallback = false,
}: {
  initialSummary: RecommendationRunSummary
  platformStats: PlatformStat[]
  rows: AnalyticsRowWithPost[]
  usingFallback?: boolean
}) {
  const [summary, setSummary] = useState(initialSummary)

  const { rows: displayRows, isDemo } = useMemo(
    () => resolveAnalyticsDisplay(rows, usingFallback),
    [rows, usingFallback],
  )

  const displayPlatformStats = useMemo(
    () => (isDemo ? getPlatformStats(displayRows) : platformStats),
    [displayRows, isDemo, platformStats],
  )

  const kpis = useMemo(() => buildAnalyticsKpis(displayRows), [displayRows])

  const monthSummary = useMemo(
    () => buildAnalyticsMonthSummary(displayRows),
    [displayRows],
  )

  const timeSeriesData = useMemo(
    () => buildTimeSeriesChartData(displayRows),
    [displayRows],
  )

  const contentPerformanceData = useMemo(
    () => buildContentPerformanceChartData(displayRows),
    [displayRows],
  )

  const bestPerformingPosts = useMemo(
    () => buildBestPerformingPosts(displayRows),
    [displayRows],
  )

  const contentTypeBreakdown = useMemo(
    () => buildContentTypeBreakdown(displayRows, isDemo),
    [displayRows, isDemo],
  )

  const aiInsights = useMemo(
    () => buildAnalyticsAiInsights(displayRows, displayPlatformStats, isDemo),
    [displayRows, displayPlatformStats, isDemo],
  )

  return (
    <div className={`flex flex-col ${DEMO_SECTION_GAP}`}>
      {isDemo ? (
        <div className="flex items-start gap-4 rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4 text-base text-violet-900">
          <Zap className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" />
          <div>
            <p className="text-lg font-bold">Sample fitness analytics preview</p>
            <p className="mt-1 font-medium text-violet-800/90">
              Demo data for personal trainers and gym owners. Publish and sync to
              see live metrics.
            </p>
          </div>
        </div>
      ) : null}

      <AnalyticsSummarySection summary={monthSummary} />

      <AnalyticsKpiCards kpis={kpis} />

      <div className="grid gap-6 xl:grid-cols-2">
        <ReachOverTimeChart data={timeSeriesData} />
        <EngagementOverTimeChart data={timeSeriesData} />
      </div>

      <ContentPerformanceChart data={contentPerformanceData} />

      <ContentTypeBreakdownSection breakdown={contentTypeBreakdown} />

      <BestPerformingContent posts={bestPerformingPosts} />

      <BestPlatformCard platformStats={displayPlatformStats} />

      <AnalyticsAiInsightsSection insights={aiInsights} />

      <MarketingRecommendationsPanel
        forceDemoRecommendations={isDemo}
        onGenerated={({ summary: nextSummary }) => {
          if (nextSummary) {
            setSummary(nextSummary)
          }
        }}
      />
    </div>
  )
}
