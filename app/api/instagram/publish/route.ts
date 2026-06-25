import { ensurePostAnalyticsRow } from "@/lib/marketing/analytics/ensure-post-analytics-row"
import { markContentPostPublishFailed } from "@/lib/marketing/instagram/mark-content-post-publish-failed"
import { publishContentPostToInstagram } from "@/lib/marketing/instagram/publish-content-post-instagram"
import { isApprovedViralStatus } from "@/lib/marketing/post-pipeline"
import { createClient } from "@/lib/supabase/server"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export const maxDuration = 300

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json(
      { data: null, error: { message: "Not authenticated." } },
      { status: 401 },
    )
  }

  const body = await req.json()
  const contentPostId =
    typeof body.contentPostId === "string" ? body.contentPostId.trim() : ""

  if (!contentPostId) {
    return Response.json(
      { data: null, error: { message: "contentPostId is required." } },
      { status: 400 },
    )
  }

  const { data: post, error: postError } = await supabase
    .from("content_posts")
    .select("*")
    .eq("id", contentPostId)
    .or(`user_id.eq.${user.id},created_by.eq.${user.id}`)
    .single()

  if (postError || !post) {
    return Response.json(
      {
        data: null,
        error: { message: postError?.message ?? "Post not found." },
      },
      { status: 404 },
    )
  }

  const ownerScopeId = user.id

  if (post.status === "published") {
    return Response.json(
      {
        data: null,
        error: { message: "This post is already published." },
      },
      { status: 400 },
    )
  }

  const publishableStatuses = new Set(["draft", "scheduled", "failed"])
  if (!publishableStatuses.has(post.status)) {
    return Response.json(
      {
        data: null,
        error: {
          message: "Only draft or scheduled posts can be published to Instagram.",
        },
      },
      { status: 400 },
    )
  }

  const postStatus = post.status?.trim().toLowerCase() ?? ""
  const isEligibleForPublish =
    isApprovedViralStatus(post.viral_status) || postStatus === "scheduled"
  if (!isEligibleForPublish) {
    return Response.json(
      {
        data: null,
        error: {
          message:
            "Post must be approved before publishing to Instagram. Approve it in the pipeline first.",
        },
      },
      { status: 400 },
    )
  }

  let postToPublish = post

  if (post.status === "draft") {
    const now = new Date().toISOString()
    const { data: promotedPost, error: promoteError } = await supabase
      .from("content_posts")
      .update({
        status: "scheduled",
        scheduled_at: now,
        publish_error: null,
        updated_at: now,
      })
      .eq("id", contentPostId)
      .or(`user_id.eq.${ownerScopeId},created_by.eq.${ownerScopeId}`)
      .select("*")
      .single()

    if (promoteError || !promotedPost) {
      return Response.json(
        {
          data: null,
          error: {
            message:
              promoteError?.message ??
              "Could not schedule post before publishing.",
          },
        },
        { status: 500 },
      )
    }

    postToPublish = promotedPost
  }

  const publishResult = await publishContentPostToInstagram(
    supabase,
    postToPublish,
  )

  if (!publishResult.ok) {
    await markContentPostPublishFailed(
      supabase,
      contentPostId,
      ownerScopeId,
      publishResult.error,
      { keepScheduled: true },
    )

    return Response.json(
      { data: null, error: { message: publishResult.error } },
      { status: 400 },
    )
  }

  const publishedAt = new Date().toISOString()

  const { data: updatedPost, error: updateError } = await supabase
    .from("content_posts")
    .update({
      status: "published",
      published_at: publishedAt,
      external_post_id: publishResult.externalPostId,
      publish_error: null,
      updated_at: publishedAt,
    })
    .eq("id", contentPostId)
    .or(`user_id.eq.${ownerScopeId},created_by.eq.${ownerScopeId}`)
    .select()
    .single()

  if (updateError || !updatedPost) {
    return Response.json(
      {
        data: null,
        error: {
          message:
            updateError?.message ??
            "Published to Instagram but failed to update the post record.",
        },
        externalPostId: publishResult.externalPostId,
      },
      { status: 500 },
    )
  }

  await ensurePostAnalyticsRow(supabase, updatedPost)

  return Response.json({
    data: updatedPost,
    error: null,
    externalPostId: publishResult.externalPostId,
  })
}
