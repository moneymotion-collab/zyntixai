"use client"

import { useState } from "react"
import {
  Apple,
  BarChart3,
  CalendarClock,
  Dumbbell,
  Loader2,
  Megaphone,
  RotateCcw,
  Users,
  Video,
  X,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import AnimatedModal, { useMountAnimatedModal } from "@/components/ui/animated-modal"
import {
  DEMO_RESET_SCOPE,
  type DemoResetScopeItem,
} from "@/lib/demo/reset-demo-workspace"

const SCOPE_ICONS: Record<DemoResetScopeItem, LucideIcon> = {
  Members: Users,
  Workouts: Dumbbell,
  Nutrition: Apple,
  Progress: BarChart3,
  Sessions: CalendarClock,
  Marketing: Megaphone,
  "Video Projects": Video,
}

type ResetDemoWorkspaceModalProps = {
  open: boolean
  onClose: () => void
  onResetComplete?: () => void
}

function ResetDemoWorkspaceModalBody({
  onClose,
  onResetComplete,
}: Omit<ResetDemoWorkspaceModalProps, "open">) {
  const { open, requestClose, onExitComplete } = useMountAnimatedModal(onClose)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleConfirm() {
    setLoading(true)
    setErrorMessage(null)

    try {
      const res = await fetch("/api/demo/reset", {
        method: "POST",
        credentials: "include",
      })

      const data = (await res.json()) as { error?: string }

      if (!res.ok) {
        setErrorMessage(data.error ?? "Could not reset demo workspace.")
        setLoading(false)
        return
      }

      onResetComplete?.()
      requestClose()
      window.location.reload()
    } catch {
      setErrorMessage("Could not reset demo workspace.")
      setLoading(false)
    }
  }

  return (
    <AnimatedModal
      open={open}
      onClose={requestClose}
      onExitComplete={onExitComplete}
      ariaLabelledBy="reset-demo-workspace-title"
      className="flex items-end justify-center p-4 sm:items-center"
      panelClassName="max-w-lg rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-[#0b1224] via-[#0a101c] to-[#111827] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
      backdropClassName="bg-black/75 backdrop-blur-sm"
    >
      <div className="w-full">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300/90">
              Reset demo workspace
            </p>
            <h2
              id="reset-demo-workspace-title"
              className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl"
            >
              Restore full demo environment?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              This clears your current demo data and loads a fresh ZyntixAI
              Performance Coaching showcase.
            </p>
          </div>
          <button
            type="button"
            onClick={requestClose}
            disabled={loading}
            className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Will be restored
          </p>
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {DEMO_RESET_SCOPE.map((item) => {
              const Icon = SCOPE_ICONS[item]
              return (
                <li
                  key={item}
                  className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-sm text-slate-200"
                >
                  <Icon className="h-4 w-4 shrink-0 text-cyan-300/90" aria-hidden />
                  {item}
                </li>
              )
            })}
          </ul>
        </div>

        {errorMessage ? (
          <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={requestClose}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/[0.06] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => void handleConfirm()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(6,182,212,0.25)] transition hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Restoring…
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4" aria-hidden />
                Reset demo workspace
              </>
            )}
          </button>
        </div>
      </div>
    </AnimatedModal>
  )
}

export default function ResetDemoWorkspaceModal({
  open,
  onClose,
  onResetComplete,
}: ResetDemoWorkspaceModalProps) {
  if (!open) return null

  return (
    <ResetDemoWorkspaceModalBody
      onClose={onClose}
      onResetComplete={onResetComplete}
    />
  )
}
