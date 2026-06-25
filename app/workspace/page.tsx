"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FitCoreLogoMark } from "@/components/brand/FitCoreLogo"
import { FITCORE_AI_BRAND_NAME } from "@/lib/brand/fitcore-ai"
import WorkspacePickerCards from "@/components/workspace/WorkspacePickerCards"
import { createClient } from "@/lib/supabase/client"
import {
  persistWorkspaceMode,
  type WorkspaceMode,
} from "@/lib/workspace/workspace-mode"

export default function WorkspacePage() {
  const router = useRouter()
  const supabase = createClient()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [selected, setSelected] = useState<WorkspaceMode>("live")
  const [loading, setLoading] = useState(false)
  const [loadingMode, setLoadingMode] = useState<WorkspaceMode | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.replace("/login")
        return
      }

      setCheckingAuth(false)
    })()
  }, [router, supabase])

  async function handleContinue(mode: WorkspaceMode) {
    setSelected(mode)
    setLoading(true)
    setLoadingMode(mode)
    setError(null)
    persistWorkspaceMode(mode)

    try {
      if (mode === "demo") {
        const res = await fetch("/api/workspace/enter-demo", {
          method: "POST",
          credentials: "include",
        })

        const data = (await res.json()) as { error?: string }

        if (!res.ok) {
          setError(data.error ?? "Could not open demo workspace.")
          setLoading(false)
          setLoadingMode(null)
          return
        }
      } else {
        await fetch("/api/workspace/enter-live", {
          method: "POST",
          credentials: "include",
        })
      }

      window.location.assign("/dashboard")
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
      setLoadingMode(null)
    }
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-gray-400">
        Loading…
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-10 text-white">
      <div className="absolute left-[-100px] top-[-100px] h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-[120px]" />
      <div className="absolute bottom-[-100px] right-[-100px] h-[400px] w-[400px] rounded-full bg-purple-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[100px]" />

      <div className="relative z-10 w-full max-w-3xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <FitCoreLogoMark size="hero" className="mb-6 shadow-lg shadow-cyan-500/10" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-400/90">
            {FITCORE_AI_BRAND_NAME}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Choose your workspace
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-400 sm:text-base">
            Start with your own gym or explore a fully loaded demo environment
            to see FitCore AI in action.
          </p>
        </div>

        {error ? (
          <p className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
            {error}
          </p>
        ) : null}

        <WorkspacePickerCards
          selected={selected}
          onSelect={setSelected}
          onContinue={(mode) => void handleContinue(mode)}
          loading={loading}
          loadingMode={loadingMode}
        />

        <button
          type="button"
          disabled={loading}
          onClick={() => void handleContinue(selected)}
          className="btn-gradient mt-6 h-12 w-full rounded-xl font-semibold disabled:opacity-50"
        >
          {loading ? "Loading demo workspace…" : selected === "demo" ? "Explore Demo Workspace" : "Open My Workspace"}
        </button>
      </div>
    </div>
  )
}
