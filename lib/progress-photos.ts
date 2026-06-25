import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

export const PROGRESS_PHOTOS_BUCKET = "progress-photos"

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
])

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 120)
}

export function buildProgressPhotoPath(
  coachId: string,
  memberId: string,
  filename: string,
): string {
  return `${coachId}/${memberId}/${Date.now()}-${sanitizeFilename(filename)}`
}

export function validateProgressPhotoFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "Only JPEG, PNG, WebP, and GIF images are allowed."
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Each image must be 10 MB or smaller."
  }
  return null
}

export async function uploadProgressPhoto(
  supabase: SupabaseClient<Database>,
  coachId: string,
  memberId: string,
  file: File,
): Promise<{ photoUrl: string | null; error: string | null }> {
  const validationError = validateProgressPhotoFile(file)
  if (validationError) {
    return { photoUrl: null, error: validationError }
  }

  const path = buildProgressPhotoPath(coachId, memberId, file.name)
  const { error } = await supabase.storage
    .from(PROGRESS_PHOTOS_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    return { photoUrl: null, error: error.message }
  }

  const { data } = supabase.storage.from(PROGRESS_PHOTOS_BUCKET).getPublicUrl(path)
  if (!data.publicUrl) {
    return { photoUrl: null, error: "Could not resolve public photo URL." }
  }

  return { photoUrl: data.publicUrl, error: null }
}
