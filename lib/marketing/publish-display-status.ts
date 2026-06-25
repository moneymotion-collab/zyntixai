import type { MarketingPost } from "@/lib/marketing/get-mock-marketing-data"
import { isApprovedViralStatus } from "@/lib/marketing/post-pipeline"

export const PUBLISH_DISPLAY_STATUSES = [
  "draft",
  "approved",
  "scheduled",
  "processing",
  "published",
  "failed",
] as const

export type PublishDisplayStatus = (typeof PUBLISH_DISPLAY_STATUSES)[number]

export const PUBLISH_DISPLAY_STATUS_LABELS: Record<PublishDisplayStatus, string> =
  {
    draft: "Draft",
    approved: "Approved",
    scheduled: "Scheduled",
    processing: "Processing",
    published: "Published",
    failed: "Failed",
  }

export const PUBLISH_DISPLAY_STATUS_STYLES: Record<PublishDisplayStatus, string> =
  {
    draft: "border-slate-200 bg-slate-100 text-slate-700",
    approved: "border-blue-200 bg-blue-50 text-blue-800",
    scheduled: "border-amber-200 bg-amber-100 text-amber-900",
    processing: "border-violet-200 bg-violet-100 text-violet-800",
    published: "border-emerald-200 bg-emerald-100 text-emerald-800",
    failed: "border-red-200 bg-red-100 text-red-800",
  }

export function resolvePublishDisplayStatus(
  post: MarketingPost,
  options?: { isProcessing?: boolean },
): PublishDisplayStatus {
  if (options?.isProcessing) {
    return "processing"
  }

  const status = (post.status ?? "").trim().toLowerCase()

  if (status === "failed") return "failed"
  if (status === "published") return "published"
  if (status === "scheduled") return "scheduled"
  if (isApprovedViralStatus(post.viral_status)) return "approved"

  return "draft"
}

export function isPublishProcessing(
  post: MarketingPost,
  busyAction: string | null | undefined,
): boolean {
  return busyAction === "publish_instagram" || busyAction === "publish"
}
