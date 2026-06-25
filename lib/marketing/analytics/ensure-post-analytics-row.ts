import { loadOrCreateBrandProfile } from "@/lib/marketing/brand-profile"
import type { Database } from "@/lib/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

type PostForAnalytics = Pick<
  Database["public"]["Tables"]["content_posts"]["Row"],
  "id" | "brand_id" | "platform" | "created_by" | "user_id"
>

async function resolveBrandId(
  supabase: SupabaseClient<Database>,
  post: PostForAnalytics,
): Promise<string | null> {
  if (post.brand_id) {
    return post.brand_id
  }

  const ownerId = post.created_by || post.user_id
  const { profile, error } = await loadOrCreateBrandProfile(supabase, ownerId)

  if (error || !profile) {
    return null
  }

  return profile.id
}

export async function ensurePostAnalyticsRow(
  supabase: SupabaseClient<Database>,
  post: PostForAnalytics,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: existing, error: fetchError } = await supabase
    .from("analytics")
    .select("id")
    .eq("post_id", post.id)
    .limit(1)
    .maybeSingle()

  if (fetchError) {
    return { ok: false, error: fetchError.message }
  }

  if (existing) {
    return { ok: true }
  }

  const brandId = await resolveBrandId(supabase, post)
  if (!brandId) {
    return { ok: false, error: "Could not resolve brand for analytics." }
  }

  const { error: insertError } = await supabase.from("analytics").insert({
    post_id: post.id,
    brand_id: brandId,
    platform: post.platform ?? "",
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0,
  })

  if (insertError) {
    return { ok: false, error: insertError.message }
  }

  return { ok: true }
}

export async function syncPublishedPostAnalytics(
  supabase: SupabaseClient<Database>,
  userId: string,
  isAdmin: boolean,
): Promise<{ error: Error | null }> {
  let query = supabase
    .from("content_posts")
    .select("id, brand_id, platform, created_by, user_id")
    .eq("status", "published")

  if (!isAdmin) {
    query = query.eq("created_by", userId)
  }

  const { data: posts, error } = await query

  if (error) {
    return { error }
  }

  for (const post of posts ?? []) {
    await ensurePostAnalyticsRow(supabase, post)
  }

  return { error: null }
}
