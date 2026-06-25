import type { ProgressLogRow } from "@/lib/progress/fetch-progress-dashboard"
import { improvementScore } from "@/lib/progress/metrics"
import type { AttentionMember, AttentionReason } from "@/lib/coach-dashboard/types"
import { fourteenDaysAgoIso } from "@/lib/coach-dashboard/date-utils"

type MemberRef = {
  id: string
  full_name: string | null
}

function latestLogByMember(logs: ProgressLogRow[]): Map<string, ProgressLogRow> {
  const map = new Map<string, ProgressLogRow>()

  for (const log of logs) {
    if (!log.member_id) continue
    const existing = map.get(log.member_id)
    if (
      !existing ||
      new Date(log.updated_at ?? 0).getTime() >
        new Date(existing.updated_at ?? 0).getTime()
    ) {
      map.set(log.member_id, log)
    }
  }

  return map
}

export function computeAttentionMembers(
  members: MemberRef[],
  logs: ProgressLogRow[],
  activeWorkoutMemberIds: Set<string>,
  activeNutritionMemberIds: Set<string>,
): AttentionMember[] {
  const staleCutoff = new Date(fourteenDaysAgoIso()).getTime()
  const latestByMember = latestLogByMember(logs)
  const attention: AttentionMember[] = []

  for (const member of members) {
    const reasons: AttentionReason[] = []

    if (!activeWorkoutMemberIds.has(member.id)) {
      reasons.push("no_workout_plan")
    }

    if (!activeNutritionMemberIds.has(member.id)) {
      reasons.push("no_nutrition_plan")
    }

    const latestLog = latestByMember.get(member.id)
    const latestUpdate = latestLog?.updated_at
      ? new Date(latestLog.updated_at).getTime()
      : null

    if (latestUpdate == null || latestUpdate < staleCutoff) {
      reasons.push("stale_progress")
    } else {
      const score = improvementScore(latestLog?.metric, latestLog?.change_value)
      if (score != null && score < 0) {
        reasons.push("negative_progress")
      }
    }

    if (reasons.length > 0) {
      attention.push({
        memberId: member.id,
        memberName: member.full_name ?? "Member",
        reasons,
      })
    }
  }

  return attention.sort((a, b) => a.memberName.localeCompare(b.memberName))
}
