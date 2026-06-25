import type { ContentCategory } from "@/lib/marketing/content-categories"
import type { ContentIdeaItem } from "@/lib/marketing/content-idea-types"
import { MARKETING_SELECTABLE_PLATFORMS } from "@/lib/marketing/marketing-settings"

const DEFAULT_IDEA_PLATFORM = MARKETING_SELECTABLE_PLATFORMS[0] ?? "Instagram"

export type ContentIdeaCard = ContentIdeaItem & {
  id: string
  platform: string
  category: string
  content_type?: string | null
  suggested_cta?: string | null
  scheduledAt?: string | null
}

const DEFAULT_CATEGORY: ContentCategory = "Workout"

export function defaultScheduleTime(): string {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  date.setHours(18, 0, 0, 0)
  return date.toISOString()
}

export function buildContentIdeaCards(
  ideas: ContentIdeaItem[],
  posts: Array<{ id: string; title: string; scheduled_at?: string | null }>,
  categories: ContentCategory[] = [],
): ContentIdeaCard[] {
  const postByTitle = new Map(posts.map((post) => [post.title, post]))

  return ideas.map((idea, index) => {
    const post = postByTitle.get(idea.title)
    const category =
      categories[index % categories.length] ??
      categories[0] ??
      DEFAULT_CATEGORY

    return {
      ...idea,
      id: post?.id ?? `temp-${index}`,
      platform:
        MARKETING_SELECTABLE_PLATFORMS[
          index % MARKETING_SELECTABLE_PLATFORMS.length
        ] ?? DEFAULT_IDEA_PLATFORM,
      category,
      scheduledAt: post?.scheduled_at ?? null,
    }
  })
}

export function postsToContentIdeaCards(
  posts: Array<{
    id: string
    title: string
    caption: string
    hashtags: string
    platform?: string | null
    category?: string | null
    content_type?: string | null
    scheduled_at?: string | null
    viral_score?: number | null
    viral_reason?: string | null
  }>,
): ContentIdeaCard[] {
  return posts.map((post) => ({
    id: post.id,
    title: post.title,
    caption: post.caption,
    hashtags: post.hashtags,
    viral_score: post.viral_score ?? null,
    viral_reason: post.viral_reason?.trim() ?? "",
    platform: post.platform?.trim() || DEFAULT_IDEA_PLATFORM,
    category: post.category?.trim() || DEFAULT_CATEGORY,
    content_type: post.content_type?.trim() || null,
    scheduledAt: post.scheduled_at ?? null,
  }))
}
