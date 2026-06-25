import { Loader2, RotateCcw } from "lucide-react"
import type { PublishDisplayStatus } from "@/lib/marketing/publish-display-status"

export type PostAction =
  | "generate"
  | "optimize"
  | "score"
  | "approve"
  | "publish"
  | "schedule"
  | "publish_instagram"
  | "sync_analytics"

type PostActionsProps = {
  publishStatus: PublishDisplayStatus
  busy?: PostAction | null
  disabled?: boolean
  video?: boolean
  onGenerateSimilar: () => void
  onOptimize?: () => void
  onScore: () => void
  onApprove?: () => void
  showApprove?: boolean
  onPublish: () => void
  showPublish?: boolean
  showSchedule?: boolean
  onSchedule?: () => void
  showPublishInstagram?: boolean
  onPublishInstagram?: () => void
  showRetryInstagram?: boolean
  onRetryInstagram?: () => void
  showSyncAnalytics?: boolean
  onSyncAnalytics?: () => void
}

const secondaryButtonClass =
  "inline-flex min-w-[11rem] items-center justify-center gap-2.5 rounded-2xl border border-gray-200 bg-white px-5 py-3.5 text-base font-semibold text-gray-900 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[12rem] sm:px-6 sm:py-4 sm:text-lg"

const primaryButtonClass =
  "inline-flex min-w-[11rem] items-center justify-center gap-2.5 rounded-2xl border border-gray-900 bg-gray-900 px-5 py-3.5 text-base font-bold text-white shadow-sm transition hover:border-gray-800 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[12rem] sm:px-6 sm:py-4 sm:text-lg"

const compactSecondaryButtonClass =
  "inline-flex min-w-[9.5rem] items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"

const compactPrimaryButtonClass =
  "inline-flex min-w-[9.5rem] items-center justify-center gap-2 rounded-xl border border-gray-900 bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:border-gray-800 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"

export default function PostActions({
  publishStatus,
  busy = null,
  disabled = false,
  video = false,
  onGenerateSimilar,
  onOptimize,
  onScore,
  onApprove,
  showApprove = false,
  onPublish,
  showPublish = true,
  showSchedule = false,
  onSchedule,
  showPublishInstagram = false,
  onPublishInstagram,
  showRetryInstagram = false,
  onRetryInstagram,
  showSyncAnalytics = false,
  onSyncAnalytics,
}: PostActionsProps) {
  const isBusy = disabled || busy !== null
  const isProcessing = publishStatus === "processing" || busy === "publish_instagram"
  const canPublish =
    publishStatus !== "published" && publishStatus !== "processing"
  const hasWorkflowActions =
    showApprove ||
    showSchedule ||
    showPublish ||
    showPublishInstagram ||
    showRetryInstagram ||
    showSyncAnalytics
  const secondary = video ? secondaryButtonClass : compactSecondaryButtonClass
  const primary = video ? primaryButtonClass : compactPrimaryButtonClass
  const groupLabel = video
    ? "text-sm font-bold uppercase tracking-[0.12em] text-gray-500"
    : "text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400"
  const iconSize = video ? "h-5 w-5" : "h-4 w-4"

  return (
    <div className={`flex flex-col ${video ? "gap-8" : "gap-5"}`}>
      <div>
        <p className={`mb-3 ${groupLabel}`}>AI tools</p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={isBusy}
            onClick={onGenerateSimilar}
            className={secondary}
          >
            {busy === "generate" ? (
              <Loader2 className={`${iconSize} animate-spin`} />
            ) : null}
            Generate Similar
          </button>

          {onOptimize ? (
            <button
              type="button"
              disabled={isBusy}
              onClick={onOptimize}
              className={secondary}
            >
              {busy === "optimize" ? (
                <Loader2 className={`${iconSize} animate-spin`} />
              ) : null}
              Optimize Post
            </button>
          ) : null}

          <button
            type="button"
            disabled={isBusy}
            onClick={onScore}
            className={secondary}
          >
            {busy === "score" ? (
              <Loader2 className={`${iconSize} animate-spin`} />
            ) : null}
            Score
          </button>
        </div>
      </div>

      {hasWorkflowActions ? (
        <div>
          <p className={`mb-3 ${groupLabel}`}>Workflow</p>
          <div className="flex flex-wrap gap-3">
            {showApprove && onApprove ? (
              <button
                type="button"
                disabled={isBusy}
                onClick={onApprove}
                className={`${secondary} border-blue-200 bg-blue-50 text-blue-900 hover:border-blue-300 hover:bg-blue-100`}
              >
                {busy === "approve" ? (
                  <Loader2 className={`${iconSize} animate-spin`} />
                ) : null}
                Approve
              </button>
            ) : null}

            {showSchedule && onSchedule ? (
              <button
                type="button"
                disabled={isBusy}
                onClick={onSchedule}
                className={`${secondary} border-amber-200 bg-amber-50 text-amber-900 hover:border-amber-300 hover:bg-amber-100`}
              >
                {busy === "schedule" ? (
                  <Loader2 className={`${iconSize} animate-spin`} />
                ) : null}
                Add to Schedule
              </button>
            ) : null}

            {showPublish ? (
              <button
                type="button"
                disabled={isBusy || !canPublish || isProcessing}
                onClick={onPublish}
                className={primary}
              >
                {busy === "publish" ? (
                  <Loader2 className={`${iconSize} animate-spin`} />
                ) : null}
                Publish
              </button>
            ) : null}

            {showPublishInstagram ? (
              <button
                type="button"
                disabled={isBusy || isProcessing || publishStatus === "published"}
                onClick={onPublishInstagram}
                className={`${primary} border-fuchsia-600 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:border-fuchsia-700 hover:from-fuchsia-700 hover:to-pink-700`}
              >
                {busy === "publish_instagram" ? (
                  <Loader2 className={`${iconSize} animate-spin`} />
                ) : isProcessing ? (
                  <Loader2 className={`${iconSize} animate-spin`} />
                ) : null}
                {isProcessing ? "Publishing…" : "Publish to Instagram"}
              </button>
            ) : null}

            {showRetryInstagram && onRetryInstagram ? (
              <button
                type="button"
                disabled={isBusy || isProcessing}
                onClick={onRetryInstagram}
                className={`${primary} border-red-300 bg-red-600 hover:border-red-400 hover:bg-red-700`}
              >
                {busy === "publish_instagram" ? (
                  <Loader2 className={`${iconSize} animate-spin`} />
                ) : (
                  <RotateCcw className={iconSize} />
                )}
                Retry publish
              </button>
            ) : null}

            {showSyncAnalytics ? (
              <button
                type="button"
                disabled={isBusy}
                onClick={onSyncAnalytics}
                className={secondary}
              >
                {busy === "sync_analytics" ? (
                  <Loader2 className={`${iconSize} animate-spin`} />
                ) : null}
                Sync analytics
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
