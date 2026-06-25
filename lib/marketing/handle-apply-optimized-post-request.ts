import { NextResponse } from "next/server"
import type { OptimizePostSourceTable } from "@/lib/marketing/handle-marketing-optimize-post-request"
import { createClient } from "@/lib/supabase/server"

type ApplyOptimizedBody = {
  post_id?: unknown
  source_table?: unknown
}

function parseSourceTable(value: unknown): OptimizePostSourceTable {
  if (value === "scheduled_posts") return "scheduled_posts"
  return "content_posts"
}

function parsePostId(body: ApplyOptimizedBody): string | null {
  const rawId = typeof body.post_id === "string" ? body.post_id : undefined
  if (!rawId?.trim()) return null
  return rawId.trim()
}

export async function handleApplyOptimizedPostRequest(req: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: ApplyOptimizedBody

  try {
    body = (await req.json()) as ApplyOptimizedBody
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const postId = parsePostId(body)

  if (!postId) {
    return NextResponse.json({ error: "post_id is required." }, { status: 400 })
  }

  const sourceTable = parseSourceTable(body.source_table)

  if (sourceTable === "content_posts") {
    const { data: post, error: fetchError } = await supabase
      .from("content_posts")
      .select(
        "id, optimized_title, optimized_caption, optimized_content, optimized_hashtags",
      )
      .eq("id", postId)
      .eq("created_by", user.id)
      .maybeSingle()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 })
    }

    const title = post.optimized_title?.trim()
    const caption =
      post.optimized_caption?.trim() || post.optimized_content?.trim()
    const hashtags = post.optimized_hashtags?.trim() ?? ""

    if (!title || !caption) {
      return NextResponse.json(
        { error: "No optimized version available to apply." },
        { status: 400 },
      )
    }

    const { error: updateError } = await supabase
      .from("content_posts")
      .update({
        title,
        caption,
        hashtags,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId)
      .eq("created_by", user.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      title,
      caption,
      hashtags,
    })
  }

  const { data: post, error: fetchError } = await supabase
    .from("scheduled_posts")
    .select(
      "id, optimized_title, optimized_caption, optimized_content, optimized_hashtags",
    )
    .eq("id", postId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 })
  }

  const title = post.optimized_title?.trim()
  const caption =
    post.optimized_caption?.trim() || post.optimized_content?.trim()
  const hashtags = post.optimized_hashtags?.trim() ?? ""

  if (!title || !caption) {
    return NextResponse.json(
      { error: "No optimized version available to apply." },
      { status: 400 },
    )
  }

  const content = [caption, hashtags].filter(Boolean).join("\n\n")

  const { error: updateError } = await supabase
    .from("scheduled_posts")
    .update({
      hook: title,
      content,
    })
    .eq("id", postId)
    .eq("user_id", user.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    title,
    caption,
    hashtags,
  })
}
