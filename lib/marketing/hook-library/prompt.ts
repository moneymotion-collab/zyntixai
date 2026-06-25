import { HOOK_CATEGORY_META } from "@/lib/marketing/hook-library/categories"
import {
  HOOK_CATEGORIES,
  HOOKS_PER_CAMPAIGN,
  type GenerateHookLibraryInput,
} from "@/lib/marketing/hook-library/types"
import { DEFAULT_CAMPAIGN_TARGET_AUDIENCE } from "@/lib/marketing/campaign-content-types"
import {
  appendLearningContext,
  LEARNING_CONTEXT_SYSTEM_RULES,
} from "@/lib/marketing/learning/build-learning-context"

const CATEGORY_GUIDE = HOOK_CATEGORIES.map((category) => {
  const meta = HOOK_CATEGORY_META[category]
  return `- ${category}: ${meta.description} Example: "${meta.examples[0]}"`
}).join("\n")

export const HOOK_LIBRARY_SYSTEM_PROMPT = `You are an elite short-form video and social media hook writer for fitness businesses.
You write scroll-stopping opening lines for gyms, personal trainers, and online coaches.
Always respond in valid JSON only — no markdown, no commentary.

${LEARNING_CONTEXT_SYSTEM_RULES}`

export function buildHookLibraryUserPrompt(
  input: GenerateHookLibraryInput,
): string {
  const audience = input.targetAudience.trim() || DEFAULT_CAMPAIGN_TARGET_AUDIENCE
  const categoryList = HOOK_CATEGORIES.join(" | ")

  return appendLearningContext(
    `Generate a hook library for this marketing campaign.

Campaign name: ${input.campaignName}
Target audience: ${audience}
Platform: ${input.platform}
Campaign goal: ${input.campaignGoal}

Hook categories and patterns:
${CATEGORY_GUIDE}

Return ONLY JSON:

{
  "hooks": [
    {
      "text": "",
      "category": "${categoryList}"
    }
  ]
}

Rules:
- Provide exactly ${HOOKS_PER_CAMPAIGN} hooks.
- Spread hooks across all six categories — at least one per category, no more than three in any single category.
- Each hook must be under 12 words — punchy, spoken, scroll-stopping.
- Write for ${input.platform} short-form content (reels, stories, TikTok).
- Speak to gym owners, personal trainers, and online coaches — or their clients where relevant.
- Align every hook with campaign goal: ${input.campaignGoal}.
- No hashtags, emojis, or quotation marks inside the hook text.
- Vary sentence structure — questions, bold claims, and pattern interrupts.`,
    input.learningContext,
  )
}
