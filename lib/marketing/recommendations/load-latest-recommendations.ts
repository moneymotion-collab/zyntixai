import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import {
  formatRecommendationView,
  type RecommendationView,
} from "@/lib/marketing/recommendations/format-recommendation"
import { fetchRecommendationPerformanceRows } from "@/lib/marketing/recommendations/fetch-recommendation-rows"
import {
  resolveRecommendationReadiness,
  type RecommendationReadiness,
} from "@/lib/marketing/recommendations/recommendation-readiness"
import { buildRecommendationDataSnapshot } from "@/lib/marketing/recommendations/recommendation-data-thresholds"

export type LoadRecommendationsResult = {
  data: RecommendationView[]
  runId: string | null
  readiness: RecommendationReadiness
  error: string | null
}

export async function loadLatestMarketingRecommendations(
  supabase: SupabaseClient<Database>,
  brandId: string,
  userId: string,
): Promise<LoadRecommendationsResult> {
  const { data: performanceRows, error: performanceError } =
    await fetchRecommendationPerformanceRows(supabase, userId, brandId)

  if (performanceError) {
    return {
      data: [],
      runId: null,
      readiness: resolveRecommendationReadiness({
        postCount: 0,
        totalViews: 0,
      }),
      error: performanceError.message,
    }
  }

  const snapshot = buildRecommendationDataSnapshot(performanceRows ?? [])

  const { data: latestRun, error: latestRunError } = await supabase
    .from("marketing_recommendations")
    .select("run_id, created_at")
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latestRunError) {
    return {
      data: [],
      runId: null,
      readiness: resolveRecommendationReadiness({
        postCount: snapshot.rowCount,
        totalViews: snapshot.totalViews,
      }),
      error: latestRunError.message,
    }
  }

  const latestRunId = latestRun?.run_id ?? null

  if (!latestRunId) {
    return {
      data: [],
      runId: null,
      readiness: resolveRecommendationReadiness({
        postCount: snapshot.rowCount,
        totalViews: snapshot.totalViews,
        hasRecommendations: false,
      }),
      error: null,
    }
  }

  const { data: rows, error: rowsError } = await supabase
    .from("marketing_recommendations")
    .select("*")
    .eq("brand_id", brandId)
    .eq("run_id", latestRunId)
    .order("priority", { ascending: false })

  if (rowsError) {
    return {
      data: [],
      runId: null,
      readiness: resolveRecommendationReadiness({
        postCount: snapshot.rowCount,
        totalViews: snapshot.totalViews,
      }),
      error: rowsError.message,
    }
  }

  const recommendations = (rows ?? []).map(formatRecommendationView)

  return {
    data: recommendations,
    runId: latestRunId,
    readiness: resolveRecommendationReadiness({
      postCount: snapshot.rowCount,
      totalViews: snapshot.totalViews,
      hasRecommendations: recommendations.length > 0,
    }),
    error: null,
  }
}
