import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import {
  computeProgressAdherenceSnapshot,
  type ProgressAdherenceSnapshot,
} from "@/lib/progress/compute-progress-adherence"
import {
  fetchProgressCoachingSignals,
  resolveCoachingScopeMemberIds,
  type ProgressCoachingSignals,
} from "@/lib/progress/fetch-progress-coaching-signals"

function deriveMemberIdsFromSignals(signals: ProgressCoachingSignals): string[] {
  return [
    ...new Set([
      ...signals.completions.map((row) => row.member_id),
      ...signals.assignments.map((row) => row.member_id),
      ...signals.nutritionAssignments.map((row) => row.member_id),
      ...signals.habits.map((row) => row.member_id),
      ...signals.checkIns
        .map((row) => row.member_id)
        .filter((id): id is string => Boolean(id)),
    ]),
  ]
}

export async function fetchProgressAdherence(
  supabase: SupabaseClient<Database>,
): Promise<{ data: ProgressAdherenceSnapshot | null; error: string | null }> {
  const [signalsResult, scopedMemberIds] = await Promise.all([
    fetchProgressCoachingSignals(supabase),
    resolveCoachingScopeMemberIds(supabase),
  ])

  if (signalsResult.error || !signalsResult.data) {
    return { data: null, error: signalsResult.error }
  }

  const memberIds =
    scopedMemberIds != null
      ? scopedMemberIds
      : deriveMemberIdsFromSignals(signalsResult.data)

  const snapshot = computeProgressAdherenceSnapshot({
    memberIds,
    completions: signalsResult.data.completions,
    assignments: signalsResult.data.assignments,
    nutritionAssignments: signalsResult.data.nutritionAssignments,
    habits: signalsResult.data.habits,
    checkIns: signalsResult.data.checkIns,
  })

  return { data: snapshot, error: null }
}

export function buildProgressAdherenceSnapshot(
  signals: ProgressCoachingSignals,
  memberIds: string[],
): ProgressAdherenceSnapshot {
  return computeProgressAdherenceSnapshot({
    memberIds,
    completions: signals.completions,
    assignments: signals.assignments,
    nutritionAssignments: signals.nutritionAssignments,
    habits: signals.habits,
    checkIns: signals.checkIns,
  })
}
