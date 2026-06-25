export type ClientNoteType =
  | "general"
  | "injury"
  | "mindset"
  | "nutrition"
  | "workout"
  | "progress"
  | "admin"

export type ClientNoteFilter = "all" | ClientNoteType

export type ClientNote = {
  id: string
  coach_id: string
  member_id: string
  note_type: ClientNoteType
  title: string
  content: string
  is_pinned: boolean
  created_at: string
  updated_at: string
}

export type CreateClientNoteInput = {
  memberId: string
  noteType: ClientNoteType
  title: string
  content: string
  isPinned?: boolean
}
