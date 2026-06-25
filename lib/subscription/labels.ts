import type { SubscriptionStatus } from "@/lib/subscription/types"

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  trial: "Trial",
  active: "Active",
  past_due: "Past due",
  cancelled: "Cancelled",
  expired: "Expired",
}

export const SUBSCRIPTION_STATUS_STYLES: Record<SubscriptionStatus, string> = {
  trial: "bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-400/25",
  active: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/25",
  past_due: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/25",
  cancelled: "bg-slate-500/15 text-slate-300 ring-1 ring-slate-400/25",
  expired: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/25",
}
