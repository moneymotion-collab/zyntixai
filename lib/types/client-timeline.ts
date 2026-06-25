export type ClientTimelineItem = {
  id: string
  type: string
  title: string
  description: string
  date: string
  status?: string
}

export type ClientTimelineFilter =
  | "all"
  | "workouts"
  | "nutrition"
  | "progress"
  | "check-ins"
  | "photos"
  | "notes"
  | "habits"
  | "reminders"
  | "sessions"
  | "goals"
