"use client"

import { useEffect, useMemo, useState } from "react"
import { Bot, FileText, Loader2, Printer, X } from "lucide-react"
import { buildProgressReportData } from "@/lib/progress/build-progress-report"
import type { ProgressCoachInsight } from "@/lib/progress/compute-progress-coach-insights"
import type { MemberProgressSummary } from "@/lib/progress/compute-member-progress-summary"
import {
  formatChange,
  formatDateTime,
  formatValue,
  type ProgressLogRow,
} from "@/lib/progress/fetch-progress-dashboard"
import { fetchMemberCoachNotes, type CoachNoteRow } from "@/lib/progress/fetch-coach-notes"
import type { ClientGoalViewModel } from "@/lib/progress/client-goals"
import { formatMetricDisplay } from "@/lib/progress/metrics"
import { createClient } from "@/lib/supabase/client"
import SaasEmptyState from "@/components/ui/saas-empty-state"
import AnimatedModal, { useMountAnimatedModal } from "@/components/ui/animated-modal"
import { MOBILE_MODAL_PANEL, MOBILE_MODAL_ROOT, MOBILE_TAP_TARGET } from "@/lib/ui/mobile-layout"
import type { SaasEmptyPreset } from "@/lib/copy/empty-state-presets"

type ProgressReportModalProps = {
  memberId: string
  memberName: string
  memberEmail: string | null
  logs: ProgressLogRow[]
  goals: ClientGoalViewModel[]
  summary: MemberProgressSummary
  coachInsights: ProgressCoachInsight[]
  onClose: () => void
}

export default function ProgressReportModal({
  memberId,
  memberName,
  memberEmail,
  logs,
  goals,
  summary,
  coachInsights,
  onClose,
}: ProgressReportModalProps) {
  const supabase = createClient()
  const [coachNotes, setCoachNotes] = useState<CoachNoteRow[]>([])
  const [notesLoading, setNotesLoading] = useState(true)
  const [notesError, setNotesError] = useState<string | null>(null)
  const { open, requestClose, onExitComplete } = useMountAnimatedModal(onClose)

  useEffect(() => {
    const loadNotes = async () => {
      setNotesLoading(true)
      const result = await fetchMemberCoachNotes(supabase, memberId)
      setCoachNotes(result.notes)
      setNotesError(result.error)
      setNotesLoading(false)
    }
    void loadNotes()
  }, [memberId, supabase])

  const report = useMemo(
    () =>
      buildProgressReportData({
        memberName,
        memberEmail,
        logs,
        goals,
        summary,
        coachInsights,
        coachNotes,
      }),
    [memberName, memberEmail, logs, goals, summary, coachInsights, coachNotes],
  )

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page { margin: 1.2cm; }
              body * { visibility: hidden !important; }
              #progress-report-print,
              #progress-report-print * { visibility: visible !important; }
              #progress-report-print {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background: white !important;
                color: #0f172a !important;
              }
            }
          `,
        }}
      />

      <AnimatedModal
        open={open}
        onClose={requestClose}
        onExitComplete={onExitComplete}
        ariaLabelledBy="progress-report-title"
        className={`${MOBILE_MODAL_ROOT} items-start sm:p-8 print:static print:overflow-visible print:p-0`}
        panelClassName={`relative max-w-4xl ${MOBILE_MODAL_PANEL} print:max-h-none print:max-w-none print:overflow-visible`}
        backdropClassName="bg-black/70 backdrop-blur-sm print:hidden"
        closeOnBackdrop={false}
      >
          <div className="sticky top-0 z-10 mb-4 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0b1224]/95 px-4 py-3 backdrop-blur-md print:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10">
                <FileText className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Progress Report</p>
                <p className="text-xs text-gray-400">{memberName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                disabled={notesLoading}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-medium text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Printer className="h-4 w-4" />
                Print / Save as PDF
              </button>
              <button
                type="button"
                onClick={requestClose}
                className={`${MOBILE_TAP_TARGET} rounded-xl border border-white/10 text-gray-400 transition hover:bg-white/5 hover:text-white`}
                aria-label="Close report"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {notesLoading ? (
            <div className="flex items-center justify-center gap-2 rounded-3xl border border-white/10 bg-white/5 py-24 text-gray-400 print:hidden">
              <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
              Preparing report…
            </div>
          ) : (
            <div
              id="progress-report-print"
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl print:rounded-none print:border-0 print:shadow-none"
            >
              <ReportHeader report={report} />

              <div className="space-y-8 px-6 py-8 sm:px-10 sm:py-10">
                <ReportSummaryGrid report={report} />
                <GoalsSection goals={report.goals} />
                <CoachInsightsSection insights={report.coachInsights} />
                <RecentHistorySection history={report.recentHistory} totalLogs={report.totalLogs} />
                <CoachNotesSection notes={report.coachNotes} error={notesError} />
              </div>

              <footer className="border-t border-slate-200 bg-slate-50 px-6 py-4 text-center text-xs text-slate-500 sm:px-10">
                Generated by Progress Dashboard Pro ·{" "}
                {formatDateTime(report.generatedAt)}
              </footer>
            </div>
          )}
      </AnimatedModal>
    </>
  )
}

function ReportHeader({
  report,
}: {
  report: ReturnType<typeof buildProgressReportData>
}) {
  return (
    <header className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-cyan-50 px-6 py-8 sm:px-10">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-700">
        Progress Dashboard Pro
      </p>
      <h1 id="progress-report-title" className="mt-3 text-3xl font-bold text-slate-900">
        Member Progress Report
      </h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <MetaItem label="Member" value={report.memberName} />
        {report.memberEmail ? (
          <MetaItem label="Email" value={report.memberEmail} />
        ) : null}
        <MetaItem label="Date range" value={report.dateRange.label} />
        <MetaItem label="Report generated" value={formatDateTime(report.generatedAt)} />
      </div>
    </header>
  )
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function ReportSummaryGrid({
  report,
}: {
  report: ReturnType<typeof buildProgressReportData>
}) {
  const bestImprovement = report.bestImprovement
    ? `${report.bestImprovement.metric} (${formatChange(report.bestImprovement.changeValue)})`
    : "—"

  return (
    <section>
      <SectionTitle title="Summary" />
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryTile label="Total progress logs" value={String(report.totalLogs)} />
        <SummaryTile label="Best improvement" value={bestImprovement} compact />
        <SummaryTile label="Active goals" value={String(report.goals.active.length)} />
        <SummaryTile
          label="Completed / overdue"
          value={`${report.goals.completed.length} / ${report.goals.overdue.length}`}
        />
      </div>
    </section>
  )
}

function SummaryTile({
  label,
  value,
  compact = false,
}: {
  label: string
  value: string
  compact?: boolean
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p
        className={`mt-2 font-bold text-slate-900 ${compact ? "truncate text-sm" : "text-2xl"}`}
        title={compact ? value : undefined}
      >
        {value}
      </p>
    </div>
  )
}

function GoalsSection({
  goals,
}: {
  goals: ReturnType<typeof buildProgressReportData>["goals"]
}) {
  const sections = [
    { key: "active", label: "Active goals", items: goals.active, tone: "text-cyan-700" },
    {
      key: "completed",
      label: "Completed goals",
      items: goals.completed,
      tone: "text-emerald-700",
    },
    { key: "overdue", label: "Overdue goals", items: goals.overdue, tone: "text-amber-700" },
  ] as const

  const total = goals.active.length + goals.completed.length + goals.overdue.length

  return (
    <section>
      <SectionTitle title="Goals" subtitle={`${total} total goals tracked`} />
      {total === 0 ? (
        <EmptyBlock preset="goals" />
      ) : (
        <div className="mt-4 space-y-6">
          {sections.map((section) => (
            <div key={section.key}>
              <h3 className={`text-sm font-semibold ${section.tone}`}>
                {section.label} ({section.items.length})
              </h3>
              {section.items.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">None</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {section.items.map((goal) => (
                    <li
                      key={goal.id}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-900">{goal.title}</p>
                          <p className="text-sm text-slate-500">{goal.goalTypeLabel}</p>
                        </div>
                        <StatusBadge status={goal.status} />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                        <span>Progress: {goal.progressPercent}%</span>
                        <span>
                          Deadline:{" "}
                          {new Date(goal.targetDate).toLocaleDateString("en-US", {
                            dateStyle: "medium",
                          })}
                        </span>
                        <span>
                          {formatValue(goal.currentValue)} / {formatValue(goal.targetValue)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function CoachInsightsSection({ insights }: { insights: ProgressCoachInsight[] }) {
  return (
    <section>
      <SectionTitle
        title="AI Progress Coach insights"
        subtitle="Rule-based recommendations from live progress data"
      />
      {insights.length === 0 ? (
        <EmptyBlock preset="coachInsights" />
      ) : (
        <ul className="mt-4 space-y-3">
          {insights.map((insight) => (
            <li
              key={insight.id}
              className="rounded-xl border border-violet-200 bg-violet-50/60 px-4 py-4"
            >
              <div className="flex items-start gap-3">
                <Bot className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-violet-300 bg-white px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-violet-700">
                      {insight.insightLabel}
                    </span>
                    <span className="text-sm text-slate-500">{insight.metric}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{insight.reason}</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    Recommended: {insight.recommendedAction}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function RecentHistorySection({
  history,
  totalLogs,
}: {
  history: ProgressLogRow[]
  totalLogs: number
}) {
  return (
    <section>
      <SectionTitle
        title="Recent progress history"
        subtitle={
          totalLogs > history.length
            ? `Showing ${history.length} of ${totalLogs} entries`
            : `${totalLogs} ${totalLogs === 1 ? "entry" : "entries"}`
        }
      />
      {history.length === 0 ? (
        <EmptyBlock preset="progress" />
      ) : (
        <>
          <div className="mt-4 hidden overflow-x-auto rounded-xl border border-slate-200 md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Metric</th>
                  <th className="px-4 py-3 font-medium">Start</th>
                  <th className="px-4 py-3 font-medium">Current</th>
                  <th className="px-4 py-3 font-medium">Change</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {history.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {formatMetricDisplay(log.metric)}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-slate-700">
                      {formatValue(log.start_value)}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-slate-700">
                      {formatValue(log.current_value)}
                    </td>
                    <td className="px-4 py-3 tabular-nums font-medium text-slate-900">
                      {formatChange(log.change_value)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDateTime(log.updated_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-4 space-y-3 md:hidden">
            {history.map((log) => (
              <li
                key={log.id}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-slate-900">
                    {formatMetricDisplay(log.metric)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDateTime(log.updated_at)}
                  </p>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-[10px] uppercase text-slate-500">Start</p>
                    <p className="font-medium tabular-nums text-slate-700">
                      {formatValue(log.start_value)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-500">Current</p>
                    <p className="font-medium tabular-nums text-slate-700">
                      {formatValue(log.current_value)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-500">Change</p>
                    <p className="font-semibold tabular-nums text-slate-900">
                      {formatChange(log.change_value)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

function CoachNotesSection({
  notes,
  error,
}: {
  notes: CoachNoteRow[]
  error: string | null
}) {
  return (
    <section>
      <SectionTitle
        title="Coach notes"
        subtitle="Notes saved by the coaching team"
      />
      {error ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Coach notes could not be loaded.
        </p>
      ) : notes.length === 0 ? (
        <EmptyBlock preset="coachNotes" />
      ) : (
        <ul className="mt-4 space-y-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4"
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
                {note.content}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {formatDateTime(note.created_at)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
    </div>
  )
}

function EmptyBlock({ preset }: { preset: SaasEmptyPreset }) {
  return (
    <div className="mt-4">
      <SaasEmptyState preset={preset} variant="light" compact showAction={false} />
    </div>
  )
}

function StatusBadge({ status }: { status: ClientGoalViewModel["status"] }) {
  const config: Record<
    ClientGoalViewModel["status"],
    { styles: string; label: string }
  > = {
    on_track: {
      styles: "border-cyan-300 bg-cyan-50 text-cyan-800",
      label: "On track",
    },
    completed: {
      styles: "border-emerald-300 bg-emerald-50 text-emerald-800",
      label: "Completed",
    },
    behind_schedule: {
      styles: "border-amber-300 bg-amber-50 text-amber-800",
      label: "Behind",
    },
  }

  const { styles, label } = config[status]

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${styles}`}
    >
      {label}
    </span>
  )
}
