"use client"

import Link from "next/link"
import { CalendarCheck, ClipboardList } from "lucide-react"
import { COACH_DASHBOARD_CARD_PADDING } from "@/components/coach-dashboard/coach-dashboard-ui"
import EmptyState from "@/components/ui/empty-state"
import GlassCard from "@/components/ui/glass-card"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import type { RecentCheckIn } from "@/lib/coach-dashboard/types"

type RecentCheckInsWidgetProps = {
  checkIns: RecentCheckIn[]
}

function formatWeight(value: number | null): string {
  if (value == null || Number.isNaN(value)) return "—"
  return Number.isInteger(value) ? `${value} kg` : `${value.toFixed(1)} kg`
}

function formatScore(value: number | null): string {
  if (value == null || Number.isNaN(value)) return "—"
  return `${value}/10`
}

function formatCheckInDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function RecentCheckInsWidget({
  checkIns,
}: RecentCheckInsWidgetProps) {
  return (
    <GlassCard className={COACH_DASHBOARD_CARD_PADDING}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-violet-400/80">
            Wellness
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Recent Check-Ins
          </h2>
        </div>
        <Link
          href="/progress"
          className="text-sm font-medium text-cyan-400 transition hover:text-cyan-300"
        >
          View progress →
        </Link>
      </div>

      {checkIns.length === 0 ? (
        <EmptyState
          {...SAAS_EMPTY.checkIns}
          icon={<ClipboardList className="h-6 w-6" />}
          action={
            <Link href="/progress" className="btn-gradient">
              Add Check-in
            </Link>
          }
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Member</th>
                  <th className="pb-3 pr-4 font-medium">Weight</th>
                  <th className="pb-3 pr-4 font-medium">Energy</th>
                  <th className="pb-3 pr-4 font-medium">Sleep</th>
                  <th className="pb-3 pr-4 font-medium">Motivation</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {checkIns.map((checkIn) => (
                  <tr
                    key={checkIn.id}
                    className="group transition hover:bg-white/[0.03]"
                  >
                    <td className="py-3 pr-4">
                      <Link
                        href={`/members/${checkIn.memberId}`}
                        className="font-medium text-white group-hover:text-cyan-300"
                      >
                        {checkIn.memberName}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 tabular-nums text-slate-300">
                      {formatWeight(checkIn.weightKg)}
                    </td>
                    <td className="py-3 pr-4 tabular-nums text-slate-300">
                      {formatScore(checkIn.energy)}
                    </td>
                    <td className="py-3 pr-4 tabular-nums text-slate-300">
                      {formatScore(checkIn.sleep)}
                    </td>
                    <td className="py-3 pr-4 tabular-nums text-slate-300">
                      {formatScore(checkIn.motivation)}
                    </td>
                    <td className="py-3 text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarCheck
                          className="h-3.5 w-3.5 text-violet-400"
                          aria-hidden
                        />
                        {formatCheckInDate(checkIn.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 lg:hidden">
            {checkIns.map((checkIn) => (
              <li key={checkIn.id}>
                <Link
                  href={`/members/${checkIn.memberId}`}
                  className="glass-panel glass-panel-hover block rounded-xl px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-white">{checkIn.memberName}</p>
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                      <CalendarCheck
                        className="h-3.5 w-3.5 text-violet-400"
                        aria-hidden
                      />
                      {formatCheckInDate(checkIn.createdAt)}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                    <MetricPill label="Weight" value={formatWeight(checkIn.weightKg)} />
                    <MetricPill label="Energy" value={formatScore(checkIn.energy)} />
                    <MetricPill label="Sleep" value={formatScore(checkIn.sleep)} />
                    <MetricPill
                      label="Motivation"
                      value={formatScore(checkIn.motivation)}
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </GlassCard>
  )
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 font-medium tabular-nums text-white">{value}</p>
    </div>
  )
}
