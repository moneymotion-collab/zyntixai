import type { CoachDashboardStats } from "@/lib/types/dashboard-stats"
import type { MemberWithPlans } from "@/lib/member-status"

export type SuggestedAction = {
  id: string
  label: string
}

export function getSuggestedActions(
  needsAttention: MemberWithPlans[],
  stats: CoachDashboardStats | null,
): SuggestedAction[] {
  const actions: SuggestedAction[] = []
  const seenMemberIds = new Set<string>()

  for (const member of needsAttention) {
    if (seenMemberIds.has(member.id)) continue
    seenMemberIds.add(member.id)
    if (seenMemberIds.size > 3) break

    actions.push({
      id: `assign-plan-${member.id}`,
      label: `Assign a plan to ${member.full_name}`,
    })
  }

  if (needsAttention.length > 3) {
    actions.push({
      id: "review-more-members",
      label: `Review ${needsAttention.length - 3} more member(s) without a plan`,
    })
  }

  if (stats && stats.assignmentsPending > 0) {
    actions.push({
      id: "follow-up-assignments",
      label: `Follow up on ${stats.assignmentsPending} open workout assignment(s)`,
    })
  }

  if (stats && stats.memberCount === 0) {
    actions.push({
      id: "add-first-member",
      label: "Add your first member from the Members page",
    })
  }

  if (stats && stats.workoutPlanCount === 0) {
    actions.push({
      id: "create-workout-plan",
      label: "Create a workout plan on the Workouts page",
    })
  }

  if (actions.length === 0) {
    actions.push(
      {
        id: "review-progress",
        label: "Review member progress on the Progress page",
      },
      {
        id: "check-ai-coach",
        label: "Check AI Coach for unanswered member questions",
      },
    )
  }

  return actions
}
