export type ClientReminderType =
  | "check_in_missing"
  | "habit_inactive"
  | "progress_update_needed"
  | "workout_completion_missing"
  | "general"
  | "follow_up"
  | "check_in"
  | "workout"
  | "nutrition"
  | "progress"
  | "session"
  | "admin"

export type ClientReminderPriority = "high" | "medium" | "low"
export type ClientReminderStatus = "open" | "done"

export type ClientReminder = {
  id: string
  coach_id: string
  member_id: string
  reminder_type: ClientReminderType
  title: string
  message: string
  due_date: string
  priority: ClientReminderPriority
  status: ClientReminderStatus
  is_automatic: boolean
  created_at: string
  updated_at: string
}

export type CreateClientReminderInput = {
  memberId: string
  reminderType: ClientReminderType
  title: string
  message: string
  dueDate: string
  priority: ClientReminderPriority
}
