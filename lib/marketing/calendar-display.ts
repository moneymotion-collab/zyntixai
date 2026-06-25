import {
  CALENDAR_POST_FORMATS,
  type CalendarPost,
  type CalendarPostFormat,
  type CalendarPostStatus,
  type CalendarSummary,
} from "@/lib/marketing/calendar-types"
import { isApprovedViralStatus } from "@/lib/marketing/post-pipeline"

export const CALENDAR_FORMAT_STYLES: Record<CalendarPostFormat, string> = {
  Reel: "border-violet-500 bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-sm shadow-violet-500/40",
  Carousel:
    "border-amber-500 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-500/40",
  Story:
    "border-fuchsia-500 bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-sm shadow-fuchsia-500/40",
  Testimonial:
    "border-sky-500 bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-sm shadow-sky-500/40",
  Transformation:
    "border-emerald-500 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-500/40",
  Educational:
    "border-indigo-500 bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/40",
  Nutrition:
    "border-lime-500 bg-gradient-to-r from-lime-600 to-green-600 text-white shadow-sm shadow-lime-500/40",
  Workout:
    "border-red-500 bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm shadow-red-500/40",
}

export const CALENDAR_STATUS_STYLES: Record<CalendarPostStatus, string> = {
  draft:
    "border-slate-500 bg-gradient-to-r from-slate-600 to-gray-700 text-white shadow-sm shadow-slate-500/30",
  approved:
    "border-blue-500 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/30",
  scheduled:
    "border-amber-500 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-500/30",
  published:
    "border-emerald-500 bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-sm shadow-emerald-500/30",
  failed:
    "border-red-500 bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm shadow-red-500/30",
}

export const CALENDAR_STATUS_BORDER: Record<CalendarPostStatus, string> = {
  draft: "border-l-slate-500",
  approved: "border-l-blue-500",
  scheduled: "border-l-amber-500",
  published: "border-l-emerald-500",
  failed: "border-l-red-500",
}

export const CALENDAR_STATUS_LABELS: Record<CalendarPostStatus, string> = {
  draft: "Draft",
  approved: "Approved",
  scheduled: "Scheduled",
  published: "Published",
  failed: "Failed",
}

function normalizeFormat(value: string): CalendarPostFormat {
  const match = value.trim().toLowerCase()

  if (match.includes("carousel")) return "Carousel"
  if (match.includes("testimonial") || match.includes("member story")) {
    return "Testimonial"
  }
  if (match.includes("transformation")) return "Transformation"
  if (match.includes("educational")) return "Educational"
  if (match.includes("nutrition")) return "Nutrition"
  if (match.includes("workout")) return "Workout"
  if (match === "story" || match.includes("story")) return "Story"
  if (match === "reel" || match.includes("reel") || match === "video") {
    return "Reel"
  }

  const exact = CALENDAR_POST_FORMATS.find(
    (format) => format.toLowerCase() === match,
  )
  if (exact) return exact

  return "Reel"
}

export function getCalendarPostFormat(post: CalendarPost): CalendarPostFormat {
  return normalizeFormat(post.post_type || "Reel")
}

export function getCalendarPostStatus(post: CalendarPost): CalendarPostStatus {
  const status = post.status.trim().toLowerCase()
  if (status === "published" || status === "publish" || status === "live") {
    return "published"
  }
  if (status === "failed") return "failed"
  if (status === "scheduled") return "scheduled"
  if (isApprovedViralStatus(post.viral_status)) return "approved"
  if (status === "approved" || status === "approve") return "approved"
  return "draft"
}

function summaryBucket(format: CalendarPostFormat): "reels" | "carousels" | "stories" {
  if (format === "Carousel" || format === "Educational" || format === "Nutrition") {
    return "carousels"
  }
  if (format === "Story" || format === "Testimonial") return "stories"
  return "reels"
}

const ESTIMATED_REACH_BY_BUCKET = {
  reels: 3_200,
  carousels: 2_100,
  stories: 1_400,
} as const

export function estimateCalendarReach(
  reels: number,
  carousels: number,
  stories: number,
): number {
  return (
    reels * ESTIMATED_REACH_BY_BUCKET.reels +
    carousels * ESTIMATED_REACH_BY_BUCKET.carousels +
    stories * ESTIMATED_REACH_BY_BUCKET.stories
  )
}

export function formatEstimatedReach(reach: number): string {
  if (reach >= 1_000_000) {
    return `${(reach / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
  }
  if (reach >= 10_000) {
    return `${(reach / 1_000).toFixed(1).replace(/\.0$/, "")}K`
  }
  if (reach >= 1_000) {
    return `${Math.round(reach / 100) / 10}K`
  }
  return reach.toLocaleString()
}

export function buildCalendarSummary(posts: CalendarPost[]): CalendarSummary {
  let reels = 0
  let carousels = 0
  let stories = 0

  for (const post of posts) {
    const format = getCalendarPostFormat(post)
    const bucket = summaryBucket(format)
    if (bucket === "reels") reels += 1
    if (bucket === "carousels") carousels += 1
    if (bucket === "stories") stories += 1
  }

  return {
    totalPlannedPosts: posts.length,
    reels,
    carousels,
    stories,
    estimatedReach: estimateCalendarReach(reels, carousels, stories),
  }
}

export function getDemoCalendarSummary(): CalendarSummary {
  const reels = 12
  const carousels = 8
  const stories = 10

  return {
    totalPlannedPosts: 30,
    reels,
    carousels,
    stories,
    estimatedReach: estimateCalendarReach(reels, carousels, stories),
  }
}
