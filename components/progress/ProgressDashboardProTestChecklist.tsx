"use client"

import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, Circle, ClipboardCheck, RotateCcw } from "lucide-react"
import {
  PROGRESS_PRO_BTN_SECONDARY,
  PROGRESS_PRO_CARD,
  PROGRESS_PRO_CARD_INNER,
  ProgressProSectionHeader,
} from "@/components/progress/progress-pro-ui"
import {
  PROGRESS_DASHBOARD_PRO_TEST_CHECKLIST,
  PROGRESS_DASHBOARD_PRO_TEST_CHECKLIST_STORAGE_KEY,
} from "@/lib/progress/progress-dashboard-pro-test-checklist"

function readStoredChecks(): Record<string, boolean> {
  if (typeof window === "undefined") return {}

  try {
    const raw = window.localStorage.getItem(
      PROGRESS_DASHBOARD_PRO_TEST_CHECKLIST_STORAGE_KEY,
    )
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, boolean>
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

export default function ProgressDashboardProTestChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setChecked(readStoredChecks())
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(
      PROGRESS_DASHBOARD_PRO_TEST_CHECKLIST_STORAGE_KEY,
      JSON.stringify(checked),
    )
  }, [checked])

  const completedCount = useMemo(
    () =>
      PROGRESS_DASHBOARD_PRO_TEST_CHECKLIST.filter((item) => checked[item.id])
        .length,
    [checked],
  )

  const totalCount = PROGRESS_DASHBOARD_PRO_TEST_CHECKLIST.length
  const progressPercent = Math.round((completedCount / totalCount) * 100)

  function toggleItem(id: string) {
    setChecked((current) => ({ ...current, [id]: !current[id] }))
  }

  function resetChecklist() {
    setChecked({})
  }

  return (
    <div
      className={`relative overflow-hidden ${PROGRESS_PRO_CARD} border-amber-500/25 bg-gradient-to-br from-amber-500/[0.06] via-white/[0.03] to-cyan-500/[0.05] p-6 sm:p-8`}
      data-testid="progress-dashboard-pro-dev-checklist"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative">
        <ProgressProSectionHeader
          eyebrow="Development only"
          title="Progress Dashboard Pro — final test checklist"
          description="Manual QA checklist for launch readiness. Hidden in production builds. Progress is saved locally in your browser."
          accent="amber"
          action={
            <span className="inline-flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-amber-200">
              <ClipboardCheck className="h-4 w-4" aria-hidden />
              Dev QA
            </span>
          }
        />

        <div className={`${PROGRESS_PRO_CARD_INNER} mb-6 p-4 sm:p-5`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white">
                {completedCount} of {totalCount} checks complete
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {completedCount === totalCount
                  ? "All items verified — ready for sign-off."
                  : "Work through each item before release."}
              </p>
            </div>
            <button
              type="button"
              onClick={resetChecklist}
              className={PROGRESS_PRO_BTN_SECONDARY}
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Reset
            </button>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#0b1224]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-cyan-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <ul className="relative grid grid-cols-1 gap-3 lg:grid-cols-2">
          {PROGRESS_DASHBOARD_PRO_TEST_CHECKLIST.map((item, index) => {
            const isChecked = Boolean(checked[item.id])

            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className={`group flex w-full items-start gap-3 rounded-2xl border px-4 py-4 text-left transition ${
                    isChecked
                      ? "border-emerald-500/30 bg-emerald-500/[0.06] hover:border-emerald-500/40"
                      : "border-white/10 bg-[#0b1224]/40 hover:border-white/20 hover:bg-[#0b1224]/60"
                  }`}
                >
                  <span className="mt-0.5 shrink-0">
                    {isChecked ? (
                      <CheckCircle2
                        className="h-5 w-5 text-emerald-400"
                        aria-hidden
                      />
                    ) : (
                      <Circle
                        className="h-5 w-5 text-gray-500 transition group-hover:text-gray-400"
                        aria-hidden
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm font-medium ${isChecked ? "text-emerald-100" : "text-white"}`}
                      >
                        {item.label}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        #{String(index + 1).padStart(2, "0")}
                      </span>
                    </span>
                    {item.hint ? (
                      <span className="mt-1 block text-xs leading-relaxed text-gray-500">
                        {item.hint}
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
