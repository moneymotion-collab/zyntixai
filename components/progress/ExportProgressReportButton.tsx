"use client"

import { useMemo, useState } from "react"
import { Download } from "lucide-react"
import ButtonSpinner from "@/components/ui/button-spinner"
import ProgressErrorBanner from "@/components/progress/ProgressErrorBanner"
import { PROGRESS_PRO_BTN_PRIMARY } from "@/components/progress/progress-pro-ui"
import type { AiProgressCoachInsight } from "@/lib/progress/compute-ai-progress-coach"
import type { ProgressAlert } from "@/lib/progress/compute-progress-alerts"
import type { WeeklyProgressReport } from "@/lib/progress/compute-weekly-progress-report"
import type { ClientGoalViewModel } from "@/lib/progress/client-goals"
import type { ClientProgressSummary } from "@/lib/progress/client-checkin-member-view"
import type { ClientCheckInRow } from "@/lib/progress/client-checkins"
import {
  buildProgressReportExportData,
  downloadProgressReportPdf,
} from "@/lib/progress/build-progress-report-pdf"

type ExportProgressReportButtonProps = {
  memberFilterLabel: string
  memberFilter: string
  memberName?: string
  weeklyReport: WeeklyProgressReport | null
  progressSummary: ClientProgressSummary | null
  goals: ClientGoalViewModel[]
  alerts: ProgressAlert[]
  aiCoach: AiProgressCoachInsight
  checkIns: ClientCheckInRow[]
  disabled?: boolean
  className?: string
  variant?: "primary" | "inline"
}

export default function ExportProgressReportButton({
  memberFilterLabel,
  memberFilter,
  memberName,
  weeklyReport,
  progressSummary,
  goals,
  alerts,
  aiCoach,
  checkIns,
  disabled = false,
  className = "",
  variant = "primary",
}: ExportProgressReportButtonProps) {
  const [exporting, setExporting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const exportData = useMemo(
    () =>
      buildProgressReportExportData({
        memberFilterLabel,
        memberFilter,
        memberName,
        weeklyReport,
        progressSummary,
        goals,
        alerts,
        aiCoach,
        checkIns,
      }),
    [
      aiCoach,
      alerts,
      checkIns,
      goals,
      memberFilter,
      memberFilterLabel,
      memberName,
      progressSummary,
      weeklyReport,
    ],
  )

  async function handleExport() {
    setExporting(true)
    setErrorMessage(null)

    try {
      await downloadProgressReportPdf(exportData)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not export the PDF report.",
      )
    } finally {
      setExporting(false)
    }
  }

  const buttonClass =
    variant === "primary"
      ? PROGRESS_PRO_BTN_PRIMARY
      : "inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 text-sm font-medium text-cyan-200 transition hover:border-cyan-500/50 hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => void handleExport()}
        disabled={disabled || exporting || !aiCoach.hasData}
        aria-busy={exporting || undefined}
        className={buttonClass}
      >
        {exporting ? (
          <>
            <ButtonSpinner />
            Exporting…
          </>
        ) : (
          <>
            <Download className="h-4 w-4" aria-hidden />
            Export Report
          </>
        )}
      </button>
      {errorMessage ? (
        <div className="mt-3">
          <ProgressErrorBanner
            title="Failed to export PDF"
            message={errorMessage}
            onRetry={() => void handleExport()}
            retrying={exporting}
          />
        </div>
      ) : null}
    </div>
  )
}
