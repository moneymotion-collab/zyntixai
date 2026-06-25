import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import type {
  ClientNote,
  ClientNoteFilter,
  ClientNoteType,
  CreateClientNoteInput,
} from "@/lib/types/client-notes"

type ClientNoteRow = Database["public"]["Tables"]["client_notes"]["Row"]

const NOTE_TYPES = new Set<ClientNoteType>([
  "general",
  "injury",
  "mindset",
  "nutrition",
  "workout",
  "progress",
  "admin",
])

function normalizeNoteType(value: string): ClientNoteType {
  if (NOTE_TYPES.has(value as ClientNoteType)) {
    return value as ClientNoteType
  }
  return "general"
}

function normalizeText(value: string): string {
  return value.trim()
}

export function mapClientNoteRow(row: ClientNoteRow): ClientNote {
  return {
    id: row.id,
    coach_id: row.coach_id,
    member_id: row.member_id,
    note_type: normalizeNoteType(row.note_type),
    title: row.title,
    content: row.content,
    is_pinned: row.is_pinned,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export function sortClientNotes(notes: ClientNote[]): ClientNote[] {
  return [...notes].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) {
      return a.is_pinned ? -1 : 1
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

export function filterClientNotes(
  notes: ClientNote[],
  filter: ClientNoteFilter,
): ClientNote[] {
  if (filter === "all") return notes
  return notes.filter((note) => note.note_type === filter)
}

export async function fetchMemberClientNotes(
  supabase: SupabaseClient<Database>,
  memberId: string,
): Promise<{ notes: ClientNote[]; error: string | null }> {
  const { data, error } = await supabase
    .from("client_notes")
    .select("*")
    .eq("member_id", memberId)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    return { notes: [], error: error.message }
  }

  return {
    notes: sortClientNotes((data ?? []).map(mapClientNoteRow)),
    error: null,
  }
}

export async function insertMemberClientNote(
  supabase: SupabaseClient<Database>,
  coachId: string,
  input: CreateClientNoteInput,
): Promise<{ note: ClientNote | null; error: string | null }> {
  const title = normalizeText(input.title)
  const content = normalizeText(input.content)

  if (!title) {
    return { note: null, error: "Enter a note title." }
  }

  if (!content) {
    return { note: null, error: "Enter note content." }
  }

  const { data, error } = await supabase
    .from("client_notes")
    .insert({
      coach_id: coachId,
      member_id: input.memberId,
      note_type: input.noteType,
      title,
      content,
      is_pinned: input.isPinned ?? false,
    })
    .select()
    .single()

  if (error) {
    return { note: null, error: error.message }
  }

  return { note: mapClientNoteRow(data), error: null }
}

export async function toggleMemberClientNotePinned(
  supabase: SupabaseClient<Database>,
  noteId: string,
  isPinned: boolean,
): Promise<{ note: ClientNote | null; error: string | null }> {
  const { data, error } = await supabase
    .from("client_notes")
    .update({
      is_pinned: isPinned,
      updated_at: new Date().toISOString(),
    })
    .eq("id", noteId)
    .select()
    .single()

  if (error) {
    return { note: null, error: error.message }
  }

  return { note: mapClientNoteRow(data), error: null }
}

export async function deleteMemberClientNote(
  supabase: SupabaseClient<Database>,
  noteId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("client_notes").delete().eq("id", noteId)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

export function formatClientNoteDate(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "—"

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export const CLIENT_NOTE_TYPE_OPTIONS: {
  value: ClientNoteType
  label: string
}[] = [
  { value: "general", label: "General" },
  { value: "injury", label: "Injury" },
  { value: "mindset", label: "Mindset" },
  { value: "nutrition", label: "Nutrition" },
  { value: "workout", label: "Workout" },
  { value: "progress", label: "Progress" },
  { value: "admin", label: "Admin" },
]

export const CLIENT_NOTE_FILTER_OPTIONS: {
  value: ClientNoteFilter
  label: string
}[] = [
  { value: "all", label: "All" },
  ...CLIENT_NOTE_TYPE_OPTIONS,
]

export function clientNoteTypeLabel(type: ClientNoteType): string {
  return (
    CLIENT_NOTE_TYPE_OPTIONS.find((option) => option.value === type)?.label ??
    "General"
  )
}
