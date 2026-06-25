import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { socialEnvFromProcess } from "@/lib/marketing/social-publish"

export type InstagramCredentials = {
  accessToken: string
  userId: string
}

export async function loadInstagramCredentials(
  _supabase: SupabaseClient<Database>,
  _userId: string,
): Promise<InstagramCredentials | null> {
  const env = socialEnvFromProcess()

  if (!env.instagramAccessToken?.trim() || !env.instagramUserId?.trim()) {
    return null
  }

  return {
    accessToken: env.instagramAccessToken.trim(),
    userId: env.instagramUserId.trim(),
  }
}
