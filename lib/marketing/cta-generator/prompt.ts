import { CTA_CATEGORY_META } from "@/lib/marketing/cta-generator/categories"
import {
  CTA_CATEGORIES,
  CTAS_PER_GENERATION,
  type GenerateCtaGeneratorInput,
} from "@/lib/marketing/cta-generator/types"
import { DEFAULT_CAMPAIGN_TARGET_AUDIENCE } from "@/lib/marketing/campaign-content-types"
import { FITCORE_BRAND_NAME } from "@/lib/marketing/visual-identity"
import {
  appendLearningContext,
  LEARNING_CONTEXT_SYSTEM_RULES,
} from "@/lib/marketing/learning/build-learning-context"

const CATEGORY_GUIDE = CTA_CATEGORIES.map((category) => {
  const meta = CTA_CATEGORY_META[category]
  return `- ${category}: ${meta.description} Example: "${meta.examples[0]}"`
}).join("\n")

export const CTA_GENERATOR_SYSTEM_PROMPT = `You are an elite conversion copywriter for fitness SaaS and coaching businesses.
You write high-converting call-to-action lines for video outros, ads, landing pages, and social posts.
Always respond in valid JSON only — no markdown, no commentary.

${LEARNING_CONTEXT_SYSTEM_RULES}`

export function buildCtaGeneratorUserPrompt(
  input: GenerateCtaGeneratorInput,
): string {
  const audience = input.targetAudience.trim() || DEFAULT_CAMPAIGN_TARGET_AUDIENCE
  const brand = input.brandName?.trim() || FITCORE_BRAND_NAME
  const categoryList = CTA_CATEGORIES.join(" | ")

  return appendLearningContext(
    `Generate a CTA library for this marketing campaign.

Campaign name: ${input.campaignName}
Brand: ${brand}
Target audience: ${audience}
Platform: ${input.platform}
Campaign goal: ${input.campaignGoal}

CTA categories and patterns:
${CATEGORY_GUIDE}

Return ONLY JSON:

{
  "ctas": [
    {
      "text": "",
      "category": "${categoryList}"
    }
  ]
}

Rules:
- Provide exactly ${CTAS_PER_GENERATION} CTAs — one per category (${categoryList}).
- Each CTA: 4–10 words, title case, confident and direct.
- Speak to gym owners, personal trainers, and online coaches.
- Align every CTA with campaign goal: ${input.campaignGoal}.
- Use "${brand}" in at least one CTA where natural (e.g. beta, platform).
- No hashtags, emojis, periods at the end, or quotation marks inside the text.
- Vary structure — commands, invitations, and value promises.
- Fit ${input.platform} video outros, ad end cards, and post captions.`,
    input.learningContext,
  )
}
