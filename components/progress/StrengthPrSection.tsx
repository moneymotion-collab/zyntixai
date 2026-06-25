"use client"

import { Dumbbell, Trophy } from "lucide-react"
import Badge from "@/components/ui/badge"
import ProgressEmptyState from "@/components/progress/ProgressEmptyState"
import type { StrengthPrEntry } from "@/lib/progress/compute-strength-prs"
import { renderEmptyStateAction } from "@/lib/copy/empty-state-presets"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import { formatChange, formatDateTime, formatValue } from "@/lib/progress/fetch-progress-dashboard"

type StrengthPrSectionProps = {
  entries: StrengthPrEntry[]
}

export default function StrengthPrSection({ entries }: StrengthPrSectionProps) {
  return (
    <section className="mb-8">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-400">
          Strength & PR Tracking
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white">Personal records</h2>
        <p className="mt-1 text-sm text-gray-400">
          Highest strength values per member from live progress logs
        </p>
      </div>

      {entries.length === 0 ? (
        <ProgressEmptyState
          {...SAAS_EMPTY.strengthPr}
          icon={<Dumbbell className="h-5 w-5" />}
          action={renderEmptyStateAction("strengthPr")}
        />
      ) : (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {entries.map((entry) => (
              <PrCard key={entry.memberId} entry={entry} />
            ))}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-6 flex items-center gap-3">
              <Trophy className="h-5 w-5 text-amber-400" />
              <div>
                <h3 className="text-xl font-bold text-white">PR leaderboard</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Ranked by current personal record
                </p>
              </div>
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400">
                    <th className="pb-3 pr-4 font-medium">Rank</th>
                    <th className="pb-3 pr-4 font-medium">Member</th>
                    <th className="pb-3 pr-4 font-medium">Current PR</th>
                    <th className="pb-3 pr-4 font-medium">Improvement</th>
                    <th className="pb-3 font-medium">Last updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {entries.map((entry, index) => (
                    <LeaderboardRow
                      key={entry.memberId}
                      entry={entry}
                      rank={index + 1}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="space-y-3 md:hidden">
              {entries.map((entry, index) => (
                <li
                  key={entry.memberId}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-white">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-white">{entry.memberName}</p>
                        <p className="text-xs text-gray-500">{entry.metric}</p>
                      </div>
                    </div>
                    {entry.isNewPr ? (
                      <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase text-amber-200">
                        New PR
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/10 bg-[#0b1224] px-3 py-2">
                      <p className="text-[10px] uppercase text-gray-500">Current PR</p>
                      <p className="mt-0.5 text-lg font-bold tabular-nums text-cyan-400">
                        {formatValue(entry.currentPr)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[#0b1224] px-3 py-2">
                      <p className="text-[10px] uppercase text-gray-500">Improvement</p>
                      <p className="mt-0.5 text-lg font-semibold tabular-nums text-emerald-400">
                        {formatChange(entry.improvement)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-gray-500">
                    Updated {formatDateTime(entry.lastUpdated)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </section>
  )
}

function PrCard({ entry }: { entry: StrengthPrEntry }) {
  const improvementTone =
    entry.improvement == null
      ? "text-gray-400"
      : entry.improvement > 0
        ? "text-emerald-400"
        : entry.improvement < 0
          ? "text-amber-300"
          : "text-gray-400"

  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-purple-500/20 hover:bg-white/[0.06]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">{entry.memberName}</h3>
        </div>
        {entry.isNewPr ? (
          <span className="inline-flex items-center rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-200">
            New PR
          </span>
        ) : null}
      </div>

      <p className="mt-2 text-sm text-gray-400">{entry.metric}</p>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <StatBlock label="Start value" value={formatValue(entry.startValue)} />
        <StatBlock
          label="Current PR"
          value={formatValue(entry.currentPr)}
          highlight
        />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Improvement</p>
          <p className={`mt-1 text-lg font-semibold tabular-nums ${improvementTone}`}>
            {formatChange(entry.improvement)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-gray-500">Updated</p>
          <p className="mt-1 text-sm text-gray-400">
            {formatDateTime(entry.lastUpdated)}
          </p>
        </div>
      </div>
    </article>
  )
}

function StatBlock({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1224] px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p
        className={`mt-1 text-2xl font-bold tabular-nums ${highlight ? "text-cyan-400" : "text-white"}`}
      >
        {value}
      </p>
    </div>
  )
}

function LeaderboardRow({
  entry,
  rank,
}: {
  entry: StrengthPrEntry
  rank: number
}) {
  const improvementTone =
    entry.improvement == null
      ? "text-gray-400"
      : entry.improvement > 0
        ? "text-emerald-400"
        : entry.improvement < 0
          ? "text-amber-300"
          : "text-gray-400"

  return (
    <tr className="text-gray-200 transition-colors hover:bg-white/[0.03]">
      <td className="py-4 pr-4">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-white">
          {rank}
        </span>
      </td>
      <td className="py-4 pr-4">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white">{entry.memberName}</span>
          {entry.isNewPr ? (
            <Badge variant="default" className="border-amber-500/30 bg-amber-500/10 text-amber-200">
              New PR
            </Badge>
          ) : null}
        </div>
        <p className="mt-1 text-xs text-gray-500">{entry.metric}</p>
      </td>
      <td className="py-4 pr-4 tabular-nums font-semibold text-cyan-400">
        {formatValue(entry.currentPr)}
      </td>
      <td className={`py-4 pr-4 tabular-nums font-medium ${improvementTone}`}>
        {formatChange(entry.improvement)}
      </td>
      <td className="py-4 text-gray-400">{formatDateTime(entry.lastUpdated)}</td>
    </tr>
  )
}
