import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { fetchLearningPerformanceRows } from "@/lib/marketing/learning/fetch-learning-data"
import {
  createLearningRunId,
  formatLearningInsightView,
  formatLearningProfileView,
  persistLearningResults,
} from "@/lib/marketing/learning/persist-learning-results"
import { analyzeLearningData } from "@/lib/marketing/learning/rule-based-engine"
import type { LearningRunResult } from "@/lib/marketing/learning/types"

export type RunLearningEngineInput = {
  supabase: SupabaseClient<Database>
  userId: string
  isAdmin: boolean
}

export type RunLearningEngineResult =
  | {
      ok: true
      runId: string
      learning_profile: ReturnType<typeof formatLearningProfileView> | null
      insights: ReturnType<typeof formatLearningInsightView>[]
      recommendations: LearningRunResult["recommendations"]
      next_actions: LearningRunResult["next_actions"]
      message?: string
    }
  | {
      ok: false
      error: string
      status?: number
    }

export async function runLearningEngine(
  input: RunLearningEngineInput,
): Promise<RunLearningEngineResult> {
  const { supabase, userId, isAdmin } = input
  const runId = createLearningRunId()

  const { data: rows, error: fetchError } = await fetchLearningPerformanceRows(
    supabase,
    userId,
    isAdmin,
  )

  if (fetchError) {
    return { ok: false, error: fetchError.message, status: 500 }
  }

  const performanceRows = rows ?? []
  const analysis = analyzeLearningData(runId, performanceRows)

  if (!analysis.learning_profile) {
    return {
      ok: true,
      runId,
      learning_profile: null,
      insights: [],
      recommendations: [],
      next_actions: [],
      message: analysis.message,
    }
  }

  const persist = await persistLearningResults({
    supabase,
    userId,
    runId,
    result: analysis,
  })

  if (!persist.ok) {
    return { ok: false, error: persist.error, status: 500 }
  }

  return {
    ok: true,
    runId,
    learning_profile: formatLearningProfileView(
      analysis.learning_profile,
      persist.data.profile,
    ),
    insights: analysis.insights.map(formatLearningInsightView),
    recommendations: analysis.recommendations,
    next_actions: analysis.next_actions,
  }
}
