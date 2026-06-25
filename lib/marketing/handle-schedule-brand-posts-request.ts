import { NextResponse } from "next/server"
import { getAiCoachAuth } from "@/lib/ai-coach/access"
import { getBestPostTime } from "@/lib/marketing/best-time-scheduler"
import { APPROVED_VIRAL_STATUSES } from "@/lib/marketing/post-pipeline"
import { createClient } from "@/lib/supabase/server"

type ScheduleBrandPostsBody = {
  brand_id?: unknown
}


function parseBrandId(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) {
    return null
  }

  return value.trim()
}

export async function handleScheduleBrandPostsRequest(req: Request) {
  const supabase = await createClient()
  const authResult = await getAiCoachAuth(supabase)

  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    )
  }

  let body: ScheduleBrandPostsBody

  try {
    body = (await req.json()) as ScheduleBrandPostsBody
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const brandId = parseBrandId(body.brand_id)

  if (!brandId) {
    return NextResponse.json({ error: "brand_id is required." }, { status: 400 })
  }

  const { data: brand, error: brandError } = await supabase
    .from("brand_profiles")
    .select("id")
    .eq("id", brandId)
    .eq("owner_id", authResult.auth.userId)
    .maybeSingle()

  if (brandError) {
    return NextResponse.json({ error: brandError.message }, { status: 500 })
  }

  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 })
  }

  const { data: posts, error: postsError } = await supabase
    .from("content_posts")
    .select("*")
    .eq("brand_id", brandId)
    .eq("created_by", authResult.auth.userId)
    .in("viral_status", [...APPROVED_VIRAL_STATUSES])
    .is("scheduled_at", null)
    .order("created_at", { ascending: true })

  if (postsError) {
    return NextResponse.json({ error: postsError.message }, { status: 500 })
  }

  if (!posts?.length) {
    return NextResponse.json({
      message: "No posts to schedule",
    })
  }

  const now = new Date().toISOString()
  const updates = []

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i]
    const scheduledAt = getBestPostTime(i).toISOString()

    const { data: updated, error: updateError } = await supabase
      .from("content_posts")
      .update({
        scheduled_at: scheduledAt,
        status: "scheduled",
        updated_at: now,
      })
      .eq("id", post.id)
      .eq("created_by", authResult.auth.userId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    updates.push(updated)
  }

  return NextResponse.json({
    success: true,
    scheduled: updates.length,
    posts: updates,
  })
}
