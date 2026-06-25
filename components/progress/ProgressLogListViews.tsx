"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import ProgressTrendBadge from "@/components/progress/ProgressTrendBadge"
import {
  formatChange,
  formatDateTime,
  formatValue,
  type ProgressLogRow,
} from "@/lib/progress/fetch-progress-dashboard"
import { formatMetricDisplay } from "@/lib/progress/metrics"

type ProgressLogListViewsProps = {
  logs: ProgressLogRow[]
  /** Show member column (coach dashboard view) */
  showMember?: boolean
}

export function ProgressLogTableDesktop({
  logs,
  showMember = true,
}: ProgressLogListViewsProps) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-gray-400">
            {showMember ? (
              <th className="pb-3 pr-4 font-medium">Member</th>
            ) : null}
            <th className="pb-3 pr-4 font-medium">Metric</th>
            <th className="pb-3 pr-4 font-medium">Start value</th>
            <th className="pb-3 pr-4 font-medium">Current value</th>
            <th className="pb-3 pr-4 font-medium">Change</th>
            <th className="pb-3 pr-4 font-medium">Trend</th>
            <th className="pb-3 pr-4 font-medium">Updated at</th>
            {showMember ? (
              <th className="pb-3 font-medium">Actions</th>
            ) : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {logs.map((log) => (
            <ProgressLogTableRow key={log.id} log={log} showMember={showMember} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ProgressLogCardList({
  logs,
  showMember = true,
}: ProgressLogListViewsProps) {
  return (
    <ul className="space-y-3 md:hidden">
      {logs.map((log) => (
        <ProgressLogCard key={log.id} log={log} showMember={showMember} />
      ))}
    </ul>
  )
}

function ProgressLogTableRow({
  log,
  showMember,
}: {
  log: ProgressLogRow
  showMember: boolean
}) {
  const change = log.change_value
  const changeTone = changeToneClass(change)

  return (
    <tr className="text-gray-200 transition-colors hover:bg-white/[0.03]">
      {showMember ? (
        <td className="py-4 pr-4 font-medium text-white">
          {log.members?.full_name ?? "—"}
        </td>
      ) : null}
      <td className="py-4 pr-4">{formatMetricDisplay(log.metric)}</td>
      <td className="py-4 pr-4 tabular-nums">{formatValue(log.start_value)}</td>
      <td className="py-4 pr-4 tabular-nums">{formatValue(log.current_value)}</td>
      <td className={`py-4 pr-4 tabular-nums font-medium ${changeTone}`}>
        {formatChange(change)}
      </td>
      <td className="py-4 pr-4">
        <ProgressTrendBadge metric={log.metric} changeValue={change} />
      </td>
      <td className="py-4 text-gray-400">{formatDateTime(log.updated_at)}</td>
      {showMember ? (
        <td className="py-4">
          {log.member_id ? (
            <Link
              href={`/progress/${log.member_id}`}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-medium text-cyan-200 transition hover:bg-cyan-500/20"
            >
              View Details
              <ArrowRight className="h-3 w-3" />
            </Link>
          ) : (
            "—"
          )}
        </td>
      ) : null}
    </tr>
  )
}

function ProgressLogCard({
  log,
  showMember,
}: {
  log: ProgressLogRow
  showMember: boolean
}) {
  const change = log.change_value
  const changeTone = changeToneClass(change)

  return (
    <li className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {showMember ? (
            <p className="truncate font-semibold text-white">
              {log.members?.full_name ?? "—"}
            </p>
          ) : null}
          <p className={`font-medium text-cyan-300 ${showMember ? "mt-0.5 text-sm" : "text-base"}`}>
            {formatMetricDisplay(log.metric)}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {formatDateTime(log.updated_at)}
          </p>
        </div>
        <ProgressTrendBadge metric={log.metric} changeValue={change} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="Start" value={formatValue(log.start_value)} />
        <Stat label="Current" value={formatValue(log.current_value)} highlight />
        <Stat label="Change" value={formatChange(change)} tone={changeTone} />
      </div>

      {showMember && log.member_id ? (
        <Link
          href={`/progress/${log.member_id}`}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20"
        >
          View Details
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </li>
  )
}

function Stat({
  label,
  value,
  highlight = false,
  tone,
}: {
  label: string
  value: string
  highlight?: boolean
  tone?: string
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0b1224] px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-gray-500">{label}</p>
      <p
        className={`mt-0.5 text-sm font-semibold tabular-nums ${tone ?? (highlight ? "text-cyan-400" : "text-white")}`}
      >
        {value}
      </p>
    </div>
  )
}

function changeToneClass(change: number | null | undefined) {
  if (change == null) return "text-gray-400"
  if (change > 0) return "text-emerald-400"
  if (change < 0) return "text-amber-300"
  return "text-gray-400"
}
