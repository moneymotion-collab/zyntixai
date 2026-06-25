export type ClientHabitType =
  | "general"
  | "nutrition"
  | "sleep"
  | "movement"
  | "mindset"
  | "recovery"
  | "other"

export type ClientHabit = {
  id: string
  coach_id: string
  member_id: string
  habit_name: string
  habit_type: ClientHabitType
  logged_at: string
  notes: string | null
  created_at: string
}

export type CreateClientHabitInput = {
  memberId: string
  habitName: string
  habitType: ClientHabitType
  habitDate: string
  notes?: string | null
}
