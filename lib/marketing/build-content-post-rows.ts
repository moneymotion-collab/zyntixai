import type { ContentCategory } from "@/lib/marketing/content-categories"
import type { ContentGoal } from "@/lib/marketing/content-goals"
import type { ContentIdeaItem } from "@/lib/marketing/content-idea-types"

const PLATFORMS = ["Instagram", "TikTok", "Facebook"] as const
const DEFAULT_CATEGORY: ContentCategory = "Workout"
const DEFAULT_GOAL: ContentGoal = "Increase Engagement"

export function buildContentPostRows(
  ideas: ContentIdeaItem[],
  userId: string,
  categories: ContentCategory[] = [],
  goals: ContentGoal[] = [],
) {
  return ideas.map((idea, index) => ({
    user_id: userId,
    created_by: userId,
    title: idea.title,
    caption: idea.caption,
    hashtags: idea.hashtags,
    viral_score: idea.viral_score,
    viral_reason: idea.viral_reason,
    platform: PLATFORMS[index % PLATFORMS.length],
    category:
      categories[index % categories.length] ??
      categories[0] ??
      DEFAULT_CATEGORY,
    goal: goals[index % goals.length] ?? goals[0] ?? DEFAULT_GOAL,
    status: "draft" as const,
  }))
}
