import type { SupabaseClient } from "@supabase/supabase-js"
import type { AiCoachAuthContext } from "@/lib/ai-coach/access"
import type { Database } from "@/lib/database.types"

type ContentPostRow = Database["public"]["Tables"]["content_posts"]["Row"]

type AccessError = { ok: false; status: number; error: string }
type AccessSuccess<T> = { ok: true } & T

export async function getUserBrandId(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("brand_profiles")
    .select("id")
    .eq("owner_id", userId)
    .maybeSingle()

  return data?.id ?? null
}

export async function assertContentPostBrandAccess(
  supabase: SupabaseClient<Database>,
  post: Pick<ContentPostRow, "brand_id">,
  userId: string,
  requestedBrandId?: string,
): Promise<{ ok: true } | AccessError> {
  const userBrandId = await getUserBrandId(supabase, userId)
  const postBrandId = post.brand_id?.trim() || null
  const requestBrandId = requestedBrandId?.trim() || null

  if (postBrandId && userBrandId && postBrandId !== userBrandId) {
    return {
      ok: false,
      status: 403,
      error: "Post does not belong to your brand.",
    }
  }

  if (requestBrandId) {
    if (userBrandId && requestBrandId !== userBrandId) {
      return {
        ok: false,
        status: 403,
        error: "Brand access denied.",
      }
    }

    if (postBrandId && postBrandId !== requestBrandId) {
      return {
        ok: false,
        status: 403,
        error: "Post does not match the requested brand.",
      }
    }
  }

  return { ok: true }
}

export function applyContentPostOwnerFilter<
  Q extends { or: (filters: string) => Q; eq: (column: string, value: string) => Q },
>(query: Q, auth: AiCoachAuthContext): Q {
  if (auth.isAdmin) {
    return query
  }

  return query.or(
    `created_by.eq.${auth.userId},user_id.eq.${auth.userId}`,
  )
}

export async function loadOwnedContentPost(
  supabase: SupabaseClient<Database>,
  postId: string,
  auth: AiCoachAuthContext,
  options?: { brandId?: string },
): Promise<
  AccessSuccess<{ post: ContentPostRow }> | AccessError
> {
  let query = supabase.from("content_posts").select("*").eq("id", postId)

  if (!auth.isAdmin) {
    query = query.or(
      `created_by.eq.${auth.userId},user_id.eq.${auth.userId}`,
    )
  }

  const { data: post, error } = await query.maybeSingle()

  if (error) {
    return { ok: false, status: 500, error: error.message }
  }

  if (!post) {
    return { ok: false, status: 404, error: "Post not found." }
  }

  const brandCheck = await assertContentPostBrandAccess(
    supabase,
    post,
    auth.userId,
    options?.brandId,
  )

  if (brandCheck.ok === false) {
    return brandCheck
  }

  return { ok: true, post }
}
