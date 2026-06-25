import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import type {
  ClientProgressPhoto,
  CreateClientProgressPhotoInput,
  ProgressPhotoType,
} from "@/lib/types/client-progress-photos"

type ClientProgressPhotoRow =
  Database["public"]["Tables"]["client_progress_photos"]["Row"]

const PHOTO_TYPES = new Set<ProgressPhotoType>([
  "front",
  "side",
  "back",
  "full_body",
  "other",
])

function normalizePhotoType(value: string): ProgressPhotoType {
  if (PHOTO_TYPES.has(value as ProgressPhotoType)) {
    return value as ProgressPhotoType
  }
  return "other"
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed || null
}

function todayIsoDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function mapClientProgressPhotoRow(
  row: ClientProgressPhotoRow,
): ClientProgressPhoto {
  return {
    id: row.id,
    coach_id: row.coach_id,
    member_id: row.member_id,
    photo_url: row.photo_url,
    photo_type: normalizePhotoType(row.photo_type),
    taken_at: row.taken_at,
    notes: row.notes,
    created_at: row.created_at,
  }
}

export async function fetchMemberProgressPhotos(
  supabase: SupabaseClient<Database>,
  memberId: string,
): Promise<{ photos: ClientProgressPhoto[]; error: string | null }> {
  const { data, error } = await supabase
    .from("client_progress_photos")
    .select("*")
    .eq("member_id", memberId)
    .order("taken_at", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    return { photos: [], error: error.message }
  }

  return {
    photos: (data ?? []).map(mapClientProgressPhotoRow),
    error: null,
  }
}

export async function insertMemberProgressPhoto(
  supabase: SupabaseClient<Database>,
  coachId: string,
  input: CreateClientProgressPhotoInput,
): Promise<{ photo: ClientProgressPhoto | null; error: string | null }> {
  const { data, error } = await supabase
    .from("client_progress_photos")
    .insert({
      coach_id: coachId,
      member_id: input.memberId,
      photo_url: input.photoUrl,
      photo_type: input.photoType,
      taken_at: input.takenAt || todayIsoDate(),
      notes: normalizeOptionalText(input.notes),
    })
    .select()
    .single()

  if (error) {
    return { photo: null, error: error.message }
  }

  return { photo: mapClientProgressPhotoRow(data), error: null }
}

export function formatProgressPhotoDate(value: string): string {
  const trimmed = value?.trim()
  if (!trimmed) return "—"

  const parsed = trimmed.includes("T")
    ? new Date(trimmed)
    : new Date(`${trimmed}T12:00:00`)

  if (Number.isNaN(parsed.getTime())) return "—"

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export const PROGRESS_PHOTO_TYPE_OPTIONS: {
  value: ProgressPhotoType
  label: string
}[] = [
  { value: "front", label: "Front" },
  { value: "side", label: "Side" },
  { value: "back", label: "Back" },
  { value: "full_body", label: "Full body" },
  { value: "other", label: "Other" },
]

export function progressPhotoTypeLabel(type: ProgressPhotoType): string {
  return (
    PROGRESS_PHOTO_TYPE_OPTIONS.find((option) => option.value === type)?.label ??
    "Other"
  )
}

export function comparePhotosByTakenAt(
  photos: ClientProgressPhoto[],
): [ClientProgressPhoto, ClientProgressPhoto] | null {
  if (photos.length !== 2) return null

  const sorted = [...photos].sort((a, b) => {
    const aTime = new Date(`${a.taken_at}T12:00:00`).getTime()
    const bTime = new Date(`${b.taken_at}T12:00:00`).getTime()
    if (aTime !== bTime) return aTime - bTime
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })

  return [sorted[0], sorted[1]]
}
