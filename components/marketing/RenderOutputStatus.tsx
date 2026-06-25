"use client"

import { AlertCircle, CheckCircle2, Film, Loader2 } from "lucide-react"
import {
  isRenderCompleted,
  isRenderFailed,
  isRenderProcessing,
  isValidVideoUrl,
} from "@/lib/video/render-pipeline"

type RenderOutputStatusProps = {
  title: string
  status: string | null | undefined
  videoUrl: string | null | undefined
  renderError?: string | null
  renderStartedAt?: string | null
  renderFinishedAt?: string | null
  processingLabel?: string
}

export default function RenderOutputStatus({
  title,
  status,
  videoUrl,
  renderError,
  renderStartedAt,
  renderFinishedAt,
  processingLabel = "Rendering video…",
}: RenderOutputStatusProps) {
  const processing = isRenderProcessing(status)
  const failed = isRenderFailed(status)
  const completed = isRenderCompleted(status, videoUrl)
  const safeVideoUrl =
    videoUrl && isValidVideoUrl(videoUrl) ? videoUrl.trim() : null

  if (!processing && !failed && !completed) {
    return null
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-white">
          <Film className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>

      {processing ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
          <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin" />
          <div>
            <p className="text-sm font-semibold">{processingLabel}</p>
            <p className="mt-1 text-xs text-amber-800/90">
              This can take a few minutes. Do not close this page.
            </p>
            {renderStartedAt ? (
              <p className="mt-2 text-[11px] text-amber-700">
                Started {new Date(renderStartedAt).toLocaleString()}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {failed ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-900">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Render failed</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-red-800">
              {renderError?.trim() || "An unknown error occurred during rendering."}
            </p>
            {renderFinishedAt ? (
              <p className="mt-2 text-[11px] text-red-700">
                Failed at {new Date(renderFinishedAt).toLocaleString()}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {completed && safeVideoUrl ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Render completed
          </div>
          <video
            src={safeVideoUrl}
            controls
            className="w-full rounded-xl border border-slate-200"
          />
          {renderFinishedAt ? (
            <p className="text-[11px] text-slate-500">
              Finished {new Date(renderFinishedAt).toLocaleString()}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
