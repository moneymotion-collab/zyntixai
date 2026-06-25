"use client"

import { Search, User } from "lucide-react"
import EmptyState from "@/components/ui/empty-state"
import GlassCard from "@/components/ui/glass-card"
import { renderEmptyStateAction } from "@/lib/copy/empty-state-presets"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import type { WorkspaceMemberProfile } from "@/lib/coach-workspace/types"

type MemberSearchPanelProps = {
  members: WorkspaceMemberProfile[]
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedMemberId: string | null
  onSelectMember: (memberId: string) => void
}

export default function MemberSearchPanel({
  members,
  searchQuery,
  onSearchChange,
  selectedMemberId,
  onSelectMember,
}: MemberSearchPanelProps) {
  const query = searchQuery.trim().toLowerCase()
  const filtered = query
    ? members.filter(
        (member) =>
          member.fullName.toLowerCase().includes(query) ||
          member.email.toLowerCase().includes(query),
      )
    : members

  const attentionMembers = filtered.filter((m) => m.needsAttention)
  const otherMembers = filtered.filter((m) => !m.needsAttention)

  return (
    <GlassCard className="flex h-full flex-col p-5 sm:p-6">
      <div className="mb-4">
        <p className="text-xs font-medium uppercase tracking-wider text-cyan-400/80">
          Roster
        </p>
        <h2 className="mt-1 text-lg font-semibold text-white">Member Search</h2>
      </div>

      <div className="relative mb-4">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          aria-hidden
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name or email…"
          className="premium-input w-full pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          {...(query ? SAAS_EMPTY.memberSearch : SAAS_EMPTY.members)}
          icon={<User className="h-6 w-6" />}
          action={
            query ? (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="btn-gradient"
              >
                Clear search
              </button>
            ) : (
              renderEmptyStateAction("members")
            )
          }
        />
      ) : (
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
          {attentionMembers.length > 0 ? (
            <MemberGroup
              label={`Needs attention (${attentionMembers.length})`}
              members={attentionMembers}
              selectedMemberId={selectedMemberId}
              onSelectMember={onSelectMember}
              highlight
            />
          ) : null}
          {otherMembers.length > 0 ? (
            <MemberGroup
              label={`All members (${otherMembers.length})`}
              members={otherMembers}
              selectedMemberId={selectedMemberId}
              onSelectMember={onSelectMember}
            />
          ) : null}
        </div>
      )}
    </GlassCard>
  )
}

function MemberGroup({
  label,
  members,
  selectedMemberId,
  onSelectMember,
  highlight = false,
}: {
  label: string
  members: WorkspaceMemberProfile[]
  selectedMemberId: string | null
  onSelectMember: (memberId: string) => void
  highlight?: boolean
}) {
  return (
    <div>
      <p
        className={`mb-2 text-xs font-medium uppercase tracking-wider ${
          highlight ? "text-amber-400/80" : "text-slate-500"
        }`}
      >
        {label}
      </p>
      <ul className="space-y-2">
        {members.map((member) => {
          const selected = member.id === selectedMemberId
          return (
            <li key={member.id}>
              <button
                type="button"
                onClick={() => onSelectMember(member.id)}
                className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${
                  selected
                    ? "border-indigo-400/40 bg-indigo-500/10"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                }`}
              >
                <p className="truncate font-medium text-white">
                  {member.fullName}
                </p>
                <p className="truncate text-xs text-slate-400">{member.email}</p>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
