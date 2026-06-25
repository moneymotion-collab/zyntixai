import { getAiCoachAuth } from "@/lib/ai-coach/access"
import { generateBrandedPost } from "@/lib/marketing/generate-branded-post"
import { createClient } from "@/lib/supabase/server"

type GeneratePostBody = {
  brand_id?: unknown
  platform?: unknown
  topic?: unknown
  tone_of_voice?: unknown
}

function parseRequiredString(value: unknown, field: string): string | null {
  if (typeof value !== "string" || !value.trim()) {
    return null
  }
  return value.trim()
}

export async function handleGeneratePostRequest(req: Request) {
  const supabase = await createClient()
  const authResult = await getAiCoachAuth(supabase)

  if (!authResult.ok) {
    return Response.json(
      { error: { message: authResult.error } },
      { status: authResult.status },
    )
  }

  let body: GeneratePostBody

  try {
    body = (await req.json()) as GeneratePostBody
  } catch {
    return Response.json(
      { error: { message: "Invalid request body." } },
      { status: 400 },
    )
  }

  const brandId = parseRequiredString(body.brand_id, "brand_id")
  const platform = parseRequiredString(body.platform, "platform")
  const topic = parseRequiredString(body.topic, "topic")
  const toneOfVoice =
    typeof body.tone_of_voice === "string" ? body.tone_of_voice.trim() : ""

  if (!brandId || !platform || !topic) {
    return Response.json(
      {
        error: {
          message: "brand_id, platform, and topic are required.",
        },
      },
      { status: 400 },
    )
  }

  const { data: brand, error: brandError } = await supabase
    .from("brand_profiles")
    .select(
      "id, name, description, niche, target_audience, tone_of_voice, goals, platform_focus",
    )
    .eq("id", brandId)
    .eq("owner_id", authResult.auth.userId)
    .maybeSingle()

  if (brandError) {
    return Response.json(
      { error: { message: brandError.message } },
      { status: 500 },
    )
  }

  if (!brand) {
    return Response.json(
      { error: { message: "Brand profile not found." } },
      { status: 404 },
    )
  }

  const result = await generateBrandedPost({
    brand,
    platform,
    topic,
    toneOfVoice: toneOfVoice || undefined,
  })

  if (!result.ok) {
    return Response.json({ error: { message: result.error } }, { status: 500 })
  }

  const generatedPost = result.post

  const { data, error } = await supabase
    .from("content_posts")
    .insert({
      user_id: authResult.auth.userId,
      created_by: authResult.auth.userId,
      brand_id: brandId,
      title: generatedPost.title,
      caption: generatedPost.content,
      hashtags: generatedPost.hashtags,
      platform,
      topic,
      viral_score: generatedPost.viral_score,
      viral_reason: generatedPost.viral_reason,
      status: "draft",
    })
    .select("*")
    .single()

  if (error) {
    return Response.json({ error: { message: error.message } }, { status: 500 })
  }

  return Response.json({
    post: data,
    warning: result.warning,
  })
}
