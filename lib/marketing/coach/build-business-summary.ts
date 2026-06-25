import type { BrandProfile } from "@/lib/marketing/brand-profile"
import {
  buildContentPerformanceKpis,
  findBestPerformingPost,
  findWorstPerformingPost,
} from "@/lib/marketing/content-performance/analytics-engine"
import type { ContentPerformanceRow } from "@/lib/marketing/content-performance/types"
import type { MarketingSettings } from "@/lib/marketing/marketing-settings"
import type { Database } from "@/lib/database.types"

export type RecentContentPost = Pick<
  Database["public"]["Tables"]["content_posts"]["Row"],
  | "id"
  | "title"
  | "caption"
  | "platform"
  | "status"
  | "content_type"
  | "category"
  | "topic"
  | "scheduled_at"
  | "published_at"
  | "viral_score"
  | "created_at"
  | "updated_at"
>

export type BusinessSummaryInput = {
  brand: BrandProfile | null
  marketingSettings: MarketingSettings | null
  contentPerformance: ContentPerformanceRow[]
  recentPosts: RecentContentPost[]
}

function orNotSet(value: string | null | undefined): string {
  const trimmed = value?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : "Not set"
}

function truncate(text: string, max = 120): string {
  const trimmed = text.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1)}…`
}

function formatBrandSection(brand: BrandProfile | null): string {
  if (!brand) {
    return "BRAND PROFILE: Not configured — prompt user to complete brand setup at /dashboard/marketing/brand."
  }

  return [
    "BRAND PROFILE:",
    `- Name: ${orNotSet(brand.name)}`,
    `- Niche: ${orNotSet(brand.niche)}`,
    `- Description: ${orNotSet(brand.description)}`,
    `- Target audience: ${orNotSet(brand.target_audience)}`,
    `- Tone of voice: ${orNotSet(brand.tone_of_voice)}`,
    `- Goals: ${orNotSet(brand.goals)}`,
    `- Platform focus: ${orNotSet(brand.platform_focus)}`,
  ].join("\n")
}

function formatMarketingSettingsSection(
  settings: MarketingSettings | null,
): string {
  if (!settings) {
    return "MARKETING SETTINGS: Not configured — prompt user to complete settings at /marketing/settings."
  }

  const hasValues = [
    settings.gym_type,
    settings.target_audience,
    settings.business_goal,
    settings.posting_frequency,
    settings.content_tone,
    settings.preferred_platform,
  ].some((v) => v?.trim())

  if (!hasValues) {
    return "MARKETING SETTINGS: Empty — user has not filled in gym type, goals, or platform preferences yet."
  }

  return [
    "MARKETING SETTINGS:",
    `- Gym / business type: ${orNotSet(settings.gym_type)}`,
    `- Target audience: ${orNotSet(settings.target_audience)}`,
    `- Business goal: ${orNotSet(settings.business_goal)}`,
    `- Posting frequency: ${orNotSet(settings.posting_frequency)}`,
    `- Content tone: ${orNotSet(settings.content_tone)}`,
    `- Preferred platform: ${orNotSet(settings.preferred_platform)}`,
  ].join("\n")
}

function formatContentPerformanceSection(rows: ContentPerformanceRow[]): string {
  if (rows.length === 0) {
    return "CONTENT PERFORMANCE: No tracked posts yet — encourage logging views/engagement after publishing."
  }

  const kpis = buildContentPerformanceKpis(rows)
  const best = findBestPerformingPost(rows)
  const worst = findWorstPerformingPost(rows)

  const lines = [
    "CONTENT PERFORMANCE:",
    `- Posts tracked: ${kpis.totalPostsTracked}`,
    `- Total views: ${kpis.totalViews.toLocaleString()}`,
    `- Total engagement (likes + comments + shares + saves): ${(kpis.totalLikes + kpis.totalComments + kpis.totalShares + kpis.totalSaves).toLocaleString()}`,
    `- Followers gained: ${kpis.followersGained.toLocaleString()}`,
    `- Average engagement rate: ${kpis.averageEngagementRate}%`,
  ]

  if (best) {
    lines.push(
      `- Best post: "${orNotSet(best.title)}" — ${best.platform}, ${best.views.toLocaleString()} views, ${best.engagement_rate}% engagement, type: ${orNotSet(best.content_type)}`,
    )
  }

  if (worst && rows.length > 1) {
    lines.push(
      `- Weakest post: "${orNotSet(worst.title)}" — ${worst.platform}, ${worst.views.toLocaleString()} views, ${worst.engagement_rate}% engagement`,
    )
  }

  const platformBreakdown = aggregateByPlatform(rows)
  if (platformBreakdown.length > 0) {
    lines.push(
      "",
      "Performance by platform:",
      ...platformBreakdown.map(
        (p) =>
          `- ${p.platform}: ${p.count} posts, ${p.views.toLocaleString()} views, ${p.avgRate}% avg engagement`,
      ),
    )
  }

  const topPosts = [...rows]
    .sort((a, b) => b.views - a.views)
    .slice(0, 3)

  if (topPosts.length > 0) {
    lines.push(
      "",
      "Top posts by views:",
      ...topPosts.map(
        (post, i) =>
          `${i + 1}. "${orNotSet(post.title)}" — ${post.platform}, ${post.views.toLocaleString()} views, ${post.likes} likes`,
      ),
    )
  }

  return lines.join("\n")
}

function aggregateByPlatform(rows: ContentPerformanceRow[]) {
  const map = new Map<
    string,
    { count: number; views: number; engagement: number }
  >()

  for (const row of rows) {
    const platform = row.platform?.trim() || "Unknown"
    const current = map.get(platform) ?? { count: 0, views: 0, engagement: 0 }
    current.count += 1
    current.views += row.views
    current.engagement +=
      row.likes + row.comments + row.shares + (row.saves ?? 0)
    map.set(platform, current)
  }

  return [...map.entries()]
    .map(([platform, stats]) => ({
      platform,
      count: stats.count,
      views: stats.views,
      avgRate:
        stats.views > 0
          ? Math.round((stats.engagement / stats.views) * 1000) / 10
          : 0,
    }))
    .sort((a, b) => b.views - a.views)
}

function formatRecentPostsSection(posts: RecentContentPost[]): string {
  if (posts.length === 0) {
    return "RECENT CONTENT: No content posts yet — suggest creating ideas or scheduling first posts."
  }

  const statusCounts = posts.reduce<Record<string, number>>((acc, post) => {
    const status = post.status?.trim() || "unknown"
    acc[status] = (acc[status] ?? 0) + 1
    return acc
  }, {})

  const statusLine = Object.entries(statusCounts)
    .map(([status, count]) => `${status}: ${count}`)
    .join(", ")

  const lines = [
    "RECENT CONTENT (latest posts):",
    `- Pipeline snapshot: ${statusLine}`,
    "",
    ...posts.map((post, i) => {
      const hook = post.title?.trim() || post.topic?.trim() || "Untitled"
      const caption = post.caption?.trim()
        ? ` — "${truncate(post.caption, 80)}"`
        : ""
      const viral =
        post.viral_score != null ? `, viral score: ${post.viral_score}` : ""
      const schedule = post.scheduled_at
        ? `, scheduled: ${new Date(post.scheduled_at).toLocaleDateString()}`
        : post.published_at
          ? `, published: ${new Date(post.published_at).toLocaleDateString()}`
          : ""

      return `${i + 1}. [${post.status}] "${hook}" — ${post.platform || "no platform"}, type: ${orNotSet(post.content_type)}${viral}${schedule}${caption}`
    }),
  ]

  return lines.join("\n")
}

export function buildBusinessSummary(input: BusinessSummaryInput): string {
  return [
    "=== USER BUSINESS DATA (ground all advice in this) ===",
    "",
    formatBrandSection(input.brand),
    "",
    formatMarketingSettingsSection(input.marketingSettings),
    "",
    formatContentPerformanceSection(input.contentPerformance),
    "",
    formatRecentPostsSection(input.recentPosts),
    "",
    "=== END BUSINESS DATA ===",
  ].join("\n")
}
