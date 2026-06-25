"use client"

import { AlertCircle, RefreshCw } from "lucide-react"

type ProgressErrorBannerProps = {
  title?: string
  message: string
  onRetry?: () => void
  retrying?: boolean
  variant?: "error" | "warning"
  embedded?: boolean
}

export default function ProgressErrorBanner({
  title = "Something went wrong",
  message,
  onRetry,
  retrying = false,
  variant = "error",
  embedded = false,
}: ProgressErrorBannerProps) {
  const styles =
    variant === "error"
      ? "border-red-500/30 bg-red-500/10 text-red-200"
      : "border-amber-500/30 bg-amber-500/10 text-amber-200"

  return (
    <div
      className={`rounded-2xl border px-4 py-4 sm:px-5 ${embedded ? "" : "mb-6"} ${styles}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 opacity-80" />
          <div>
            <p className="font-medium text-white">{title}</p>
            <p className="mt-1 text-sm opacity-90">{message}</p>
          </div>
        </div>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            disabled={retrying}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`} />
            Try again
          </button>
        ) : null}
      </div>
    </div>
  )
}
