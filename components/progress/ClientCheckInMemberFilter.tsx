"use client"

import { Filter, Users } from "lucide-react"
import {
  PROGRESS_PRO_CARD,
  PROGRESS_PRO_CARD_INNER,
} from "@/components/progress/progress-pro-ui"
import { premiumSelectClass } from "@/lib/ui/premium-input"

type MemberOption = {
  id: string
  full_name: string | null
}

type ClientCheckInMemberFilterProps = {
  memberFilter: string
  onMemberFilterChange: (value: string) => void
  members: MemberOption[]
  showDashboardHeader?: boolean
}

export default function ClientCheckInMemberFilter({
  memberFilter,
  onMemberFilterChange,
  members,
  showDashboardHeader = false,
}: ClientCheckInMemberFilterProps) {
  const selectedLabel =
    memberFilter === "all"
      ? "All members"
      : (members.find((m) => m.id === memberFilter)?.full_name ?? "Member")

  return (
    <section className={`${PROGRESS_PRO_CARD} p-6 sm:p-8`}>
      {showDashboardHeader ? (
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-cyan-400">
              Progress Dashboard Pro
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              Client progress & check-ins
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">
              Premium insights, trends, goals, alerts, and AI coaching — all
              filtered by member.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-medium uppercase tracking-wider text-cyan-200">
            <Filter className="h-4 w-4" aria-hidden />
            Coach view
          </span>
        </div>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-violet-400">
            Member filter
          </p>
          <h3 className="mt-2 text-lg font-bold text-white sm:text-xl">
            View by member
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            Currently showing data for{" "}
            <span className="font-medium text-gray-200">{selectedLabel}</span>
          </p>
        </div>
        <Users className="hidden h-5 w-5 shrink-0 text-cyan-400/70 sm:block" aria-hidden />
      </div>

      <label className="mt-5 block w-full max-w-md">
        <span className="mb-2 block text-sm font-medium text-gray-400">
          Select member
        </span>
        <select
          value={memberFilter}
          onChange={(event) => onMemberFilterChange(event.target.value)}
          className={premiumSelectClass}
        >
          <option value="all" className="bg-[#0b1224]">
            All members
          </option>
          {members.map((member) => (
            <option key={member.id} value={member.id} className="bg-[#0b1224]">
              {member.full_name ?? "Unnamed member"}
            </option>
          ))}
        </select>
      </label>
    </section>
  )
}
