"use client"

import Link from "next/link"
import { ArrowRight, Calendar, Mail, Target, TrendingUp, User } from "lucide-react"
import ProgressEmptyState from "@/components/progress/ProgressEmptyState"
import { renderEmptyStateAction } from "@/lib/copy/empty-state-presets"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import { formatDateTime } from "@/lib/progress/fetch-progress-dashboard"
import { formatProgressChartDate } from "@/lib/progress/progress-date"
import type { MemberOverviewRow } from "@/lib/progress/compute-member-progress-summary"

type MembersOverviewSectionProps = {
  rows: MemberOverviewRow[]
}

export default function MembersOverviewSection({
  rows,
}: MembersOverviewSectionProps) {
  return (
    <section className="mb-8">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-400">
          Members
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white">Member progress</h2>
        <p className="mt-1 text-sm text-gray-400">
          Select a member to view detailed progress, charts, and coaching insights
        </p>
      </div>

      {rows.length === 0 ? (
        <ProgressEmptyState
          {...SAAS_EMPTY.progressRoster}
          icon={<User className="h-5 w-5" />}
          action={renderEmptyStateAction("progressRoster")}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {rows.map((row) => (
            <MemberOverviewCard key={row.memberId} row={row} />
          ))}
        </div>
      )}
    </section>
  )
}

function MemberOverviewCard({ row }: { row: MemberOverviewRow }) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-cyan-500/30 hover:bg-white/[0.07]">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-cyan-500/5 blur-2xl transition group-hover:bg-cyan-500/10" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10">
            <User className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{row.memberName}</h3>
            {row.email ? (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-400">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                {row.email}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="relative mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatPill label="Logs" value={String(row.totalLogs)} />
        <StatPill label="Active goals" value={String(row.activeGoals)} />
        <StatPill
          label="Last update"
          value={
            row.latestUpdateDate
              ? formatProgressChartDate(row.latestUpdateDate)
              : "—"
          }
          icon={Calendar}
        />
      </div>

      {row.bestMetricLabel ? (
        <p className="relative mt-4 flex items-center gap-2 text-sm text-gray-400">
          <TrendingUp className="h-4 w-4 shrink-0 text-emerald-400" />
          Best: {row.bestMetricLabel}
        </p>
      ) : null}

      <div className="relative mt-5 flex items-center justify-between border-t border-white/10 pt-5">
        <p className="text-xs text-gray-500">
          {row.latestUpdateDate
            ? `Updated ${formatDateTime(row.latestUpdateDate)}`
            : SAAS_EMPTY.progress.title}
        </p>
        <Link
          href={`/progress/${row.memberId}`}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-500/10 px-4 py-2.5 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20"
        >
          View Details
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  )
}

function StatPill({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon?: typeof Target
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1224] px-3 py-2.5">
      <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-gray-500">
        {Icon ? <Icon className="h-3 w-3" /> : null}
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  )
}
