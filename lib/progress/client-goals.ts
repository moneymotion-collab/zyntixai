import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import type { ClientCheckInRow } from "@/lib/progress/client-checkins"
import { reportSupabaseError } from "@/lib/errors/reportSupabaseError"
import { filterCheckInsByMember } from "@/lib/progress/client-checkin-member-view"
import {
  computeGoalProgressPercent,
  isGoalTargetReached,
} from "@/lib/progress/goal-math"

export type ClientGoalType =
  | "weight_loss"
  | "weight_gain"
  | "muscle_gain"
  | "body_fat_reduction"
  | "custom"

export type ClientGoalTrackingStatus = "on_track" | "behind_schedule" | "completed"

export type ClientGoalRow = Database["public"]["Tables"]["client_goals"]["Row"]

export type ClientGoalViewModel = {
  id: string
  memberId: string
  memberName: string
  title: string
  goalType: ClientGoalType
  goalTypeLabel: string
  startValue: number
  targetValue: number
  currentValue: number
  targetDate: string
  status: ClientGoalTrackingStatus
  progressPercent: number
  remainingAmount: number
  estimatedCompletionStatus: string
  createdAt: string
}

export type CreateClientGoalInput = {
  memberId: string
  memberName: string
  title: string
  goalType: ClientGoalType
  startValue: number
  targetValue: number
  targetDate: string
}

export const CLIENT_GOAL_TYPE_OPTIONS: {
  value: ClientGoalType
  label: string
}[] = [
  { value: "weight_loss", label: "Weight Loss" },
  { value: "weight_gain", label: "Weight Gain" },
  { value: "muscle_gain", label: "Muscle Gain" },
  { value: "body_fat_reduction", label: "Body Fat Reduction" },
  { value: "custom", label: "Custom Goal" },
]

const WEIGHT_SYNC_GOAL_TYPES: ClientGoalType[] = [
  "weight_loss",
  "weight_gain",
  "muscle_gain",
  "body_fat_reduction",
]

export function getClientGoalTypeLabel(goalType: ClientGoalType): string {
  return (
    CLIENT_GOAL_TYPE_OPTIONS.find((option) => option.value === goalType)?.label ??
    "Custom Goal"
  )
}

function compareCheckInsDesc(a: ClientCheckInRow, b: ClientCheckInRow): number {
  const dateCompare = b.checkin_date.localeCompare(a.checkin_date)
  if (dateCompare !== 0) return dateCompare
  return b.created_at.localeCompare(a.created_at)
}

export function latestCheckInWeightForMember(
  checkIns: ClientCheckInRow[],
  memberId: string,
  memberName?: string | null,
): number | null {
  const memberCheckIns = filterCheckInsByMember(checkIns, memberId, memberName)
  const latestWithWeight = memberCheckIns
    .filter((row) => row.weight != null && !Number.isNaN(Number(row.weight)))
    .sort(compareCheckInsDesc)[0]

  if (!latestWithWeight?.weight) return null
  return Number(latestWithWeight.weight)
}

export function resolveCurrentValueFromCheckIns(
  goal: Pick<ClientGoalRow, "goal_type" | "member_id" | "member_name" | "start_value" | "current_value">,
  checkIns: ClientCheckInRow[],
): number {
  if (!WEIGHT_SYNC_GOAL_TYPES.includes(goal.goal_type as ClientGoalType)) {
    return Number(goal.current_value)
  }

  const synced = latestCheckInWeightForMember(
    checkIns,
    goal.member_id,
    goal.member_name,
  )

  return synced ?? Number(goal.start_value)
}

export function computeRemainingAmount(
  startValue: number,
  currentValue: number,
  targetValue: number,
): number {
  if (isGoalTargetReached(startValue, currentValue, targetValue)) return 0

  if (targetValue > startValue) {
    return Math.max(0, targetValue - currentValue)
  }

  if (targetValue < startValue) {
    return Math.max(0, currentValue - targetValue)
  }

  return Math.abs(targetValue - currentValue)
}

export function computeClientGoalTrackingStatus(
  startValue: number,
  currentValue: number,
  targetValue: number,
  targetDate: string,
  createdAt: string,
): ClientGoalTrackingStatus {
  if (isGoalTargetReached(startValue, currentValue, targetValue)) {
    return "completed"
  }

  const now = Date.now()
  const targetTime = new Date(`${targetDate}T23:59:59`).getTime()
  const createdTime = new Date(createdAt).getTime()

  if (now > targetTime) {
    return "behind_schedule"
  }

  const totalDuration = targetTime - createdTime
  if (totalDuration <= 0) {
    return "behind_schedule"
  }

  const elapsed = now - createdTime
  const expectedProgress = (elapsed / totalDuration) * 100
  const actualProgress = computeGoalProgressPercent(
    startValue,
    currentValue,
    targetValue,
  )

  if (actualProgress + 8 < expectedProgress) {
    return "behind_schedule"
  }

  return "on_track"
}

export function buildEstimatedCompletionStatus(
  status: ClientGoalTrackingStatus,
  targetDate: string,
): string {
  switch (status) {
    case "completed":
      return "Goal completed — target reached"
    case "behind_schedule":
      return "Behind schedule — may miss the target date without adjustment"
    default:
      return `On track to reach target by ${new Date(`${targetDate}T12:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`
  }
}

export function toClientGoalViewModel(
  goal: ClientGoalRow,
  checkIns: ClientCheckInRow[],
): ClientGoalViewModel {
  const startValue = Number(goal.start_value)
  const targetValue = Number(goal.target_value)
  const currentValue = resolveCurrentValueFromCheckIns(goal, checkIns)
  const progressPercent = computeGoalProgressPercent(
    startValue,
    currentValue,
    targetValue,
  )
  const status = computeClientGoalTrackingStatus(
    startValue,
    currentValue,
    targetValue,
    goal.target_date,
    goal.created_at,
  )

  return {
    id: goal.id,
    memberId: goal.member_id,
    memberName: goal.member_name,
    title: goal.title,
    goalType: goal.goal_type as ClientGoalType,
    goalTypeLabel: getClientGoalTypeLabel(goal.goal_type as ClientGoalType),
    startValue,
    targetValue,
    currentValue,
    targetDate: goal.target_date,
    status,
    progressPercent,
    remainingAmount: computeRemainingAmount(startValue, currentValue, targetValue),
    estimatedCompletionStatus: buildEstimatedCompletionStatus(status, goal.target_date),
    createdAt: goal.created_at,
  }
}

export function filterClientGoalsByMember(
  goals: ClientGoalViewModel[],
  memberFilter: string,
): ClientGoalViewModel[] {
  if (memberFilter === "all") return goals
  return goals.filter((goal) => goal.memberId === memberFilter)
}

export async function fetchClientGoals(
  supabase: SupabaseClient<Database>,
  checkIns: ClientCheckInRow[],
): Promise<{ goals: ClientGoalViewModel[]; error: string | null }> {
  const { data, error } = await supabase
    .from("client_goals")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return { goals: [], error: error.message }
  }

  const rows = data ?? []
  const viewModels: ClientGoalViewModel[] = []

  for (const row of rows) {
    const viewModel = toClientGoalViewModel(row, checkIns)
    viewModels.push(viewModel)

    const needsUpdate =
      Number(row.current_value) !== viewModel.currentValue ||
      row.status !== viewModel.status

    if (needsUpdate) {
      const { error: updateError } = await supabase
        .from("client_goals")
        .update({
          current_value: viewModel.currentValue,
          status: viewModel.status,
        })
        .eq("id", row.id)

      if (updateError) {
        reportSupabaseError("[client_goals] sync update failed", updateError, {
          fallbackMessage: "Failed to sync client goal progress.",
        })
      }
    }
  }

  return { goals: viewModels, error: null }
}

export async function createClientGoal(
  supabase: SupabaseClient<Database>,
  coachId: string,
  checkIns: ClientCheckInRow[],
  input: CreateClientGoalInput,
): Promise<{ error: string | null }> {
  const syncedCurrent = WEIGHT_SYNC_GOAL_TYPES.includes(input.goalType)
    ? (latestCheckInWeightForMember(
        checkIns,
        input.memberId,
        input.memberName,
      ) ?? input.startValue)
    : input.startValue

  const status = computeClientGoalTrackingStatus(
    input.startValue,
    syncedCurrent,
    input.targetValue,
    input.targetDate,
    new Date().toISOString(),
  )

  const { error } = await supabase.from("client_goals").insert({
    coach_id: coachId,
    member_id: input.memberId,
    member_name: input.memberName.trim(),
    title: input.title.trim(),
    goal_type: input.goalType,
    start_value: input.startValue,
    target_value: input.targetValue,
    current_value: syncedCurrent,
    target_date: input.targetDate,
    status,
  })

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

export function formatGoalValue(value: number): string {
  if (Number.isNaN(value)) return "—"
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export function formatGoalRemaining(
  remaining: number,
  goalType: ClientGoalType,
): string {
  if (remaining === 0) return "0 remaining"

  const unit =
    goalType === "body_fat_reduction"
      ? "%"
      : goalType === "custom"
        ? ""
        : " kg"

  const formatted = formatGoalValue(remaining)
  return unit ? `${formatted}${unit} remaining` : `${formatted} remaining`
}

export function formatGoalTargetDate(value: string): string {
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}
