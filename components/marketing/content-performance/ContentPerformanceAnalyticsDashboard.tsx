"use client"

import AnalyticsEmptyState from "@/components/marketing/content-performance/AnalyticsEmptyState"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import ContentPerformanceEngagementChart from "@/components/marketing/content-performance/ContentPerformanceEngagementChart"
import ContentPerformanceKpiCards from "@/components/marketing/content-performance/ContentPerformanceKpiCards"
import ContentPerformanceRecommendationsSection from "@/components/marketing/content-performance/ContentPerformanceRecommendationsSection"
import PlatformPerformanceChart from "@/components/marketing/content-performance/PlatformPerformanceChart"
import {
  BestPerformingPostCard,
  WorstPerformingPostCard,
} from "@/components/marketing/content-performance/PostPerformanceCards"
import RuleBasedInsightsSection from "@/components/marketing/content-performance/RuleBasedInsightsSection"
import ViewsOverTimeChart from "@/components/marketing/content-performance/ViewsOverTimeChart"
import type { MarketingAnalyticsApiResponse } from "@/lib/marketing/content-performance/build-api-response"
import { mapTotalsToKpis } from "@/lib/marketing/content-performance/map-api-to-kpis"

export default function ContentPerformanceAnalyticsDashboard({
  data,
}: {
  data: MarketingAnalyticsApiResponse
}) {
  if (data.empty) {
    return (
      <AnalyticsEmptyState
        title={data.message ?? SAAS_EMPTY.marketingAnalytics.title}
      />
    )
  }

  const kpis = mapTotalsToKpis(data.totals, data.averages)
  const showPlatformChart = data.charts.platformPerformance.length > 1

  return (
    <div className="space-y-6">
      <ContentPerformanceKpiCards kpis={kpis} />

      <div className="grid gap-6 lg:grid-cols-2">
        {data.bestPost ? <BestPerformingPostCard post={data.bestPost} /> : null}
        {data.worstPost &&
        data.worstPostAdvice &&
        data.worstPost.id !== data.bestPost?.id ? (
          <WorstPerformingPostCard
            post={data.worstPost}
            advice={data.worstPostAdvice}
          />
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ContentPerformanceEngagementChart
          data={data.charts.engagementOverTime}
        />
        <ViewsOverTimeChart data={data.charts.viewsOverTime} />
      </div>

      {showPlatformChart ? (
        <PlatformPerformanceChart data={data.charts.platformPerformance} />
      ) : null}

      <RuleBasedInsightsSection insights={data.insights} />

      {data.recommendations ? (
        <ContentPerformanceRecommendationsSection
          recommendations={data.recommendations}
        />
      ) : null}
    </div>
  )
}
