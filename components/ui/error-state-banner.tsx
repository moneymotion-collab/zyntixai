"use client"

import { AlertCircle, RefreshCw } from "lucide-react"

type ErrorStateBannerProps = {
  title?: string
  message: string
  onRetry?: () => void
  retrying?: boolean
  retryLabel?: string
  variant?: "dark" | "light"
  embedded?: boolean
  className?: string
}

export default function ErrorStateBanner({
  title = "Something went wrong",
  message,
  onRetry,
  retrying = false,
  retryLabel = "Try again",
  variant = "dark",
  embedded = false,
  className = "",
}: ErrorStateBannerProps) {
  const isLight = variant === "light"

  const containerClass = isLight
    ? "border-red-200 bg-red-50 text-red-800"
    : "border-red-500/30 bg-red-500/10 text-red-200"

  const titleClass = isLight ? "text-red-900" : "text-white"
  const messageClass = isLight ? "text-red-700" : "opacity-90"
  const buttonClass = isLight
    ? "fitcore-btn-secondary saas-focus-ring min-h-11 disabled:cursor-not-allowed disabled:opacity-50"
    : "btn-ghost saas-focus-ring min-h-11 px-4 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"

  return (
    <div
      role="alert"
      className={`rounded-2xl border px-4 py-4 sm:px-5 ${embedded ? "" : "mb-6"} ${containerClass} ${className}`.trim()}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 opacity-80" aria-hidden />
          <div>
            <p className={`font-medium ${titleClass}`}>{title}</p>
            <p className={`mt-1 text-sm ${messageClass}`}>{message}</p>
          </div>
        </div>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            disabled={retrying}
            className={buttonClass}
          >
            <RefreshCw className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`} aria-hidden />
            {retryLabel}
          </button>
        ) : null}
      </div>
    </div>
  )
}
