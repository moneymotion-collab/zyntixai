import type { MarketingPost } from "@/lib/marketing/get-mock-marketing-data"

export type PublishingSummary = {
  published: number
  scheduled: number
  draft: number
  averageViralScore: number | null
  scoredPosts: number
  totalPosts: number
}

export function buildPublishingSummary(posts: MarketingPost[]): PublishingSummary {
  let draft = 0
  let scheduled = 0
  let published = 0
  const scores: number[] = []

  for (const post of posts) {
    if (post.status === "draft") draft += 1
    if (post.status === "scheduled") scheduled += 1
    if (post.status === "published") published += 1

    const score = post.viral_score ?? post.optimized_score
    if (score != null) scores.push(score)
  }

  const averageViralScore =
    scores.length > 0
      ? Math.round(
          scores.reduce((sum, score) => sum + score, 0) / scores.length,
        )
      : null

  return {
    published,
    scheduled,
    draft,
    averageViralScore,
    scoredPosts: scores.length,
    totalPosts: posts.length,
  }
}

export function formatAverageViralScore(score: number | null): string {
  if (score == null) return "—"
  return String(score)
}
