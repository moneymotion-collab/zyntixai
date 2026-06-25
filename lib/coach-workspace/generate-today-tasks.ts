import type { AttentionMember } from "@/lib/coach-dashboard/types"
import type { TodayTask, TodayTaskType } from "@/lib/coach-workspace/types"

const TASK_COPY: Record<
  TodayTaskType,
  { title: (name: string) => string; description: string }
> = {
  stale_progress: {
    title: (name) => `Follow up with ${name}`,
    description: "No progress logged in 14+ days",
  },
  negative_progress: {
    title: (name) => `Check in with ${name}`,
    description: "Member shows a negative progress trend",
  },
  no_workout_plan: {
    title: (name) => `Assign workout plan to ${name}`,
    description: "Member has no active workout plan",
  },
  no_nutrition_plan: {
    title: (name) => `Assign nutrition plan to ${name}`,
    description: "Member has no active nutrition plan",
  },
}

export function generateTodayTasks(
  attentionMembers: AttentionMember[],
): TodayTask[] {
  const tasks: TodayTask[] = []

  for (const member of attentionMembers) {
    for (const reason of member.reasons) {
      const copy = TASK_COPY[reason]
      tasks.push({
        id: `${reason}:${member.memberId}`,
        type: reason,
        memberId: member.memberId,
        memberName: member.memberName,
        title: copy.title(member.memberName),
        description: copy.description,
      })
    }
  }

  return tasks.sort((a, b) => a.memberName.localeCompare(b.memberName))
}
