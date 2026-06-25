"use client"

import { useState } from "react"
import { RotateCcw, Sparkles } from "lucide-react"
import ResetDemoWorkspaceModal from "@/components/workspace/ResetDemoWorkspaceModal"
import { DEMO_WORKSPACE_BANNER_TEXT } from "@/lib/demo/demo-copy"

type DemoModeIndicatorProps = {
  onResetComplete?: () => void
}

export default function DemoModeIndicator({
  onResetComplete,
}: DemoModeIndicatorProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [status, setStatus] = useState<"idle" | "success">("idle")

  return (
    <>
      <div
        className="sticky top-0 z-30 relative -mx-5 mb-5 overflow-hidden border-b border-cyan-400/20 bg-gradient-to-r from-cyan-500/[0.1] via-indigo-500/[0.07] to-violet-500/[0.1] px-5 py-3.5 shadow-[0_8px_32px_rgba(6,182,212,0.08)] backdrop-blur-xl md:-mx-8 md:px-8 lg:-mx-10 lg:px-10"
        role="status"
        aria-live="polite"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 left-1/4 h-24 w-24 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3 sm:items-center">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/25 to-indigo-500/20 text-cyan-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
              <Sparkles className="h-4 w-4" aria-hidden />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-medium leading-relaxed text-cyan-100/95 sm:text-[0.9375rem]">
                {DEMO_WORKSPACE_BANNER_TEXT}
              </p>
              {status === "success" ? (
                <p className="mt-1.5 text-xs font-medium text-emerald-300">
                  Demo workspace restored with fresh showcase data.
                </p>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:border-cyan-400/35 hover:bg-white/[0.1] sm:min-w-[10.5rem] sm:self-center"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Reset Demo Data
          </button>
        </div>
      </div>

      <ResetDemoWorkspaceModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onResetComplete={() => {
          setStatus("success")
          onResetComplete?.()
        }}
      />
    </>
  )
}
