import { randomUUID } from "crypto"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database, Json } from "@/lib/database.types"
import type {
  LearningInsight,
  LearningProfile,
  LearningRunResult,
  StoredLearningInsight,
  StoredLearningProfile,
} from "@/lib/marketing/learning/types"

function toJson(value: unknown): Json {
  return value as Json
}

export type PersistLearningInput = {
  supabase: SupabaseClient<Database>
  userId: string
  runId: string
  result: LearningRunResult
}

export type PersistLearningOutput = {
  profile: StoredLearningProfile | null
  insights: StoredLearningInsight[]
}

export async function persistLearningResults(
  input: PersistLearningInput,
): Promise<
  | { ok: true; data: PersistLearningOutput }
  | { ok: false; error: string }
> {
  const { supabase, userId, runId, result } = input

  if (!result.learning_profile) {
    return { ok: true, data: { profile: null, insights: [] } }
  }

  const profile = result.learning_profile

  const { data: storedProfile, error: profileError } = await supabase
    .from("marketing_learning_profiles")
    .insert({
      user_id: userId,
      run_id: runId,
      post_count: profile.postCount,
      average_engagement_rate: profile.averageEngagementRate,
      best_platform: profile.bestPlatform,
      best_content_type: profile.bestContentType,
      best_posting_time: profile.bestPostingTime,
      profile_json: toJson(profile),
    })
    .select()
    .single()

  if (profileError || !storedProfile) {
    return {
      ok: false,
      error: profileError?.message ?? "Failed to save learning profile.",
    }
  }

  const insightPayload = result.insights.map((insight: LearningInsight) => ({
    user_id: userId,
    profile_id: storedProfile.id,
    run_id: runId,
    insight_key: insight.insight_key,
    category: insight.category,
    title: insight.title,
    message: insight.message,
    metrics: toJson(insight.metrics),
    patterns: toJson(insight.patterns),
    priority: insight.priority,
  }))

  if (insightPayload.length === 0) {
    return { ok: true, data: { profile: storedProfile, insights: [] } }
  }

  const { data: storedInsights, error: insightsError } = await supabase
    .from("marketing_learning_insights")
    .insert(insightPayload)
    .select()

  if (insightsError) {
    return { ok: false, error: insightsError.message }
  }

  return {
    ok: true,
    data: {
      profile: storedProfile,
      insights: (storedInsights ?? []).sort((a, b) => b.priority - a.priority),
    },
  }
}

export function formatLearningProfileView(
  profile: LearningProfile,
  stored?: StoredLearningProfile | null,
) {
  return {
    id: stored?.id ?? null,
    run_id: profile.runId,
    post_count: profile.postCount,
    average_engagement_rate: profile.averageEngagementRate,
    best_platform: profile.bestPlatform,
    best_content_type: profile.bestContentType,
    best_posting_time: profile.bestPostingTime,
    best_performing_posts: profile.bestPerformingPosts,
    worst_performing_posts: profile.worstPerformingPosts,
    best_hook_patterns: profile.bestHookPatterns,
    best_cta_patterns: profile.bestCtaPatterns,
    repeated_weak_patterns: profile.repeatedWeakPatterns,
    total_views: profile.totalViews,
    total_engagement: profile.totalEngagement,
    ai_summary: profile.aiSummary,
    created_at: stored?.created_at ?? null,
  }
}

export function formatLearningInsightView(insight: LearningInsight) {
  return {
    insight_key: insight.insight_key,
    category: insight.category,
    title: insight.title,
    message: insight.message,
    priority: insight.priority,
    metrics: insight.metrics,
    patterns: insight.patterns,
  }
}

export function createLearningRunId(): string {
  return randomUUID()
}
