"use client"

import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, Circle, ClipboardCheck, RotateCcw } from "lucide-react"
import { DashboardSectionHeader } from "@/components/coach-dashboard/coach-dashboard-ui"
import GlassCard from "@/components/ui/glass-card"
import {
  COACH_DASHBOARD_PRO_TEST_CHECKLIST,
  COACH_DASHBOARD_PRO_TEST_CHECKLIST_STORAGE_KEY,
  coachDashboardProTestChecklistTotal,
  type CoachDashboardProTestChecklistSection,
} from "@/lib/coach-dashboard/coach-dashboard-pro-test-checklist"

function readStoredChecks(): Record<string, boolean> {
  if (typeof window === "undefined") return {}

  try {
    const raw = window.localStorage.getItem(
      COACH_DASHBOARD_PRO_TEST_CHECKLIST_STORAGE_KEY,
    )
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, boolean>
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

function sectionProgress(
  section: CoachDashboardProTestChecklistSection,
  checked: Record<string, boolean>,
) {
  const completed = section.items.filter((item) => checked[item.id]).length
  const total = section.items.length
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0
  return { completed, total, percent }
}

export default function CoachDashboardProTestChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setChecked(readStoredChecks())
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(
      COACH_DASHBOARD_PRO_TEST_CHECKLIST_STORAGE_KEY,
      JSON.stringify(checked),
    )
  }, [checked])

  const totalCount = coachDashboardProTestChecklistTotal()
  const completedCount = useMemo(
    () =>
      COACH_DASHBOARD_PRO_TEST_CHECKLIST.flatMap((section) => section.items).filter(
        (item) => checked[item.id],
      ).length,
    [checked],
  )
  const progressPercent = Math.round((completedCount / totalCount) * 100)

  function toggleItem(id: string) {
    setChecked((current) => ({ ...current, [id]: !current[id] }))
  }

  function resetChecklist() {
    setChecked({})
  }

  return (
    <GlassCard
      className="relative overflow-hidden border-amber-500/25 bg-gradient-to-br from-amber-500/[0.06] via-white/[0.03] to-cyan-500/[0.05] p-6 sm:p-8"
      data-testid="coach-dashboard-pro-dev-checklist"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative">
        <DashboardSectionHeader
          eyebrow="Development only"
          title="Coach Dashboard Pro Validation"
          description="Manual QA checklist for launch readiness. Hidden in production builds. Progress is saved locally in your browser."
          badge={
            <span className="inline-flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-amber-200">
              <ClipboardCheck className="h-4 w-4" aria-hidden />
              Dev QA
            </span>
          }
        />

        <div className="glass-panel mb-8 rounded-2xl p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white">
                {completedCount} of {totalCount} checks complete
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {completedCount === totalCount
                  ? "All items verified — ready for sign-off."
                  : "Work through each section before release."}
              </p>
            </div>
            <button
              type="button"
              onClick={resetChecklist}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Reset
            </button>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#0b1224]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-cyan-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-cyan-300">
              {progressPercent}%
            </span>
          </div>
        </div>

        <div className="relative space-y-8">
          {COACH_DASHBOARD_PRO_TEST_CHECKLIST.map((section) => {
            const { completed, total, percent } = sectionProgress(section, checked)

            return (
              <section key={section.id} aria-labelledby={`checklist-${section.id}`}>
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h3
                      id={`checklist-${section.id}`}
                      className="text-lg font-semibold text-white"
                    >
                      {section.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {completed} of {total} complete
                    </p>
                  </div>
                  <span className="text-sm font-medium tabular-nums text-slate-400">
                    {percent}%
                  </span>
                </div>
                <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-[#0b1224]">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      percent === 100
                        ? "bg-gradient-to-r from-emerald-400 to-teal-400"
                        : "bg-gradient-to-r from-violet-400/80 to-cyan-400/80"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {section.items.map((item, index) => {
                    const isChecked = Boolean(checked[item.id])

                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => toggleItem(item.id)}
                          className={`group flex w-full items-start gap-3 rounded-2xl border px-4 py-4 text-left transition duration-200 ${
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
                                className="h-5 w-5 text-slate-500 transition group-hover:text-slate-400"
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
                              <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                #{String(index + 1).padStart(2, "0")}
                              </span>
                            </span>
                            {item.hint ? (
                              <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                                {item.hint}
                              </span>
                            ) : null}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </div>
      </div>
    </GlassCard>
  )
}
