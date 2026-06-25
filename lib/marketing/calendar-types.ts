export const CALENDAR_POST_FORMATS = [
  "Reel",
  "Carousel",
  "Story",
  "Testimonial",
  "Transformation",
  "Educational",
  "Nutrition",
  "Workout",
] as const

export type CalendarPostFormat = (typeof CALENDAR_POST_FORMATS)[number]

export const CALENDAR_POST_STATUSES = [
  "draft",
  "approved",
  "scheduled",
  "published",
  "failed",
] as const

export type CalendarPostStatus = (typeof CALENDAR_POST_STATUSES)[number]

export type CalendarPost = {
  id: string
  platform: string
  hook: string
  content: string
  status: string
  post_type: string
  scheduled_date?: string | null
  viral_status?: string | null
}

export type CalendarSummary = {
  totalPlannedPosts: number
  reels: number
  carousels: number
  stories: number
  estimatedReach: number
}
