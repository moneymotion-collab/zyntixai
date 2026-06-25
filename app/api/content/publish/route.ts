import { getAiCoachAuth } from "@/lib/ai-coach/access"
import { ensurePostAnalyticsRow } from "@/lib/marketing/analytics/ensure-post-analytics-row"
import { isInstagramPlatform } from "@/lib/marketing/platform-utils"
import { publishContentPost } from "@/lib/marketing/publish-content-post"
import { markPublishFailed } from "@/lib/publishers/mark-publish-failed"
import { createClient } from "@/lib/supabase/server"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  const supabase = await createClient()
  const authResult = await getAiCoachAuth(supabase)

  if (!authResult.ok) {
    return Response.json(
      { data: null, error: { message: authResult.error } },
      { status: authResult.status },
    )
  }

  const { id, published_at } = await req.json()
  const publishedAt =
    typeof published_at === "string" && published_at.trim()
      ? published_at
      : new Date().toISOString()

  let fetchQuery = supabase.from("content_posts").select("*").eq("id", id)

  if (!authResult.auth.isAdmin) {
    fetchQuery = fetchQuery.eq("created_by", authResult.auth.userId)
  }

  const { data: existing, error: fetchError } = await fetchQuery.single()

  if (fetchError || !existing) {
    return Response.json({
      data: null,
      error: { message: fetchError?.message ?? "Post not found." },
    })
  }

  if (isInstagramPlatform(existing.platform)) {
    return Response.json({
      data: null,
      error: {
        message:
          "Instagram posts must be published through the Instagram publish API.",
      },
    }, { status: 400 })
  }

  if (existing.status !== "scheduled") {
    return Response.json({
      data: null,
      error: {
        message: "Only scheduled posts can be published.",
      },
    }, { status: 400 })
  }

  const publishResult = await publishContentPost(supabase, existing)

  if (!publishResult.ok) {
    await markPublishFailed(
      supabase,
      "content_posts",
      existing,
      publishedAt,
      { error: publishResult.error },
    )

    return Response.json({
      data: null,
      error: { message: publishResult.error },
    }, { status: 502 })
  }

  let query = supabase
    .from("content_posts")
    .update({
      status: "published",
      published_at: publishedAt,
      external_post_id: publishResult.externalPostId ?? null,
      publish_error: null,
      updated_at: publishedAt,
    })
    .eq("id", id)

  if (!authResult.auth.isAdmin) {
    query = query.eq("created_by", authResult.auth.userId)
  }

  const { data, error } = await query.select().single()

  if (data) {
    await ensurePostAnalyticsRow(supabase, data)
  }

  return Response.json({
    data,
    error,
    social: publishResult.social ?? null,
  })
}
