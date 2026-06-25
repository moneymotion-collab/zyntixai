import {
  CAMPAIGN_CONTENT_TYPES,
  CAMPAIGN_STRATEGY_CATEGORIES,
  DEFAULT_CAMPAIGN_TARGET_AUDIENCE,
  formatCampaignContentTypeLabel,
} from "@/lib/marketing/campaign-content-types"
import type {
  GenerateCampaignContentInput,
} from "@/lib/marketing/campaign-content-types"
import {
  appendLearningContext,
  LEARNING_CONTEXT_SYSTEM_RULES,
} from "@/lib/marketing/learning/build-learning-context"

export const CAMPAIGN_STRATEGIST_SYSTEM_PROMPT = `You are a world-class social media strategist specializing in fitness businesses.
You create complete marketing campaigns for gyms, personal trainers, and online coaches.
Always respond in valid JSON only — no markdown, no commentary.

${LEARNING_CONTEXT_SYSTEM_RULES}`

export function buildCampaignStrategistUserPrompt(
  input: GenerateCampaignContentInput,
  startDay: number,
  endDay: number,
): string {
  const itemCount = endDay - startDay + 1
  const audience = input.targetAudience.trim() || DEFAULT_CAMPAIGN_TARGET_AUDIENCE
  const contentTypeList = CAMPAIGN_CONTENT_TYPES.map(formatCampaignContentTypeLabel).join(
    " | ",
  )
  const categoryList = CAMPAIGN_STRATEGY_CATEGORIES.join(" | ")

  return appendLearningContext(
    `Create a complete marketing campaign as a world-class social media strategist.

Target audience: ${audience}
(Businesses serving: gyms, personal trainers, and online coaches)

Campaign name: ${input.campaignName}
Platform: ${input.platform}
Campaign goal: ${input.campaignGoal}
Total campaign length: ${input.durationDays} days
Generate content for day ${startDay} through day ${endDay}.

Every post must help the business:
- Build authority
- Increase engagement
- Generate leads
- Promote trust

Rotate strategic intent across the four pillars (Authority, Engagement, Lead Generation, Trust).

Return ONLY JSON:

{
  "items": [
    {
      "day": ${startDay},
      "hook": "",
      "content_type": "${contentTypeList}",
      "caption": "",
      "cta": "",
      "hashtags": "",
      "category": "${categoryList}"
    }
  ]
}

Rules:
- Provide exactly ${itemCount} items numbered day ${startDay} through ${endDay}.
- Vary content_type across: ${contentTypeList}.
- Each category must be one of: ${categoryList}.
- Balance the four strategic pillars across the campaign.
- Each hook must be scroll-stopping (under 12 words).
- Each caption should be 1-3 sentences, ready to post on ${input.platform}.
- Speak to gym owners, personal trainers, and online coaches — or their clients where relevant.
- hashtags: single string with 4-6 relevant hashtags (e.g. "#fitness #personaltrainer #gymowner").
- cta: clear action (comment, DM, save, share, book, or sign up).
- Align every post with campaign goal: ${input.campaignGoal}.
- Educational posts teach; testimonials build trust; BTS humanizes the brand; offers drive leads.`,
    input.learningContext,
  )
}
