import type { SupabaseClient } from "@supabase/supabase-js"

type EnsureStorageBucketOptions = {
  public?: boolean
  allowedMimeTypes?: string[]
}

export async function ensurePublicStorageBucket(
  supabase: SupabaseClient,
  bucketName: string,
  options?: EnsureStorageBucketOptions,
) {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()

  if (listError) {
    throw new Error(`Could not list storage buckets: ${listError.message}`)
  }

  const existing = buckets?.find((bucket) => bucket.name === bucketName)
  const shouldBePublic = options?.public ?? true

  if (existing) {
    if (shouldBePublic && !existing.public) {
      const { error: updateError } = await supabase.storage.updateBucket(bucketName, {
        public: true,
        ...(options?.allowedMimeTypes?.length
          ? { allowedMimeTypes: options.allowedMimeTypes }
          : {}),
      })

      if (updateError) {
        throw new Error(`Could not make bucket "${bucketName}" public: ${updateError.message}`)
      }
    }

    return
  }

  const { error: createError } = await supabase.storage.createBucket(bucketName, {
    public: shouldBePublic,
    ...(options?.allowedMimeTypes?.length
      ? { allowedMimeTypes: options.allowedMimeTypes }
      : {}),
  })

  if (createError) {
    throw new Error(`Could not create bucket "${bucketName}": ${createError.message}`)
  }
}

export const MARKETING_VIDEO_BUCKET =
  process.env.VIDEO_RENDER_BUCKET?.trim() || "videos"

export const MARKETING_VOICEOVER_BUCKET = "voiceovers"

export async function ensureMarketingVideoBucket(supabase: SupabaseClient) {
  await ensurePublicStorageBucket(supabase, MARKETING_VIDEO_BUCKET, {
    allowedMimeTypes: ["video/mp4"],
  })
}

export async function ensureMarketingVoiceoverBucket(supabase: SupabaseClient) {
  await ensurePublicStorageBucket(supabase, MARKETING_VOICEOVER_BUCKET, {
    allowedMimeTypes: ["audio/mpeg", "audio/mp3", "audio/wav"],
  })
}
