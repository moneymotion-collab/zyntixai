"use client"

import { useState } from "react"
import { CheckCircle2, Loader2, Sparkles } from "lucide-react"
import GlassCard from "@/components/ui/glass-card"
import {
  DEMO_WORKSPACE_LOAD_ACTION,
  DEMO_WORKSPACE_LOADING_LABEL,
  DEMO_WORKSPACE_LOAD_SUCCESS,
  demoMemberCountPhrase,
} from "@/lib/demo/demo-copy"

type ActionStatus = "idle" | "loading" | "success" | "error"

type LoadDemoBusinessCardProps = {
  onSuccess?: () => void
  className?: string
}

export default function LoadDemoBusinessCard({
  onSuccess,
  className = "",
}: LoadDemoBusinessCardProps) {
  const [status, setStatus] = useState<ActionStatus>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleLoadDemo() {
    setStatus("loading")
    setErrorMessage(null)

    try {
      const res = await fetch("/api/demo/load", {
        method: "POST",
        credentials: "include",
      })

      let data: { success?: boolean; error?: string } = {}

      try {
        data = (await res.json()) as typeof data
      } catch {
        setStatus("error")
        setErrorMessage(
          res.ok
            ? "Demo workspace load returned an invalid response."
            : `Could not load demo workspace (${res.status}). Check server logs.`,
        )
        return
      }

      if (!res.ok) {
        setStatus("error")
        setErrorMessage(data.error ?? `Could not load demo workspace (${res.status}).`)
        return
      }

      setStatus("success")
      onSuccess?.()
    } catch {
      setStatus("error")
      setErrorMessage("Could not load demo workspace.")
    }
  }

  const isLoading = status === "loading"
  const isSuccess = status === "success"
  const isError = status === "error"

  return (
    <GlassCard
      className={`flex h-full flex-col justify-between border-white/[0.08] bg-white/[0.02] p-4 sm:p-5 ${className}`.trim()}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-slate-500" aria-hidden />
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Demo workspace
          </p>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Load {demoMemberCountPhrase()}, workouts, sessions, and progress data
          into this demo workspace.
        </p>
      </div>

      <div className="mt-4 space-y-3">
        <button
          type="button"
          onClick={() => void handleLoadDemo()}
          disabled={isLoading}
          className="btn-ghost w-full border-white/10 text-slate-200 hover:border-white/20 hover:bg-white/[0.05] sm:w-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {DEMO_WORKSPACE_LOADING_LABEL}
            </>
          ) : (
            DEMO_WORKSPACE_LOAD_ACTION
          )}
        </button>

        {isSuccess ? (
          <div
            className="flex items-start gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] px-3 py-2.5 text-sm text-emerald-200/90"
            role="status"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{DEMO_WORKSPACE_LOAD_SUCCESS}</span>
          </div>
        ) : null}

        {isError && errorMessage ? (
          <p
            className="rounded-xl border border-red-500/25 bg-red-500/[0.06] px-3 py-2.5 text-sm text-red-200/90"
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}
      </div>
    </GlassCard>
  )
}
