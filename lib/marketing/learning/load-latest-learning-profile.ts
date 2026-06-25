import type { Database } from "@/lib/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { LearningProfile } from "@/lib/marketing/learning/types"
import { buildAiLearningProfileSummary } from "@/lib/marketing/learning/build-ai-learning-profile-summary"

export type StoredLearningProfileRow =
  Database["public"]["Tables"]["marketing_learning_profiles"]["Row"]

export type LoadedLearningProfile = {
  id: string
  runId: string
  createdAt: string
  profile: LearningProfile
}

function isLearningProfile(value: unknown): value is LearningProfile {
  if (!value || typeof value !== "object") return false
  const record = value as Record<string, unknown>
  const hasAiSummary = Boolean(
    record.aiSummary &&
      typeof record.aiSummary === "object" &&
      typeof (record.aiSummary as Record<string, unknown>).recommendation ===
        "string",
  )

  return (
    typeof record.postCount === "number" &&
    typeof record.averageEngagementRate === "number" &&
    Array.isArray(record.bestHookPatterns) &&
    Array.isArray(record.repeatedWeakPatterns) &&
    hasAiSummary
  )
}

function isLegacyLearningProfile(
  value: unknown,
): value is Omit<LearningProfile, "aiSummary"> {
  if (!value || typeof value !== "object") return false
  const record = value as Record<string, unknown>
  return (
    typeof record.postCount === "number" &&
    typeof record.averageEngagementRate === "number" &&
    Array.isArray(record.bestHookPatterns) &&
    Array.isArray(record.repeatedWeakPatterns)
  )
}

export function parseLearningProfileFromRow(
  row: StoredLearningProfileRow,
): LearningProfile | null {
  if (isLearningProfile(row.profile_json)) {
    return row.profile_json
  }

  if (isLegacyLearningProfile(row.profile_json)) {
    return {
      ...row.profile_json,
      aiSummary: buildAiLearningProfileSummary(row.profile_json),
    }
  }

  const fallback = {
    runId: row.run_id,
    postCount: row.post_count,
    averageEngagementRate: Number(row.average_engagement_rate),
    bestPlatform: row.best_platform,
    bestContentType: row.best_content_type,
    bestPostingTime: row.best_posting_time ?? "Not enough data",
    bestPerformingPosts: [],
    worstPerformingPosts: [],
    bestHookPatterns: [],
    bestCtaPatterns: [],
    repeatedWeakPatterns: [],
    totalViews: 0,
    totalEngagement: 0,
  }

  return {
    ...fallback,
    aiSummary: buildAiLearningProfileSummary(fallback),
  }
}

export async function loadLatestLearningProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ data: LoadedLearningProfile | null; error: string | null }> {
  const { data: row, error } = await supabase
    .from("marketing_learning_profiles")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    return { data: null, error: error.message }
  }

  if (!row) {
    return { data: null, error: null }
  }

  const profile = parseLearningProfileFromRow(row)
  if (!profile) {
    return { data: null, error: null }
  }

  return {
    data: {
      id: row.id,
      runId: row.run_id,
      createdAt: row.created_at,
      profile,
    },
    error: null,
  }
}
