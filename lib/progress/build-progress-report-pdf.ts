import type { AiProgressCoachInsight } from "@/lib/progress/compute-ai-progress-coach"
import type { ProgressAlert } from "@/lib/progress/compute-progress-alerts"
import {
  formatWeeklyAverageScore,
  formatWeeklyWeightChange,
  getWeeklyReportPeriod,
  type WeeklyProgressReport,
} from "@/lib/progress/compute-weekly-progress-report"
import type { ClientGoalViewModel } from "@/lib/progress/client-goals"
import type { ClientProgressSummary } from "@/lib/progress/client-checkin-member-view"
import {
  formatCheckInDate,
  formatCheckInWeight,
  type ClientCheckInRow,
} from "@/lib/progress/client-checkins"
import { filterCheckInsByMember } from "@/lib/progress/client-checkin-member-view"
import { getAlertSeverityLabel } from "@/lib/progress/compute-progress-alerts"
import {
  computeClientCheckInInsights,
  formatAverageScore,
  formatAverageWeightChange,
} from "@/lib/progress/compute-client-checkin-insights"

export type ProgressReportExportData = {
  memberName: string
  reportPeriod: string
  exportDate: string
  progressSummary: {
    latestWeight: string
    weightChange: string
    averageEnergy: string
    averageSleep: string
    averageMotivation: string
  }
  goals: {
    title: string
    progressPercent: number
    statusLabel: string
  }[]
  alerts: {
    alertTypeLabel: string
    severity: string
    suggestedAction: string
  }[]
  aiCoach: {
    memberSummary: string
    biggestRisk: string
    bestPositiveSignal: string
    recommendedCoachAction: string
    suggestedMemberMessage: string
  }
  coachNotes: {
    checkInDate: string
    coachNote: string
    actionPlan: string
  }[]
}

function goalStatusLabel(status: ClientGoalViewModel["status"]): string {
  switch (status) {
    case "on_track":
      return "On Track"
    case "behind_schedule":
      return "Behind Schedule"
    case "completed":
      return "Completed"
    default:
      return status
  }
}

function formatExportDate(date = new Date()): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function compareCheckInsDesc(a: ClientCheckInRow, b: ClientCheckInRow): number {
  const dateCompare = b.checkin_date.localeCompare(a.checkin_date)
  if (dateCompare !== 0) return dateCompare
  return b.created_at.localeCompare(a.created_at)
}

export function buildProgressReportExportData(input: {
  memberFilterLabel: string
  memberFilter: string
  memberName?: string
  weeklyReport: WeeklyProgressReport | null
  progressSummary: ClientProgressSummary | null
  goals: ClientGoalViewModel[]
  alerts: ProgressAlert[]
  aiCoach: AiProgressCoachInsight
  checkIns: ClientCheckInRow[]
}): ProgressReportExportData {
  const period = getWeeklyReportPeriod()
  const scopedGoals =
    input.memberFilter === "all"
      ? input.goals
      : input.goals.filter((goal) => goal.memberId === input.memberFilter)

  const scopedCheckIns = filterCheckInsByMember(
    input.checkIns,
    input.memberFilter,
    input.memberName,
  )

  const notesSource = scopedCheckIns
    .filter((row) => row.coach_note?.trim() || row.action_plan?.trim())
    .sort(compareCheckInsDesc)
    .slice(0, 5)

  const rosterInsights =
    !input.weeklyReport && !input.progressSummary
      ? computeClientCheckInInsights(scopedCheckIns)
      : null

  const progressSummary = {
    latestWeight: input.progressSummary?.latestWeight != null
      ? formatCheckInWeight(input.progressSummary.latestWeight)
      : "—",
    weightChange: input.weeklyReport
      ? formatWeeklyWeightChange(input.weeklyReport.weightChange)
      : rosterInsights
        ? formatAverageWeightChange(rosterInsights.averageWeightChange)
        : "—",
    averageEnergy: input.weeklyReport
      ? formatWeeklyAverageScore(input.weeklyReport.averageEnergy)
      : rosterInsights
        ? formatAverageScore(rosterInsights.averageEnergy)
        : "—",
    averageSleep: input.weeklyReport
      ? formatWeeklyAverageScore(input.weeklyReport.averageSleep)
      : rosterInsights
        ? formatAverageScore(rosterInsights.averageSleep)
        : "—",
    averageMotivation: input.weeklyReport
      ? formatWeeklyAverageScore(input.weeklyReport.averageMotivation)
      : rosterInsights
        ? formatAverageScore(rosterInsights.averageMotivation)
        : "—",
  }

  return {
    memberName: input.memberFilterLabel,
    reportPeriod: input.weeklyReport?.periodLabel ?? period.label,
    exportDate: formatExportDate(),
    progressSummary,
    goals: scopedGoals.map((goal) => ({
      title: goal.title,
      progressPercent: goal.progressPercent,
      statusLabel: goalStatusLabel(goal.status),
    })),
    alerts: input.alerts.map((alert) => ({
      alertTypeLabel: alert.alertTypeLabel,
      severity: getAlertSeverityLabel(alert.severity),
      suggestedAction: alert.suggestedAction,
    })),
    aiCoach: {
      memberSummary: input.aiCoach.memberSummary,
      biggestRisk: input.aiCoach.biggestRisk,
      bestPositiveSignal: input.aiCoach.bestPositiveSignal,
      recommendedCoachAction: input.aiCoach.recommendedCoachAction,
      suggestedMemberMessage: input.aiCoach.suggestedMemberMessage,
    },
    coachNotes: notesSource.map((row) => ({
      checkInDate: formatCheckInDate(row.checkin_date),
      coachNote: row.coach_note?.trim() || "—",
      actionPlan: row.action_plan?.trim() || "—",
    })),
  }
}

export function buildProgressReportFilename(memberName: string): string {
  const slug = memberName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  const date = new Date().toISOString().slice(0, 10)
  return `fitcore-progress-report-${slug || "member"}-${date}.pdf`
}

export async function downloadProgressReportPdf(
  data: ProgressReportExportData,
): Promise<void> {
  const { jsPDF } = await import("jspdf")
  const doc = new jsPDF({ unit: "mm", format: "a4" })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 16
  const contentWidth = pageWidth - margin * 2
  let y = margin

  const colors = {
    brandDark: [11, 18, 36] as [number, number, number],
    brandCyan: [34, 211, 238] as [number, number, number],
    brandViolet: [139, 92, 246] as [number, number, number],
    textDark: [30, 41, 59] as [number, number, number],
    textMuted: [100, 116, 139] as [number, number, number],
    line: [226, 232, 240] as [number, number, number],
  }

  function ensureSpace(height: number) {
    if (y + height > pageHeight - margin) {
      doc.addPage()
      y = margin
    }
  }

  function drawHeaderBand() {
    doc.setFillColor(...colors.brandDark)
    doc.rect(0, 0, pageWidth, 42, "F")

    doc.setFillColor(...colors.brandCyan)
    doc.rect(0, 40, pageWidth, 2, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(22)
    doc.text("FitCore AI", margin, 18)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(...colors.brandCyan)
    doc.text("PROGRESS REPORT", margin, 26)

    doc.setTextColor(220, 230, 240)
    doc.setFontSize(9)
    doc.text(`Member: ${data.memberName}`, margin, 34)
    doc.text(`Period: ${data.reportPeriod}`, pageWidth / 2, 34)
    doc.text(`Exported: ${data.exportDate}`, pageWidth - margin, 34, {
      align: "right",
    })

    y = 52
  }

  function drawSectionTitle(title: string) {
    ensureSpace(14)
    doc.setFillColor(...colors.brandCyan)
    doc.circle(margin + 1.5, y - 1.5, 1.5, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(13)
    doc.setTextColor(...colors.textDark)
    doc.text(title, margin + 6, y)
    y += 4
    doc.setDrawColor(...colors.line)
    doc.line(margin, y, pageWidth - margin, y)
    y += 8
  }

  function drawLabelValue(label: string, value: string) {
    ensureSpace(10)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.setTextColor(...colors.textMuted)
    doc.text(label.toUpperCase(), margin, y)
    y += 5
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(...colors.textDark)
    const lines = doc.splitTextToSize(value, contentWidth)
    for (const line of lines) {
      ensureSpace(5)
      doc.text(line, margin, y)
      y += 5
    }
    y += 2
  }

  function drawParagraph(text: string) {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(...colors.textDark)
    const lines = doc.splitTextToSize(text, contentWidth)
    for (const line of lines) {
      ensureSpace(5)
      doc.text(line, margin, y)
      y += 5
    }
    y += 3
  }

  function drawSummaryGrid(items: { label: string; value: string }[]) {
    const colWidth = contentWidth / 2
    for (let index = 0; index < items.length; index += 2) {
      ensureSpace(18)
      const rowY = y
      for (let col = 0; col < 2; col += 1) {
        const item = items[index + col]
        if (!item) continue
        const x = margin + col * colWidth
        doc.setFillColor(248, 250, 252)
        doc.roundedRect(x, rowY, colWidth - 4, 14, 2, 2, "F")
        doc.setFont("helvetica", "bold")
        doc.setFontSize(8)
        doc.setTextColor(...colors.textMuted)
        doc.text(item.label.toUpperCase(), x + 3, rowY + 5)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(11)
        doc.setTextColor(...colors.textDark)
        doc.text(item.value, x + 3, rowY + 11)
      }
      y = rowY + 18
    }
    y += 4
  }

  drawHeaderBand()

  drawSectionTitle("Progress Summary")
  drawSummaryGrid([
    { label: "Latest weight", value: data.progressSummary.latestWeight },
    { label: "Weight change", value: data.progressSummary.weightChange },
    { label: "Average energy", value: data.progressSummary.averageEnergy },
    { label: "Average sleep", value: data.progressSummary.averageSleep },
    {
      label: "Average motivation",
      value: data.progressSummary.averageMotivation,
    },
  ])

  drawSectionTitle("Goals")
  if (data.goals.length === 0) {
    drawParagraph("No goals recorded for this report scope.")
  } else {
    for (const goal of data.goals) {
      ensureSpace(16)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(10)
      doc.setTextColor(...colors.textDark)
      doc.text(goal.title, margin, y)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.setTextColor(...colors.textMuted)
      doc.text(
        `${goal.progressPercent}% complete · ${goal.statusLabel}`,
        margin,
        y + 5,
      )
      doc.setDrawColor(...colors.line)
      doc.line(margin, y + 8, pageWidth - margin, y + 8)
      y += 14
    }
  }

  drawSectionTitle("Alerts")
  if (data.alerts.length === 0) {
    drawParagraph("No active progress alerts.")
  } else {
    for (const alert of data.alerts) {
      drawLabelValue(
        `${alert.alertTypeLabel} · ${alert.severity} severity`,
        alert.suggestedAction,
      )
    }
  }

  drawSectionTitle("AI Progress Coach")
  drawLabelValue("Member summary", data.aiCoach.memberSummary)
  drawLabelValue("Biggest risk", data.aiCoach.biggestRisk)
  drawLabelValue("Best positive signal", data.aiCoach.bestPositiveSignal)
  drawLabelValue("Recommended coach action", data.aiCoach.recommendedCoachAction)
  drawLabelValue("Suggested message to member", data.aiCoach.suggestedMemberMessage)

  drawSectionTitle("Coach Notes")
  if (data.coachNotes.length === 0) {
    drawParagraph("No coach notes or action plans logged on recent check-ins.")
  } else {
    for (const note of data.coachNotes) {
      ensureSpace(24)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(9)
      doc.setTextColor(...colors.brandViolet)
      doc.text(`Check-in · ${note.checkInDate}`, margin, y)
      y += 6
      drawLabelValue("Coach note", note.coachNote)
      drawLabelValue("Action plan", note.actionPlan)
    }
  }

  const pageCount = doc.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(...colors.textMuted)
    doc.text("FitCore AI · Progress Report", margin, pageHeight - 8)
    doc.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 8, {
      align: "right",
    })
  }

  doc.save(buildProgressReportFilename(data.memberName))
}
