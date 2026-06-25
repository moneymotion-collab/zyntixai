import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

export const EXERCISE_IMAGES_BUCKET = "exercise-images"

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

export function buildExerciseImagePath(
  userId: string,
  exerciseId: string,
  filename: string,
): string {
  return `${userId}/${exerciseId}/${sanitizeFilename(filename)}`
}

export function validateExerciseImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "Only JPEG, PNG, WebP, and GIF images are allowed."
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Each image must be 10 MB or smaller."
  }
  return null
}

export async function uploadExerciseImages(
  supabase: SupabaseClient<Database>,
  userId: string,
  exerciseId: string,
  files: File[],
): Promise<{ urls: string[]; error: string | null }> {
  const urls: string[] = []

  for (const file of files) {
    const validationError = validateExerciseImageFile(file)
    if (validationError) {
      return { urls: [], error: validationError }
    }

    const path = buildExerciseImagePath(userId, exerciseId, file.name)
    const { error } = await supabase.storage
      .from(EXERCISE_IMAGES_BUCKET)
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      return { urls: [], error: error.message }
    }

    const { data } = supabase.storage.from(EXERCISE_IMAGES_BUCKET).getPublicUrl(path)
    if (data.publicUrl) {
      urls.push(data.publicUrl)
    }
  }

  return { urls, error: null }
}
