"use client"

import { AlertCircle, CheckCircle2, Loader2, Sparkles } from "lucide-react"
import type { GeneratedVideoFlowState } from "@/lib/marketing/generated-video-record"

const FLOW_LABELS: Record<GeneratedVideoFlowState, string> = {
  idle: "Ready",
  creating: "Creating video record…",
  created: "Video record created",
  rendering: "Rendering video…",
  failed: "Failed",
  completed: "Completed",
}

type GeneratedVideoFlowBannerProps = {
  flowState: GeneratedVideoFlowState
  generatedVideoId?: string | null
  error?: string | null
}

export default function GeneratedVideoFlowBanner({
  flowState,
  generatedVideoId,
  error,
}: GeneratedVideoFlowBannerProps) {
  if (flowState === "idle") return null

  const isProcessing = flowState === "creating" || flowState === "rendering"
  const isFailed = flowState === "failed"
  const isSuccess = flowState === "created" || flowState === "completed"

  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        isFailed
          ? "border-red-200 bg-red-50 text-red-900"
          : isSuccess
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : "border-amber-200 bg-amber-50 text-amber-950"
      }`}
    >
      <div className="flex items-start gap-3">
        {isProcessing ? (
          <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin" />
        ) : isFailed ? (
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        ) : (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm font-semibold">
            {!isFailed && !isProcessing ? (
              <Sparkles className="h-4 w-4" />
            ) : null}
            {FLOW_LABELS[flowState]}
          </p>
          {generatedVideoId ? (
            <p className="mt-1 truncate font-mono text-xs opacity-80">
              generated_videos.id: {generatedVideoId}
            </p>
          ) : null}
          {isFailed && error ? (
            <p className="mt-2 whitespace-pre-wrap text-sm">{error}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
