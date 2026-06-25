import { Loader2 } from "lucide-react"
import {
  PUBLISH_DISPLAY_STATUS_LABELS,
  PUBLISH_DISPLAY_STATUS_STYLES,
  type PublishDisplayStatus,
} from "@/lib/marketing/publish-display-status"

export default function PublishStatusBadge({
  status,
  large = false,
}: {
  status: PublishDisplayStatus
  large?: boolean
}) {
  const isProcessing = status === "processing"

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border font-semibold ${PUBLISH_DISPLAY_STATUS_STYLES[status]} ${
        large
          ? "px-4 py-2 text-sm sm:text-base"
          : "px-3.5 py-1.5 text-xs"
      }`}
    >
      {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {PUBLISH_DISPLAY_STATUS_LABELS[status]}
    </span>
  )
}
