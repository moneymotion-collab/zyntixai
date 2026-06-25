"use client"

import { useCallback, useEffect, useState } from "react"
import { Zap } from "lucide-react"
import SyncRealAnalyticsButton from "@/components/marketing/SyncRealAnalyticsButton"
import AnalyticsErrorState from "@/components/marketing/content-performance/AnalyticsErrorState"
import AnalyticsLoadingSkeleton from "@/components/marketing/content-performance/AnalyticsLoadingSkeleton"
import ContentPerformanceAnalyticsDashboard from "@/components/marketing/content-performance/ContentPerformanceAnalyticsDashboard"
import { useIsDemoWorkspace } from "@/app/hooks/useIsDemoWorkspace"
import { buildMarketingAnalyticsApiResponse } from "@/lib/marketing/content-performance/build-api-response"
import type { MarketingAnalyticsApiResponse } from "@/lib/marketing/content-performance/build-api-response"
import { fetchMarketingAnalytics } from "@/lib/marketing/content-performance/fetch-marketing-analytics-client"
import { mockAnalyticsToContentPerformanceRows } from "@/lib/marketing/content-performance/mock-performance-rows"
import { mockAnalyticsRows } from "@/lib/marketing/mock-analytics"

export default function MarketingAnalyticsPageContent() {
  const { isDemoWorkspace: demoMode, loading: demoLoading } = useIsDemoWorkspace()
  const [data, setData] = useState<MarketingAnalyticsApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)

    if (demoMode) {
      const demoRows = mockAnalyticsToContentPerformanceRows(mockAnalyticsRows)
      setData(buildMarketingAnalyticsApiResponse(demoRows))
      setLoading(false)
      return
    }

    try {
      const response = await fetchMarketingAnalytics()
      setData(response)
    } catch (err) {
      setData(null)
      setError(err instanceof Error ? err.message : "Could not load analytics.")
    } finally {
      setLoading(false)
    }
  }, [demoMode])

  useEffect(() => {
    if (demoLoading) return
    void loadAnalytics()
  }, [demoLoading, loadAnalytics])

  if (loading) {
    return <AnalyticsLoadingSkeleton />
  }

  if (error) {
    return <AnalyticsErrorState message={error} onRetry={() => void loadAnalytics()} />
  }

  if (!data) {
    return (
      <AnalyticsErrorState
        message="No analytics data was returned."
        onRetry={() => void loadAnalytics()}
      />
    )
  }

  return (
    <div className="space-y-6">
      {demoMode ? (
        <div className="flex items-start gap-3 rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4 text-sm text-violet-900">
          <Zap className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" />
          <div>
            <p className="font-semibold">Demo analytics preview</p>
            <p className="mt-1 text-violet-800/90">
              Sample performance data for exploration. Live workspaces only show
              metrics synced from Instagram.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <SyncRealAnalyticsButton onSynced={() => void loadAnalytics()} />
        </div>
      )}

      <ContentPerformanceAnalyticsDashboard data={data} />
    </div>
  )
}
