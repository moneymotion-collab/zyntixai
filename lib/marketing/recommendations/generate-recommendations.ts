import { randomUUID } from "crypto"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database, Json } from "@/lib/database.types"
import { withEngagementRate } from "@/lib/marketing/aggregate-content-performance"
import { buildPerformanceSummary } from "@/lib/marketing/analytics/build-performance-summary"
import type { PerformanceSummary } from "@/lib/marketing/analytics/build-performance-summary"
import type { AnalyticsRowWithPost } from "@/lib/marketing/fetch-analytics-rows"
import { fetchRecommendationPerformanceRows } from "@/lib/marketing/recommendations/fetch-recommendation-rows"
import {
  resolveRecommendationReadiness,
  type RecommendationReadiness,
} from "@/lib/marketing/recommendations/recommendation-readiness"
import {
  buildActionableRecommendations,
  type ActionableRecommendation,
  type MetricSnapshot,
  type RecommendationType,
} from "@/lib/marketing/recommendations/build-actionable-recommendations"
import {
  buildRecommendationDataSnapshot,
  logRecommendationDataMetrics,
  type RecommendationDataTier,
} from "@/lib/marketing/recommendations/recommendation-data-thresholds"

export type RecommendationRunSummary = PerformanceSummary & {
  postCount: number
  hasEnoughData: boolean
  dataTier: RecommendationDataTier
}

export function buildRecommendationRunSummary(
  rows: AnalyticsRowWithPost[],
): RecommendationRunSummary {
  const snapshot = buildRecommendationDataSnapshot(rows)

  return {
    ...buildPerformanceSummary(rows, {
      topCount: 5,
      weakCount: 3,
      patternCount: 3,
    }),
    postCount: snapshot.rowCount,
    hasEnoughData: snapshot.hasEnoughData,
    dataTier: snapshot.tier,
  }
}

export type {
  ActionableRecommendation,
  MetricSnapshot,
  RecommendationType,
} from "@/lib/marketing/recommendations/build-actionable-recommendations"

export type RecommendationPostSummary = {
  postId: string | null
  title: string
  engagementRate: number
}

export type RecommendationMetrics = {
  totalViews: number
  totalEngagement: number
  engagementRate: number
  bestPost: RecommendationPostSummary | null
  worstPost: RecommendationPostSummary | null
  bestPlatform: string | null
  bestContentType: string | null
}

export type RecommendationPatterns = {
  bestHooks: string[]
  bestCtaPatterns: string[]
  bestTopic: string | null
  bestCategory: string | null
}

export type StoredMarketingRecommendation =
  Database["public"]["Tables"]["marketing_recommendations"]["Row"]

export type GenerateRecommendationsInput = {
  supabase: SupabaseClient<Database>
  userId: string
  brandId: string
}

export type GenerateRecommendationsResult =
  | {
      ok: true
      runId: string
      summary: RecommendationRunSummary
      metrics: RecommendationMetrics
      patterns: RecommendationPatterns
      recommendations: StoredMarketingRecommendation[]
      readiness: RecommendationReadiness
    }
  | {
      ok: false
      error: string
      status?: number
    }

function toRecommendationPostSummary(
  post: NonNullable<
    ReturnType<typeof buildPerformanceSummary>["bestPost"]
  > | null,
): RecommendationPostSummary | null {
  if (!post) return null

  return {
    postId: post.postId,
    title: post.title,
    engagementRate: post.engagementRate,
  }
}

function detectBestTopic(rows: AnalyticsRowWithPost[]): string | null {
  const topicStats = new Map<string, { engagementSum: number; count: number }>()

  for (const row of rows.map(withEngagementRate)) {
    const topic = row.content_posts?.topic?.trim()
    if (!topic) continue

    const current = topicStats.get(topic) ?? { engagementSum: 0, count: 0 }
    topicStats.set(topic, {
      engagementSum: current.engagementSum + row.engagement_rate,
      count: current.count + 1,
    })
  }

  let bestTopic: string | null = null
  let bestAvg = -1

  for (const [topic, bucket] of topicStats) {
    const avg = bucket.engagementSum / bucket.count
    if (avg > bestAvg) {
      bestAvg = avg
      bestTopic = topic
    }
  }

  return bestTopic
}

function detectBestCategory(rows: AnalyticsRowWithPost[]): string | null {
  const categoryStats = new Map<string, { engagementSum: number; count: number }>()

  for (const row of rows.map(withEngagementRate)) {
    const category = row.content_posts?.category?.trim()
    if (!category) continue

    const current = categoryStats.get(category) ?? { engagementSum: 0, count: 0 }
    categoryStats.set(category, {
      engagementSum: current.engagementSum + row.engagement_rate,
      count: current.count + 1,
    })
  }

  let bestCategory: string | null = null
  let bestAvg = -1

  for (const [category, bucket] of categoryStats) {
    const avg = bucket.engagementSum / bucket.count
    if (avg > bestAvg) {
      bestAvg = avg
      bestCategory = category
    }
  }

  return bestCategory
}

export function calculateRecommendationMetrics(
  rows: AnalyticsRowWithPost[],
): RecommendationMetrics {
  const summary = buildPerformanceSummary(rows)
  const engagementRate =
    summary.totalViews > 0
      ? Math.round((summary.totalEngagement / summary.totalViews) * 1000) / 10
      : 0

  return {
    totalViews: summary.totalViews,
    totalEngagement: summary.totalEngagement,
    engagementRate,
    bestPost: toRecommendationPostSummary(summary.bestPost),
    worstPost: toRecommendationPostSummary(summary.worstPost),
    bestPlatform: summary.bestPlatform,
    bestContentType: summary.bestContentType,
  }
}

export function detectRecommendationPatterns(
  rows: AnalyticsRowWithPost[],
): RecommendationPatterns {
  const summary = buildPerformanceSummary(rows)

  return {
    bestHooks: summary.hookPatterns.map((pattern) => pattern.hook),
    bestCtaPatterns: summary.ctaPatterns.map((pattern) => pattern.pattern),
    bestTopic: detectBestTopic(rows),
    bestCategory: detectBestCategory(rows),
  }
}

function toJson(value: unknown): Json {
  return value as Json
}

function recommendationPatternsPayload(
  recommendation: ActionableRecommendation,
): Json {
  return toJson({
    insight: recommendation.insight,
    why_it_matters: recommendation.why_it_matters,
    confidence_score: recommendation.confidence_score,
    recommendation_type: recommendation.recommendation_type,
    trigger_post_id: recommendation.trigger_post_id,
    trigger_post_title: recommendation.trigger_post_title,
  })
}

async function verifyBrandOwnership(
  supabase: SupabaseClient<Database>,
  brandId: string,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const { data: brand, error } = await supabase
    .from("brand_profiles")
    .select("id")
    .eq("id", brandId)
    .eq("owner_id", userId)
    .maybeSingle()

  if (error) {
    return { ok: false, error: error.message, status: 500 }
  }

  if (!brand) {
    return { ok: false, error: "Brand not found.", status: 404 }
  }

  return { ok: true }
}

export async function generateRecommendations(
  input: GenerateRecommendationsInput,
): Promise<GenerateRecommendationsResult> {
  const { supabase, userId, brandId } = input
  const runId = randomUUID()

  const ownership = await verifyBrandOwnership(supabase, brandId, userId)
  if (!ownership.ok) {
    return { ok: false, error: ownership.error, status: ownership.status }
  }

  const { data: rows, error: rowsError } =
    await fetchRecommendationPerformanceRows(supabase, userId, brandId)

  if (rowsError) {
    return { ok: false, error: rowsError.message, status: 500 }
  }

  const analyticsRows = rows ?? []
  const snapshot = buildRecommendationDataSnapshot(analyticsRows)
  logRecommendationDataMetrics("generate-recommendations-run", snapshot)
  const readiness = resolveRecommendationReadiness({
    postCount: snapshot.rowCount,
    totalViews: snapshot.totalViews,
    hasRecommendations: false,
  })
  const performanceSummary = buildPerformanceSummary(analyticsRows, {
    topCount: 3,
    weakCount: 3,
    patternCount: 3,
  })
  const summary: RecommendationRunSummary = {
    ...performanceSummary,
    postCount: snapshot.rowCount,
    hasEnoughData: snapshot.hasEnoughData,
    dataTier: snapshot.tier,
  }
  const metrics = calculateRecommendationMetrics(analyticsRows)
  const patterns = detectRecommendationPatterns(analyticsRows)
  const actionable = buildActionableRecommendations(
    analyticsRows,
    snapshot.tier,
    snapshot.hasEnoughData,
  )

  if (actionable.length === 0) {
    return {
      ok: true,
      runId,
      summary,
      metrics,
      patterns,
      recommendations: [],
      readiness,
    }
  }

  const insertPayload = actionable.map((item) => ({
    brand_id: brandId,
    user_id: userId,
    run_id: runId,
    recommendation_key: item.recommendation_key,
    category: item.recommendation_type,
    title: item.title,
    message: item.action,
    priority: item.priority,
    metrics: toJson(item.metric_snapshot),
    patterns: recommendationPatternsPayload(item),
  }))

  const seenKeys = new Set<string>()
  const dedupedPayload = insertPayload.filter((row) => {
    if (seenKeys.has(row.recommendation_key)) return false
    seenKeys.add(row.recommendation_key)
    return true
  })

  const { data: stored, error: insertError } = await supabase
    .from("marketing_recommendations")
    .insert(dedupedPayload)
    .select()

  if (insertError) {
    return { ok: false, error: insertError.message, status: 500 }
  }

  const recommendations = (stored ?? []).sort((a, b) => b.priority - a.priority)

  return {
    ok: true,
    runId,
    summary,
    metrics,
    patterns,
    recommendations,
    readiness: resolveRecommendationReadiness({
      postCount: snapshot.rowCount,
      totalViews: snapshot.totalViews,
      hasRecommendations: recommendations.length > 0,
    }),
  }
}
