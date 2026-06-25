import type { Database } from "@/lib/database.types"
import type { ContentIdeaItem } from "@/lib/marketing/content-idea-types"
import { aggregateContentPerformance } from "@/lib/marketing/aggregate-content-performance"
import { mockAnalyticsRows } from "@/lib/marketing/mock-analytics"
import type { MarketingAnalytics } from "@/lib/marketing/mock-analytics"
import type { ContentIdeaCard } from "@/lib/marketing/content-idea-cards"
import { mockIdeas } from "@/lib/marketing/mock-ideas"
import {
  mockScheduledPosts,
  type MockScheduledPost,
} from "@/lib/marketing/mock-scheduled-posts"

export type MarketingPost = Database["public"]["Tables"]["content_posts"]["Row"]

export type MockMarketingData = {
  ideas: ContentIdeaCard[]
  analytics: MarketingAnalytics
  scheduledPosts: MockScheduledPost[]
}

export function getMockMarketingData(): MockMarketingData {
  return {
    ideas: mockIdeas,
    analytics: aggregateContentPerformance(mockAnalyticsRows),
    scheduledPosts: mockScheduledPosts,
  }
}

export function mockIdeasToContentItems(
  ideas: ContentIdeaCard[],
): ContentIdeaItem[] {
  return ideas.map(({ title, caption, hashtags, viral_score, viral_reason }) => ({
    title,
    caption,
    hashtags,
    viral_score,
    viral_reason,
  }))
}

export function mockIdeasToMarketingPosts(
  ideas: ContentIdeaCard[],
): MarketingPost[] {
  const now = new Date().toISOString()

  return ideas.map((idea) => ({
    id: idea.id,
    title: idea.title,
    caption: idea.caption,
    hashtags: idea.hashtags,
    image_url: null,
    viral_score: idea.viral_score,
    viral_reason: idea.viral_reason,
    viral_feedback: "[]",
    viral_status: "",
    optimized_title: null,
    optimized_content: null,
    optimized_caption: null,
    optimized_hashtags: null,
    optimized_score: null,
    original_score: null,
    optimization_reason: null,
    optimization_status: null,
    status: idea.scheduledAt ? "scheduled" : "draft",
    scheduled_at: idea.scheduledAt ?? null,
    published_at: null,
    created_at: now,
    updated_at: now,
    created_by: "demo",
    user_id: "demo",
    platform: idea.platform,
    category: idea.category,
    goal: "",
    brand_id: null,
    content_plan_id: null,
    content_type: "",
    plan_day: null,
    plan_id: null,
    topic: "",
    retry_count: 0,
    external_post_id: null,
    publish_error: null,
    marketing_video_id: null,
    video_project_id: null,
    video_url: null,
  }))
}
