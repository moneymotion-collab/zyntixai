import type { ContentPostStatus } from "@/lib/marketing/content-post-status"
import {
  CONTENT_POST_STATUS_LABELS,
  CONTENT_POST_STATUS_STYLES,
} from "@/lib/marketing/content-post-status"

export default function PostStatusBadge({
  status,
  large = false,
}: {
  status: ContentPostStatus
  large?: boolean
}) {
  return (
    <span
      className={`inline-flex rounded-full border font-semibold capitalize ${CONTENT_POST_STATUS_STYLES[status]} ${
        large
          ? "px-4 py-2 text-sm sm:text-base"
          : "px-3.5 py-1.5 text-xs"
      }`}
    >
      {CONTENT_POST_STATUS_LABELS[status]}
    </span>
  )
}
