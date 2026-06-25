import { parseProgressDate } from "@/lib/progress/progress-date"

type MemberRef = {
  id: string
  created_at?: string | null
}

type HabitRef = {
  member_id: string
}

const DEFAULT_MIN_ACTIVE_DAYS = 7

function daysSinceProgressDate(value: unknown, reference = new Date()): number | null {
  const parsed = parseProgressDate(value)
  if (!parsed) return null

  const ref = new Date(reference)
  ref.setHours(12, 0, 0, 0)
  const target = new Date(parsed)
  target.setHours(12, 0, 0, 0)
  return Math.floor((ref.getTime() - target.getTime()) / (24 * 60 * 60 * 1000))
}

export function memberHasHabitHistory(
  habits: HabitRef[],
  memberId: string,
): boolean {
  return habits.some((habit) => habit.member_id === memberId)
}

export function shouldEvaluateMissingHabit(
  member: MemberRef,
  habits: HabitRef[],
  reference = new Date(),
  minActiveDays = DEFAULT_MIN_ACTIVE_DAYS,
): boolean {
  if (memberHasHabitHistory(habits, member.id)) return true
  if (!member.created_at) return false

  const activeDays = daysSinceProgressDate(member.created_at, reference)
  return activeDays != null && activeDays > minActiveDays
}
