import type { Database } from "@/lib/database.types"
import type { ClientGoal } from "@/lib/types/client-goals"

type ClientGoalRow = Database["public"]["Tables"]["client_goals"]["Row"]

function inferGoalUnit(goalType: string): string | null {
  switch (goalType) {
    case "body_fat_reduction":
      return "%"
    case "weight_loss":
    case "weight_gain":
    case "muscle_gain":
      return "kg"
    default:
      return null
  }
}

function mapTrackingStatus(
  status: string,
): ClientGoal["status"] {
  switch (status) {
    case "completed":
      return "completed"
    case "behind_schedule":
      return "behind"
    case "paused":
      return "paused"
    default:
      return "active"
  }
}

export function mapClientGoalRow(row: ClientGoalRow): ClientGoal {
  return {
    id: row.id,
    coach_id: row.coach_id,
    member_id: row.member_id,
    title: row.title,
    goal_type: row.goal_type,
    unit: row.unit ?? inferGoalUnit(row.goal_type),
    start_value: row.start_value,
    current_value: row.current_value,
    target_value: row.target_value,
    status: mapTrackingStatus(row.status),
    deadline: row.deadline ?? row.target_date,
    notes: row.notes ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at ?? row.created_at,
  }
}
