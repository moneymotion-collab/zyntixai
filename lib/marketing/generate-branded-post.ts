import { isAiMockMode } from "@/lib/ai-coach/mock-mode"
import {
  createChatCompletion,
  isAiQuotaError,
} from "@/lib/ai-coach/openai"
import {
  buildBrandContext,
  type BrandProfile,
} from "@/lib/marketing/brand-profile"
import {
  parseGeneratedPostResponse,
  type GeneratedPost,
} from "@/lib/marketing/generated-post"
import { VIRAL_SCORE_JSON_RULES } from "@/lib/marketing/viral-score"

type GenerateBrandedPostInput = {
  brand: Pick<
    BrandProfile,
    | "name"
    | "description"
    | "niche"
    | "target_audience"
    | "tone_of_voice"
    | "goals"
    | "platform_focus"
  >
  platform: string
  topic: string
  toneOfVoice?: string
}

function buildSystemPrompt(): string {
  return `You are a social media marketing assistant for gyms and fitness brands.
Write one ready-to-post social media post.
Return ONLY valid JSON in this exact shape:
{"title":"...","content":"...","hashtags":"...","viral_score":0,"viral_reason":"..."}
title: short hook (3–8 words)
content: 1–3 sentences of post copy, platform-appropriate
hashtags: 3–5 hashtags as one string (e.g. "#fitness #gym")
${VIRAL_SCORE_JSON_RULES}`
}

function buildUserPrompt({
  brand,
  platform,
  topic,
  toneOfVoice,
}: GenerateBrandedPostInput): string {
  const tone =
    toneOfVoice?.trim() ||
    brand.tone_of_voice.trim() ||
    "professional and motivating"

  const brandContext = buildBrandContext({
    ...brand,
    name: brand.name || "Gym",
    tone_of_voice: tone,
    mascot_name: "",
    mascot_description: "",
    mascot_style: "",
    mascot_voice_tone: "",
  })

  return `Create one ${platform} post about: ${topic}

${brandContext}

Return JSON only.`
}

function buildMockGeneratedPost({
  platform,
  topic,
}: GenerateBrandedPostInput): GeneratedPost {
  return {
    title: `${topic} — quick win`,
    content: `Here's the truth about ${topic.toLowerCase()}: small consistent steps beat perfect plans. Save this and try it on your next session.`,
    hashtags: "#fitness #gym #coaching #workout #motivation",
    viral_score: 78,
    viral_reason: `Practical ${platform} tip with a save-worthy hook for fitness audiences.`,
  }
}

export async function generateBrandedPost(
  input: GenerateBrandedPostInput,
): Promise<
  | { ok: true; post: GeneratedPost; warning?: string }
  | { ok: false; error: string }
> {
  if (isAiMockMode()) {
    return { ok: true, post: buildMockGeneratedPost(input) }
  }

  const userPrompt = buildUserPrompt(input)

  const result = await createChatCompletion(
    [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: userPrompt },
    ],
    { prompt: userPrompt },
  )

  if (!result.ok) {
    if (isAiQuotaError(result.error, result.status)) {
      return {
        ok: true,
        post: buildMockGeneratedPost(input),
        warning:
          "OpenAI quota reached — showing a sample post. Add billing at platform.openai.com or set AI_MOCK_MODE=true in .env.local.",
      }
    }
    return result
  }

  const post = parseGeneratedPostResponse(result.content)

  if (!post) {
    return {
      ok: false,
      error: "Could not parse generated post from AI response.",
    }
  }

  return { ok: true, post }
}
