import {
  SUBSCRIPTION_STATUS_LABELS,
  SUBSCRIPTION_STATUS_STYLES,
  type SubscriptionStatus,
} from "@/lib/subscription-status"

export default function SubscriptionStatusBadge({
  status,
}: {
  status: SubscriptionStatus
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${SUBSCRIPTION_STATUS_STYLES[status]}`}
    >
      {SUBSCRIPTION_STATUS_LABELS[status]}
    </span>
  )
}
