export type ClientGoal = {
  id: string
  coach_id: string
  member_id: string

  title: string
  goal_type: string
  unit: string | null

  start_value: number | null
  current_value: number | null
  target_value: number | null

  status: "active" | "completed" | "paused" | "behind"
  deadline: string | null

  notes: string | null

  created_at: string
  updated_at: string
}
