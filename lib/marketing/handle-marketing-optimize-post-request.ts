import { NextResponse } from "next/server"
import {
  runOptimizationEngine,
  type OptimizationEngineResult,
} from "@/lib/marketing/optimization-engine"
import { loadOrCreateBrandProfile } from "@/lib/marketing/brand-profile"
import { loadLearningContextBlock } from "@/lib/marketing/learning/load-learning-context"
import { loadOrCreateMarketingSettings } from "@/lib/marketing/marketing-settings"
import { createClient } from "@/lib/supabase/server"

export type OptimizePostSourceTable = "content_posts" | "scheduled_posts"

type OptimizePostBody = {
  post_id?: unknown
  source_table?: unknown
}

type LoadedPost = {
  sourceTable: OptimizePostSourceTable
  title: string
  content: string
  hashtags: string
  platform: string
  brandId: string | null
  existingScore: number | null
}

function parseSourceTable(value: unknown): OptimizePostSourceTable {
  if (value === "scheduled_posts") return "scheduled_posts"
  return "content_posts"
}

function parsePostId(body: OptimizePostBody): string | null {
  const rawId = typeof body.post_id === "string" ? body.post_id : undefined
  if (!rawId?.trim()) return null
  return rawId.trim()
}

function extractHashtagsFromContent(content: string): string {
  const tags = content.match(/#[\w\u00C0-\u024F]+/g) ?? []
  return tags.join(" ")
}

function stripHashtagsFromContent(content: string): string {
  return content
    .replace(/#[\w\u00C0-\u024F]+/g, "")
    .replace(/\s{2,}/g, " ")
    .trim()
}

async function loadTargetAudienceContext(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  brandId: string | null,
): Promise<{ niche: string; targetAudience: string }> {
  let niche = ""
  let targetAudience = ""

  if (brandId) {
    const { data: brand } = await supabase
      .from("brand_profiles")
      .select("niche, target_audience")
      .eq("id", brandId)
      .maybeSingle()

    if (brand) {
      niche = brand.niche?.trim() ?? ""
      targetAudience = brand.target_audience?.trim() ?? ""
    }
  }

  if (!targetAudience || !niche) {
    const { profile } = await loadOrCreateBrandProfile(supabase, userId)
    if (profile) {
      niche = niche || profile.niche?.trim() || ""
      targetAudience = targetAudience || profile.target_audience?.trim() || ""
    }
  }

  if (!targetAudience) {
    const { settings } = await loadOrCreateMarketingSettings(supabase, userId)
    if (settings?.target_audience?.trim()) {
      targetAudience = settings.target_audience.trim()
    }
  }

  return { niche, targetAudience }
}

async function loadPost(
  supabase: Awaited<ReturnType<typeof createClient>>,
  postId: string,
  userId: string,
  sourceTable: OptimizePostSourceTable,
): Promise<
  | { ok: true; post: LoadedPost }
  | { ok: false; status: number; error: string }
> {
  if (sourceTable === "content_posts") {
    const { data, error } = await supabase
      .from("content_posts")
      .select("id, title, caption, hashtags, platform, brand_id, viral_score, created_by")
      .eq("id", postId)
      .eq("created_by", userId)
      .maybeSingle()

    if (error) {
      return { ok: false, status: 500, error: error.message }
    }

    if (!data) {
      return { ok: false, status: 404, error: "Post not found." }
    }

    return {
      ok: true,
      post: {
        sourceTable,
        title: data.title?.trim() ?? "",
        content: data.caption?.trim() ?? "",
        hashtags: data.hashtags?.trim() ?? "",
        platform: data.platform?.trim() ?? "Instagram",
        brandId: data.brand_id,
        existingScore: data.viral_score,
      },
    }
  }

  const { data, error } = await supabase
    .from("scheduled_posts")
    .select("id, hook, content, platform, viral_score, user_id")
    .eq("id", postId)
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    return { ok: false, status: 500, error: error.message }
  }

  if (!data) {
    return { ok: false, status: 404, error: "Post not found." }
  }

  const rawContent = data.content?.trim() ?? ""
  const hashtags = extractHashtagsFromContent(rawContent)
  const content = stripHashtagsFromContent(rawContent)

  return {
    ok: true,
    post: {
      sourceTable,
      title: data.hook?.trim() ?? "",
      content,
      hashtags,
      platform: data.platform?.trim() ?? "Instagram",
      brandId: null,
      existingScore: data.viral_score,
    },
  }
}

async function saveOptimization(
  supabase: Awaited<ReturnType<typeof createClient>>,
  postId: string,
  userId: string,
  sourceTable: OptimizePostSourceTable,
  result: OptimizationEngineResult,
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const optimizationFields = {
    original_score: result.original_score,
    optimized_score: result.optimized_score,
    optimized_title: result.optimized_title,
    optimized_content: result.optimized_content,
    optimized_caption: result.optimized_caption,
    optimized_hashtags: result.optimized_hashtags,
    optimization_reason: result.optimization_reason,
    optimization_status: "optimized" as const,
  }

  if (sourceTable === "content_posts") {
    const { error } = await supabase
      .from("content_posts")
      .update({
        ...optimizationFields,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId)
      .eq("created_by", userId)

    if (error) {
      return { ok: false, status: 500, error: error.message }
    }

    return { ok: true }
  }

  const scheduledContent = [
    result.optimized_caption || result.optimized_content,
    result.optimized_hashtags,
  ]
    .filter(Boolean)
    .join("\n\n")

  const { error } = await supabase
    .from("scheduled_posts")
    .update({
      ...optimizationFields,
      hook: result.optimized_title,
      content: scheduledContent,
      viral_score: result.optimized_score,
    })
    .eq("id", postId)
    .eq("user_id", userId)

  if (error) {
    return { ok: false, status: 500, error: error.message }
  }

  return { ok: true }
}

export async function handleMarketingOptimizePostRequest(req: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: OptimizePostBody

  try {
    body = (await req.json()) as OptimizePostBody
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const postId = parsePostId(body)

  if (!postId) {
    return NextResponse.json({ error: "post_id is required." }, { status: 400 })
  }

  const sourceTable = parseSourceTable(body.source_table)

  const loaded = await loadPost(supabase, postId, user.id, sourceTable)

  if (!loaded.ok) {
    return NextResponse.json({ error: loaded.error }, { status: loaded.status })
  }

  const { niche, targetAudience } = await loadTargetAudienceContext(
    supabase,
    user.id,
    loaded.post.brandId,
  )

  const { context: learningContext } = await loadLearningContextBlock(
    supabase,
    user.id,
  )

  const optimization = await runOptimizationEngine({
    title: loaded.post.title,
    content: loaded.post.content,
    hashtags: loaded.post.hashtags,
    platform: loaded.post.platform,
    niche,
    targetAudience,
    originalScore: loaded.post.existingScore,
    learningContext,
  })

  if (!optimization.ok) {
    return NextResponse.json({ error: optimization.error }, { status: 500 })
  }

  const saved = await saveOptimization(
    supabase,
    postId,
    user.id,
    sourceTable,
    optimization.result,
  )

  if (!saved.ok) {
    return NextResponse.json({ error: saved.error }, { status: saved.status })
  }

  return NextResponse.json({
    success: true,
    source_table: sourceTable,
    original_score: optimization.result.original_score,
    optimized_score: optimization.result.optimized_score,
    optimized_title: optimization.result.optimized_title,
    optimized_content: optimization.result.optimized_content,
    optimized_caption: optimization.result.optimized_caption,
    optimized_hashtags: optimization.result.optimized_hashtags,
    optimization_reason: optimization.result.optimization_reason,
    improvements: optimization.result.improvements,
    warning: optimization.warning,
  })
}
