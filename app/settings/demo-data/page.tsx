"use client"

import { useState } from "react"
import {
  CheckCircle2,
  Database,
  Loader2,
  Sparkles,
  Trash2,
} from "lucide-react"
import { FITCORE_AI_BRAND_NAME } from "@/lib/brand/fitcore-ai"
import ProtectedShell from "@/app/components/ProtectedShell"
import Toast from "@/app/components/Toast"
import { useIsDemoWorkspace } from "@/app/hooks/useIsDemoWorkspace"
import { DashboardSectionHeader } from "@/components/coach-dashboard/coach-dashboard-ui"
import GlassCard from "@/components/ui/glass-card"
import SettingsNav from "@/components/settings/SettingsNav"
import {
  DEMO_WORKSPACE_BANNER_TEXT,
  DEMO_WORKSPACE_CLEAR_DESCRIPTION,
  DEMO_WORKSPACE_CLEAR_LOADING_LABEL,
  DEMO_WORKSPACE_CLEAR_NONE_FOUND,
  DEMO_WORKSPACE_CLEAR_SUCCESS,
  DEMO_WORKSPACE_LOAD_ACTION,
  DEMO_WORKSPACE_LOADING_LABEL,
  DEMO_WORKSPACE_LOAD_SUCCESS,
  demoWorkspaceIncludesCopy,
} from "@/lib/demo/demo-copy"

type ActionStatus = "idle" | "loading" | "success" | "error"

export default function DemoDataPage() {
  const { isDemoWorkspace, loading: demoWorkspaceLoading } = useIsDemoWorkspace()
  const [generateStatus, setGenerateStatus] = useState<ActionStatus>("idle")
  const [clearStatus, setClearStatus] = useState<ActionStatus>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  async function handleGenerate() {
    setGenerateStatus("loading")
    setClearStatus("idle")
    setErrorMessage(null)

    try {
      const res = await fetch("/api/demo/generate", {
        method: "POST",
        credentials: "include",
      })

      let data: { success?: boolean; error?: string; workout_plan_exercises_created?: number } =
        {}

      try {
        data = (await res.json()) as typeof data
      } catch {
        setGenerateStatus("error")
        setErrorMessage(
          res.ok
            ? "Demo workspace load returned an invalid response."
            : `Could not load demo workspace (${res.status}). Check server logs.`,
        )
        return
      }

      console.log("[demo/generate] response:", data)

      if (!res.ok) {
        setGenerateStatus("error")
        setErrorMessage(data.error ?? `Could not load demo workspace (${res.status}).`)
        return
      }

      setGenerateStatus("success")
      const exercises = data.workout_plan_exercises_created ?? 0
      setToast(
        exercises > 0
          ? `${DEMO_WORKSPACE_LOAD_SUCCESS} (${exercises} workout exercises).`
          : DEMO_WORKSPACE_LOAD_SUCCESS,
      )
    } catch {
      setGenerateStatus("error")
      setErrorMessage("Could not load demo workspace.")
    }
  }

  async function handleClear() {
    setClearStatus("loading")
    setGenerateStatus("idle")
    setErrorMessage(null)

    try {
      const res = await fetch("/api/demo/clear", {
        method: "POST",
        credentials: "include",
      })

      const data = (await res.json()) as {
        success?: boolean
        message?: string
        members_deleted?: number
        warning?: string
        error?: string
      }

      console.log("[demo/clear] response:", data)

      if (!res.ok) {
        setClearStatus("error")
        setErrorMessage(data.error ?? "Could not clear demo data.")
        return
      }

      setClearStatus("success")

      const deleted = data.members_deleted ?? 0
      const toastMessage =
        deleted > 0
          ? `${data.message ?? "Demo workspace data cleared"} (${deleted} members removed)`
          : (data.message ?? DEMO_WORKSPACE_CLEAR_NONE_FOUND)

      if (data.warning) {
        console.warn("[demo/clear] warning:", data.warning)
      }

      setToast(toastMessage)
    } catch {
      setClearStatus("error")
      setErrorMessage("Could not clear demo data.")
    }
  }

  return (
    <ProtectedShell allowed={["admin", "coach"]}>
      <main className="premium-mesh flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <DashboardSectionHeader
          eyebrow={FITCORE_AI_BRAND_NAME}
          title="Demo Data Manager"
          description="Load a realistic demo workspace for product demos, screenshots and launch videos."
        />

        <SettingsNav />

        {!demoWorkspaceLoading && isDemoWorkspace ? (
          <div
            className="mb-6 flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/25 bg-gradient-to-r from-cyan-500/15 via-indigo-500/10 to-violet-500/10 px-4 py-2.5 text-center text-sm font-medium text-cyan-100/95"
            role="status"
            aria-live="polite"
          >
            <Sparkles className="h-4 w-4 shrink-0 text-cyan-300/90" aria-hidden />
            <span>{DEMO_WORKSPACE_BANNER_TEXT}</span>
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DemoActionCard
            title="Load Demo Workspace"
            description="Create demo members, workout plans, and nutrition assignments for a polished product showcase."
            icon={Sparkles}
            accent="from-cyan-500/20 to-indigo-500/20 text-cyan-300"
            status={generateStatus}
            successMessage={DEMO_WORKSPACE_LOAD_SUCCESS}
            buttonLabel={DEMO_WORKSPACE_LOAD_ACTION}
            loadingLabel={DEMO_WORKSPACE_LOADING_LABEL}
            onAction={() => void handleGenerate()}
            variant="primary"
          />

          <DemoActionCard
            title="Clear Demo Data"
            description={DEMO_WORKSPACE_CLEAR_DESCRIPTION}
            icon={Trash2}
            accent="from-rose-500/20 to-amber-500/20 text-rose-300"
            status={clearStatus}
            successMessage={DEMO_WORKSPACE_CLEAR_SUCCESS}
            buttonLabel="Clear Demo Data"
            loadingLabel={DEMO_WORKSPACE_CLEAR_LOADING_LABEL}
            onAction={() => void handleClear()}
            variant="danger"
          />
        </div>

        <GlassCard className="mt-6 border-white/10 p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
              <Database className="h-5 w-5 text-slate-400" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-medium text-white">What gets created</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">
                {demoWorkspaceIncludesCopy()}
              </p>
            </div>
          </div>
        </GlassCard>

        {toast ? (
          <Toast
            title={toast}
            variant="success"
            onDismiss={() => setToast(null)}
          />
        ) : null}
      </main>
    </ProtectedShell>
  )
}

function DemoActionCard({
  title,
  description,
  icon: Icon,
  accent,
  status,
  successMessage,
  buttonLabel,
  loadingLabel,
  onAction,
  variant,
}: {
  title: string
  description: string
  icon: typeof Sparkles
  accent: string
  status: ActionStatus
  successMessage: string
  buttonLabel: string
  loadingLabel: string
  onAction: () => void
  variant: "primary" | "danger"
}) {
  const isLoading = status === "loading"
  const isSuccess = status === "success"

  return (
    <GlassCard
      className={`relative overflow-hidden p-6 sm:p-8 ${
        isSuccess ? "border-emerald-500/30 bg-emerald-500/[0.04]" : ""
      }`}
      hover={!isLoading}
    >
      <div
        className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br blur-3xl ${accent}`}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-white sm:text-2xl">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              {description}
            </p>
          </div>
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br ${accent}`}
          >
            <Icon className="h-5 w-5" aria-hidden />
          </div>
        </div>

        {isSuccess ? (
          <div
            className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
            role="status"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{successMessage}</span>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onAction}
          disabled={isLoading}
          className={
            variant === "primary"
              ? "btn-gradient mt-6 w-full sm:w-auto"
              : "btn-ghost mt-6 w-full border-rose-500/25 text-rose-200 hover:border-rose-400/40 hover:bg-rose-500/10 sm:w-auto"
          }
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              {loadingLabel}
            </>
          ) : (
            buttonLabel
          )}
        </button>
      </div>
    </GlassCard>
  )
}
