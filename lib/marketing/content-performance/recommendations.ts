import {
  buildPlatformPerformance,
  findBestPerformingPost,
  getBestContentType,
} from "@/lib/marketing/content-performance/analytics-engine"
import type {
  ContentPerformanceRecommendations,
  ContentPerformanceRow,
} from "@/lib/marketing/content-performance/types"

const CTA_BY_CONTENT_TYPE: Record<string, string> = {
  Transformation: "Comment TRANSFORM and I'll send you the 7-day starter plan.",
  Nutrition: "Save this meal prep guide and tag a friend who needs it.",
  Workout: "Save this workout and try it today — comment DONE when you finish.",
  Motivation: "Share this with someone who needs a push today.",
  "Member Story": "DM us STORY if you want to be featured next.",
  Promotion: "Book your free trial — link in bio before spots fill up.",
  Educational: "Save this cheat sheet and follow for more form tips.",
  educational: "Save this cheat sheet and follow for more form tips.",
  promotional: "Claim your free session — link in bio.",
}

const WEEKLY_FOCUS_BY_RATE: Array<{ min: number; focus: string }> = [
  {
    min: 7,
    focus:
      "Scale what works: publish 3 posts in your top format and repurpose your best hook.",
  },
  {
    min: 3,
    focus:
      "Test hooks and CTAs: ship 2 new openings this week and compare engagement.",
  },
  {
    min: 0,
    focus:
      "Rebuild fundamentals: one strong hook, one clear value point, one CTA per post.",
  },
]

function pickWeeklyFocus(avgRate: number): string {
  for (const entry of WEEKLY_FOCUS_BY_RATE) {
    if (avgRate >= entry.min) return entry.focus
  }
  return WEEKLY_FOCUS_BY_RATE[WEEKLY_FOCUS_BY_RATE.length - 1].focus
}

function pickSuggestedCta(contentType: string, platform: string): string {
  const direct = CTA_BY_CONTENT_TYPE[contentType]
  if (direct) return direct

  if (platform.toLowerCase().includes("tiktok")) {
    return "Follow for daily gym tips — comment which exercise you want next."
  }
  if (platform.toLowerCase().includes("instagram")) {
    return "Save this post and share it to your story."
  }

  return "Save this post and tell us your biggest fitness goal in the comments."
}

export function buildContentPerformanceRecommendations(
  rows: ContentPerformanceRow[],
): ContentPerformanceRecommendations {
  const bestPost = findBestPerformingPost(rows)
  const bestContentType = getBestContentType(rows) ?? "Educational"
  const platformLeader = buildPlatformPerformance(rows)[0]
  const bestPlatform = platformLeader?.platform ?? bestPost?.platform ?? "Instagram"
  const avgRate = platformLeader?.avgEngagementRate ?? bestPost?.engagement_rate ?? 0

  const suggestedNextPost = bestPost
    ? `Create another ${bestContentType} post for ${bestPlatform} using a hook similar to "${bestPost.title}".`
    : `Publish a ${bestContentType} post on ${bestPlatform} with a problem-solution hook.`

  return {
    bestContentType,
    bestPlatform,
    suggestedNextPost,
    suggestedCta: pickSuggestedCta(bestContentType, bestPlatform),
    weeklyFocus: pickWeeklyFocus(avgRate),
  }
}
