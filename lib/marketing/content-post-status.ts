export const CONTENT_POST_STATUSES = [
  "draft",
  "scheduled",
  "published",
  "failed",
] as const

export type ContentPostStatus = (typeof CONTENT_POST_STATUSES)[number]

/** Alias used by schedule-post API */
export type PostStatus = ContentPostStatus

export const CONTENT_POST_STATUS_LABELS: Record<ContentPostStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
  failed: "Failed",
}

export const CONTENT_POST_STATUS_STYLES: Record<ContentPostStatus, string> = {
  draft: "border-gray-200 bg-gray-100 text-gray-700",
  scheduled: "border-amber-200 bg-amber-100 text-amber-900",
  published: "border-emerald-200 bg-emerald-100 text-emerald-800",
  failed: "border-red-200 bg-red-100 text-red-800",
}

export function isContentPostStatus(value: string): value is ContentPostStatus {
  return CONTENT_POST_STATUSES.includes(value as ContentPostStatus)
}

export function parseContentPostStatus(
  value: unknown,
): ContentPostStatus | null {
  return typeof value === "string" && isContentPostStatus(value) ? value : null
}
