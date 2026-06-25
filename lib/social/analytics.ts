type AnalyticsInput = {
  platform: string
  externalPostId: string
  accessToken: string
}

type PostAnalyticsMetrics = {
  views: number
  reach: number
  likes: number
  comments: number
  shares: number
  saves: number
}

export async function getPostAnalytics(
  input: AnalyticsInput,
): Promise<PostAnalyticsMetrics> {
  if (input.platform === "instagram") {
    return getInstagramAnalytics(input)
  }

  if (input.platform === "facebook") {
    return getFacebookAnalytics(input)
  }

  throw new Error(`Unsupported platform: ${input.platform}`)
}

async function getInstagramAnalytics(
  input: AnalyticsInput,
): Promise<PostAnalyticsMetrics> {
  const params = new URLSearchParams({
    fields: "like_count,comments_count",
    access_token: input.accessToken,
  })

  const url = `https://graph.facebook.com/v20.0/${encodeURIComponent(
    input.externalPostId,
  )}?${params.toString()}`

  const res = await fetch(url)
  const data = (await res.json()) as any

  if (!res.ok) {
    throw new Error(data?.error?.message || "Failed to fetch Instagram analytics")
  }

  return {
    views: 0,
    reach: 0,
    likes: data?.like_count || 0,
    comments: data?.comments_count || 0,
    shares: 0,
    saves: 0,
  }
}

async function getFacebookAnalytics(
  input: AnalyticsInput,
): Promise<PostAnalyticsMetrics> {
  const params = new URLSearchParams({
    fields: "likes.summary(true),comments.summary(true),shares",
    access_token: input.accessToken,
  })

  const url = `https://graph.facebook.com/v20.0/${encodeURIComponent(
    input.externalPostId,
  )}?${params.toString()}`

  const res = await fetch(url)
  const data = (await res.json()) as any

  if (!res.ok) {
    throw new Error(data?.error?.message || "Failed to fetch Facebook analytics")
  }

  return {
    views: 0,
    reach: 0,
    likes: data?.likes?.summary?.total_count || 0,
    comments: data?.comments?.summary?.total_count || 0,
    shares: data?.shares?.count || 0,
    saves: 0,
  }
}

export function calculateEngagementRate(metrics: {
  reach: number
  likes: number
  comments: number
  shares: number
  saves: number
}) {
  if (!metrics.reach || metrics.reach <= 0) return 0

  const engagement =
    metrics.likes + metrics.comments + metrics.shares + metrics.saves

  return Number(((engagement / metrics.reach) * 100).toFixed(2))
}
