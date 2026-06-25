import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import type { BrandProfile } from "@/lib/marketing/brand-profile"
import {
  buildBusinessSummary,
  type RecentContentPost,
} from "@/lib/marketing/coach/build-business-summary"
import {
  buildCoachAnalyticsSummary,
  formatCoachAnalyticsSummaryBlock,
  type CoachAnalyticsSummary,
} from "@/lib/marketing/coach/build-coach-analytics-summary"
import type { AnalyticsRowWithPost } from "@/lib/marketing/fetch-analytics-rows"
import {
  fetchAnalyticsRows,
  fetchAnalyticsRowsByBrandId,
} from "@/lib/marketing/fetch-analytics-rows"
import { fetchContentPerformanceRows } from "@/lib/marketing/content-performance/fetch-rows"
import type { ContentPerformanceRow } from "@/lib/marketing/content-performance/types"
import type { MarketingSettings } from "@/lib/marketing/marketing-settings"
import type { RecommendationView } from "@/lib/marketing/recommendations/format-recommendation"
import { loadLatestMarketingRecommendations } from "@/lib/marketing/recommendations/load-latest-recommendations"

const RECENT_POSTS_LIMIT = 8
const PERFORMANCE_ROWS_LIMIT = 25

const RECENT_POST_SELECT =
  "id, title, caption, platform, status, content_type, category, topic, scheduled_at, published_at, viral_score, created_at, updated_at"

export type MarketingCoachContext = {
  brandId: string | null
  brandName: string
  brand: BrandProfile | null
  marketingSettings: MarketingSettings | null
  contentPerformance: ContentPerformanceRow[]
  recentPosts: RecentContentPost[]
  businessSummary: string
  rows: AnalyticsRowWithPost[]
  analyticsSummary: CoachAnalyticsSummary
  recommendations: RecommendationView[]
}

async function loadAnalyticsRowsForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  brandId: string | null,
): Promise<{ data: AnalyticsRowWithPost[]; error: string | null }> {
  if (brandId) {
    const brandScoped = await fetchAnalyticsRowsByBrandId(supabase, brandId, {
      userId,
      isAdmin: false,
    })
    if (brandScoped.error) {
      return { data: [], error: brandScoped.error.message }
    }

    const brandRows = brandScoped.data ?? []
    if (brandRows.length > 0) {
      return { data: brandRows, error: null }
    }
  }

  const allRows = await fetchAnalyticsRows(supabase, {
    userId,
    isAdmin: false,
  })
  if (allRows.error) {
    return { data: [], error: allRows.error.message }
  }

  return { data: allRows.data ?? [], error: null }
}

async function fetchRecentContentPosts(
  supabase: SupabaseClient<Database>,
  userId: string,
  brandId: string | null,
): Promise<{ data: RecentContentPost[]; error: string | null }> {
  let query = supabase
    .from("content_posts")
    .select(RECENT_POST_SELECT)
    .order("updated_at", { ascending: false })
    .limit(RECENT_POSTS_LIMIT)

  if (brandId) {
    query = query.eq("brand_id", brandId)
  } else {
    query = query.eq("created_by", userId)
  }

  const { data, error } = await query

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: (data ?? []) as RecentContentPost[], error: null }
}

export async function loadMarketingCoachContext(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ data: MarketingCoachContext; error: string | null }> {
  const { data: brand, error: brandError } = await supabase
    .from("brand_profiles")
    .select("*")
    .eq("owner_id", userId)
    .maybeSingle()

  if (brandError) {
    return { data: emptyCoachContext(), error: brandError.message }
  }

  const brandId = brand?.id ?? null
  const brandName = brand?.name?.trim() || "Your brand"

  const [
    settingsResult,
    performanceResult,
    recentPostsResult,
    analyticsResult,
    recommendationsResult,
  ] = await Promise.all([
    supabase
      .from("marketing_settings")
      .select("*")
      .eq("owner_id", userId)
      .maybeSingle(),
    fetchContentPerformanceRows(supabase, userId, false).then((result) => ({
      data: (result.data ?? []).slice(0, PERFORMANCE_ROWS_LIMIT),
      error: result.error?.message ?? null,
    })),
    fetchRecentContentPosts(supabase, userId, brandId),
    loadAnalyticsRowsForUser(supabase, userId, brandId),
    brandId
      ? loadLatestMarketingRecommendations(supabase, brandId, userId)
      : Promise.resolve({
          data: [],
          runId: null,
          readiness: null,
          error: null,
        }),
  ])

  if (settingsResult.error) {
    return { data: emptyCoachContext(brandId, brandName, brand), error: settingsResult.error.message }
  }

  if (performanceResult.error) {
    return {
      data: emptyCoachContext(brandId, brandName, brand, settingsResult.data),
      error: performanceResult.error,
    }
  }

  if (recentPostsResult.error) {
    return {
      data: emptyCoachContext(
        brandId,
        brandName,
        brand,
        settingsResult.data,
        performanceResult.data,
      ),
      error: recentPostsResult.error,
    }
  }

  if (analyticsResult.error) {
    return {
      data: emptyCoachContext(
        brandId,
        brandName,
        brand,
        settingsResult.data,
        performanceResult.data,
        recentPostsResult.data,
      ),
      error: analyticsResult.error,
    }
  }

  if (recommendationsResult.error) {
    return {
      data: emptyCoachContext(
        brandId,
        brandName,
        brand,
        settingsResult.data,
        performanceResult.data,
        recentPostsResult.data,
        analyticsResult.data,
      ),
      error: recommendationsResult.error,
    }
  }

  const marketingSettings = settingsResult.data
  const contentPerformance = performanceResult.data
  const recentPosts = recentPostsResult.data
  const rows = analyticsResult.data

  const businessSummary = buildBusinessSummary({
    brand,
    marketingSettings,
    contentPerformance,
    recentPosts,
  })

  return {
    data: {
      brandId,
      brandName,
      brand,
      marketingSettings,
      contentPerformance,
      recentPosts,
      businessSummary,
      rows,
      analyticsSummary: buildCoachAnalyticsSummary(rows),
      recommendations: recommendationsResult.data,
    },
    error: null,
  }
}

function emptyCoachContext(
  brandId: string | null = null,
  brandName = "Your brand",
  brand: BrandProfile | null = null,
  marketingSettings: MarketingSettings | null = null,
  contentPerformance: ContentPerformanceRow[] = [],
  recentPosts: RecentContentPost[] = [],
  rows: AnalyticsRowWithPost[] = [],
): MarketingCoachContext {
  const businessSummary = buildBusinessSummary({
    brand,
    marketingSettings,
    contentPerformance,
    recentPosts,
  })

  return {
    brandId,
    brandName,
    brand,
    marketingSettings,
    contentPerformance,
    recentPosts,
    businessSummary,
    rows,
    analyticsSummary: buildCoachAnalyticsSummary(rows),
    recommendations: [],
  }
}

function formatRecommendationsBlock(
  recommendations: RecommendationView[],
): string {
  if (recommendations.length === 0) {
    return "No stored AI recommendations yet."
  }

  return recommendations
    .map((item, index) => {
      return [
        `${index + 1}. ${item.title} [priority: ${item.priority}]`,
        `   Insight: ${item.insight}`,
        `   Action: ${item.action}`,
      ].join("\n")
    })
    .join("\n\n")
}

export function formatMarketingCoachContextBlock(
  context: MarketingCoachContext,
): string {
  return `
${context.businessSummary}

SUPPLEMENTAL ANALYTICS (synced posts):
${formatCoachAnalyticsSummaryBlock(context.analyticsSummary)}

STORED AI RECOMMENDATIONS:
${formatRecommendationsBlock(context.recommendations)}
`.trim()
}
