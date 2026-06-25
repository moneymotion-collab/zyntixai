import type { ContentCategory } from "@/lib/marketing/content-categories"
import type { AnalyticsWithRate } from "@/lib/marketing/aggregate-content-performance"
import type { AnalyticsRowWithPost } from "@/lib/marketing/fetch-analytics-rows"

export const HIGH_ENGAGEMENT_THRESHOLD = 10

export type CategoryEngagement = {
  category: ContentCategory
  engagementRate: number
  postCount: number
}

export type MarketingAnalytics = {
  totalViews: number
  totalLikes: number
  totalComments: number
  totalShares: number
  totalSaves: number
  engagementRate: number
  avgEngagement: number
  bestPlatform: string | null
  highestReachPlatform: string | null
  bestPost: AnalyticsWithRate | null
  worstPost: AnalyticsWithRate | null
  categoryEngagement: CategoryEngagement[]
}

/** Realistic fitness marketing analytics for personal trainers and gym owners. */
export const mockAnalyticsRows: AnalyticsRowWithPost[] = [
  {
    id: "demo-1",
    brand_id: "demo-brand",
    post_id: "demo-post-1",
    platform: "TikTok",
    views: 12400,
    likes: 1180,
    comments: 142,
    shares: 410,
    saves: 286,
    created_at: "2026-05-05T18:00:00.000Z",
    content_posts: {
      title: "3 gym mistakes killing your members' progress",
      category: "Workout",
      content_type: "Reel",
      platform: "TikTok",
      viral_score: 92,
    },
  },
  {
    id: "demo-2",
    brand_id: "demo-brand",
    post_id: "demo-post-2",
    platform: "Instagram",
    views: 9800,
    likes: 920,
    comments: 88,
    shares: 210,
    saves: 165,
    created_at: "2026-05-12T12:00:00.000Z",
    content_posts: {
      title: "Your squat form is wrong (fix this first)",
      category: "Educational",
      content_type: "Reel",
      platform: "Instagram",
      viral_score: 88,
    },
  },
  {
    id: "demo-3",
    brand_id: "demo-brand",
    post_id: "demo-post-3",
    platform: "Instagram",
    views: 7600,
    likes: 640,
    comments: 72,
    shares: 180,
    saves: 132,
    created_at: "2026-05-19T19:00:00.000Z",
    content_posts: {
      title: "Member transformation: 18 lbs in 12 weeks",
      category: "Transformation",
      content_type: "Carousel",
      platform: "Instagram",
      viral_score: 84,
    },
  },
  {
    id: "demo-4",
    brand_id: "demo-brand",
    post_id: "demo-post-4",
    platform: "TikTok",
    views: 6900,
    likes: 610,
    comments: 64,
    shares: 195,
    saves: 118,
    created_at: "2026-05-26T10:00:00.000Z",
    content_posts: {
      title: "What I tell every new gym member about protein",
      category: "Nutrition",
      content_type: "Reel",
      platform: "TikTok",
      viral_score: 81,
    },
  },
  {
    id: "demo-5",
    brand_id: "demo-brand",
    post_id: "demo-post-5",
    platform: "Instagram",
    views: 5400,
    likes: 410,
    comments: 58,
    shares: 102,
    saves: 186,
    created_at: "2026-06-02T15:00:00.000Z",
    content_posts: {
      title: "Meal prep basics for busy gym members (save this)",
      category: "Nutrition",
      content_type: "Carousel",
      platform: "Instagram",
      viral_score: 79,
    },
  },
  {
    id: "demo-6",
    brand_id: "demo-brand",
    post_id: "demo-post-6",
    platform: "Instagram",
    views: 4100,
    likes: 290,
    comments: 38,
    shares: 62,
    saves: 41,
    created_at: "2026-06-09T11:00:00.000Z",
    content_posts: {
      title: "Cardio before weights? Gym myth busted",
      category: "Educational",
      content_type: "Story",
      platform: "Instagram",
      viral_score: 69,
    },
  },
  {
    id: "demo-7",
    brand_id: "demo-brand",
    post_id: "demo-post-7",
    platform: "TikTok",
    views: 3600,
    likes: 340,
    comments: 41,
    shares: 88,
    saves: 72,
    created_at: "2026-06-12T20:00:00.000Z",
    content_posts: {
      title: "Beginner deadlift checklist for gym newbies",
      category: "Workout",
      content_type: "Reel",
      platform: "TikTok",
      viral_score: 72,
    },
  },
  {
    id: "demo-8",
    brand_id: "demo-brand",
    post_id: "demo-post-8",
    platform: "Instagram",
    views: 2800,
    likes: 210,
    comments: 26,
    shares: 34,
    saves: 22,
    created_at: "2026-06-15T09:00:00.000Z",
    content_posts: {
      title: "Why I joined this gym — member testimonial",
      category: "Member Story",
      content_type: "Reel",
      platform: "Instagram",
      viral_score: 65,
    },
  },
  {
    id: "demo-9",
    brand_id: "demo-brand",
    post_id: "demo-post-9",
    platform: "Facebook",
    views: 3200,
    likes: 240,
    comments: 31,
    shares: 48,
    saves: 19,
    created_at: "2026-06-18T14:00:00.000Z",
    content_posts: {
      title: "21-day kickstart — limited spots for new members",
      category: "Promotion",
      content_type: "Post",
      platform: "Facebook",
      viral_score: 74,
    },
  },
]

/** @deprecated Use mockAnalyticsRows */
export const mockContentPerformanceRows = mockAnalyticsRows
