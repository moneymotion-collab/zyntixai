"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Trash2, UserRound } from "lucide-react"
import ConfirmDialog from "../components/ConfirmDialog"
import ProtectedShell from "../components/ProtectedShell"
import Toast, { type ToastPayload } from "../components/Toast"
import { successToast } from "@/lib/copy/success-toasts"
import { getCoachScope } from "@/lib/auth/coach-scope"
import {
  fetchMembersWithPlans,
  getMemberStatus,
  type MemberWithPlans,
} from "@/lib/member-status"
import { isMemberAccountLinked, normalizeMemberEmail } from "@/lib/member-link"
import { notifyCoachingCoreChanged } from "@/lib/coaching-core/notify"
import { useCoachingCoreChanged } from "@/app/hooks/useCoachingCoreChanged"
import { reportSupabaseError } from "@/lib/errors/reportSupabaseError"
import { createClient } from "@/lib/supabase/client"
import Badge from "@/components/ui/badge"
import ErrorStateBanner from "@/components/ui/error-state-banner"
import SaasEmptyState from "@/components/ui/saas-empty-state"
import SaasPageHeader from "@/components/ui/saas-page-header"
import SaasSectionHeader from "@/components/ui/saas-section-header"
import { MembersListSkeleton } from "@/components/ui/page-skeletons"
import {
  SAAS_BTN_DESTRUCTIVE,
  SAAS_BTN_PRIMARY,
  SAAS_PAGE_CARD,
  SAAS_PAGE_LIST_CARD,
  SAAS_PAGE_MAIN,
  SAAS_PAGE_SECTION_GAP,
} from "@/lib/ui/saas-page-layout"

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white shadow-sm outline-none transition placeholder:text-zinc-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
const labelClass = "mb-2 block text-sm font-medium text-zinc-300"

function memberProfileHref(memberId: string) {
  return `/members/${memberId}`
}

function MemberWorkoutsDisplay({ count }: { count: number }) {
  if (count === 0) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-zinc-400">No active workout</span>
        <Badge status="pending">Needs assignment</Badge>
      </div>
    )
  }

  return (
    <span className="inline-flex rounded-xl bg-cyan-500/15 px-2.5 py-1 text-xs font-medium text-cyan-300">
      {count === 1 ? "1 assigned" : `${count} assigned`}
    </span>
  )
}

function MemberLinkStatus({ member }: { member: MemberWithPlans }) {
  return (
    <p
      className={`text-xs font-medium ${
        isMemberAccountLinked(member) ? "text-emerald-400" : "text-amber-400"
      }`}
    >
      {isMemberAccountLinked(member)
        ? "Account linked"
        : "Not linked — member must sign up with this exact email"}
    </p>
  )
}

function MemberStatusBadge({ status }: { status: ReturnType<typeof getMemberStatus> }) {
  if (status === "OK") {
    return <Badge status="active">Active</Badge>
  }

  return <Badge status="pending">Needs attention</Badge>
}

function ViewProfileHint({ className = "" }: { className?: string }) {
  return (
    <span
      className={`text-sm font-medium text-cyan-400/60 transition group-hover:text-cyan-400 ${className}`.trim()}
    >
      View profile →
    </span>
  )
}

function openMemberProfile(
  router: ReturnType<typeof useRouter>,
  memberId: string,
) {
  router.push(memberProfileHref(memberId))
}

function MemberCard({
  member,
  onDelete,
}: {
  member: MemberWithPlans
  onDelete: (member: MemberWithPlans) => void
}) {
  const router = useRouter()
  const status = getMemberStatus(member)

  return (
    <article
      className={`group overflow-hidden ${SAAS_PAGE_LIST_CARD} transition hover:border-white/20 hover:bg-white/[0.07]`}
    >
      <div
        role="link"
        tabIndex={0}
        onClick={() => openMemberProfile(router, member.id)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            openMemberProfile(router, member.id)
          }
        }}
        className="block cursor-pointer p-6 transition hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40"
        aria-label={`View profile for ${member.full_name}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-cyan-400">
              <UserRound className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-xl font-bold text-white">{member.full_name}</h3>
              <p className="mt-1 text-sm text-zinc-400">{member.email}</p>
            </div>
          </div>
          <MemberStatusBadge status={status} />
        </div>

        <div className="mt-3">
          <MemberLinkStatus member={member} />
        </div>

        <div className="mt-3">
          <MemberWorkoutsDisplay count={member.workout_assignments.length} />
        </div>

        <div className="mt-4">
          <ViewProfileHint />
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-4">
        <button
          type="button"
          onClick={() => onDelete(member)}
          className={SAAS_BTN_DESTRUCTIVE}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>
    </article>
  )
}

function MembersTable({
  members,
  onDelete,
}: {
  members: MemberWithPlans[]
  onDelete: (member: MemberWithPlans) => void
}) {
  const router = useRouter()

  return (
    <div className={`hidden overflow-hidden ${SAAS_PAGE_LIST_CARD} md:block`}>
      <table className="w-full text-left text-sm">
        <thead className="border-b border-white/10 bg-white/[0.03] text-zinc-400">
          <tr>
            <th className="px-6 py-4 font-medium">Member</th>
            <th className="px-6 py-4 font-medium">Email</th>
            <th className="px-6 py-4 font-medium">Workouts</th>
            <th className="px-6 py-4 font-medium">Status</th>
            <th className="px-6 py-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => {
            const status = getMemberStatus(member)

            return (
              <tr
                key={member.id}
                role="link"
                tabIndex={0}
                onClick={() => openMemberProfile(router, member.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    openMemberProfile(router, member.id)
                  }
                }}
                className="group cursor-pointer border-b border-white/5 transition last:border-b-0 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-500/40"
                aria-label={`View profile for ${member.full_name}`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-cyan-400">
                      <UserRound className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-white transition group-hover:text-cyan-400">
                        {member.full_name}
                      </p>
                      <ViewProfileHint className="mt-1 block text-xs" />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-zinc-400">{member.email}</td>
                <td className="px-6 py-4">
                  <MemberWorkoutsDisplay
                    count={member.workout_assignments.length}
                  />
                </td>
                <td className="px-6 py-4">
                  <MemberStatusBadge status={status} />
                </td>
                <td
                  className="px-6 py-4"
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => onDelete(member)}
                    className={SAAS_BTN_DESTRUCTIVE}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function MemberCardGrid({
  members,
  onDelete,
}: {
  members: MemberWithPlans[]
  onDelete: (member: MemberWithPlans) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:hidden">
      {members.map((member) => (
        <MemberCard key={member.id} member={member} onDelete={onDelete} />
      ))}
    </div>
  )
}

export default function MembersPage() {
  const supabase = createClient()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [members, setMembers] = useState<MemberWithPlans[]>([])
  const [loading, setLoading] = useState(true)
  const [addingMember, setAddingMember] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<MemberWithPlans | null>(
    null,
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastPayload | null>(null)

  const fetchMembers = useCallback(async () => {
    setErrorMessage(null)

    const { data, error } = await fetchMembersWithPlans(supabase)

    if (error) {
      console.error(error.message)
      setErrorMessage(error.message)
      setMembers([])
      return
    }

    setMembers(data)
  }, [supabase])

  const needsAttention = useMemo(
    () => members.filter((m) => getMemberStatus(m) === "NEEDS_ATTENTION"),
    [members],
  )
  const ok = useMemo(
    () => members.filter((m) => getMemberStatus(m) === "OK"),
    [members],
  )

  useEffect(() => {
    fetchMembers().finally(() => setLoading(false))
  }, [fetchMembers])

  useCoachingCoreChanged(() => {
    void fetchMembers()
  })

  const addMember = async () => {
    if (!fullName || !email) {
      setErrorMessage("Fill in all fields.")
      return
    }

    setErrorMessage(null)
    setAddingMember(true)

    const scope = await getCoachScope(supabase)

    const normalizedEmail = normalizeMemberEmail(email)

    const { error } = await supabase.from("members").insert([
      {
        full_name: fullName.trim(),
        email: normalizedEmail,
        coach_id: scope.isCoach ? scope.userId : null,
      },
    ])

    if (error) {
      reportSupabaseError("[members] add member failed", error, {
        setError: setErrorMessage,
      })
      setAddingMember(false)
      return
    }

    setToast(successToast("memberAdded"))

    setFullName("")
    setEmail("")

    await fetchMembers()
    notifyCoachingCoreChanged()
    setAddingMember(false)
  }

  async function confirmDeleteMember() {
    if (!memberToDelete) return

    setDeleting(true)
    setErrorMessage(null)

    const scope = await getCoachScope(supabase)

    let query = supabase.from("members").delete().eq("id", memberToDelete.id)

    if (scope.isCoach && scope.userId) {
      query = query.eq("coach_id", scope.userId)
    }

    const { error } = await query

    if (error) {
      reportSupabaseError("[members] delete member failed", error, {
        setError: setErrorMessage,
      })
      setDeleting(false)
      return
    }

    setMemberToDelete(null)
    setDeleting(false)
    setToast(
      successToast("memberDeleted", {
        description: `${memberToDelete.full_name} has been removed from your roster.`,
      }),
    )
    await fetchMembers()
    notifyCoachingCoreChanged()
  }

  return (
    <ProtectedShell allowed={["admin", "coach"]}>
      <main className={SAAS_PAGE_MAIN}>
        <SaasPageHeader
          eyebrow="FitCore AI"
          title="Members"
          description="Manage your gym members."
          className="mb-8"
        />
        <div data-tour="members-management" className="sr-only" aria-hidden />

        {errorMessage ? (
          <ErrorStateBanner
            title="Could not load members"
            message={errorMessage}
            onRetry={() => void fetchMembers()}
            embedded
            className="mb-4"
          />
        ) : null}

        <div className={`${SAAS_PAGE_CARD} mb-8`}>
          <SaasSectionHeader
            title="Assign workouts"
            description={
              <>
                Use the Workouts page: click{" "}
                <strong className="font-semibold text-slate-200">
                  Assign Workout
                </strong>{" "}
                on a workout card and choose a member.
              </>
            }
          />
          <Link href="/workouts" className={SAAS_BTN_PRIMARY}>
            Go to Workouts
          </Link>
        </div>

        <div id="add-member" className={`${SAAS_PAGE_CARD} mb-8`}>
          <SaasSectionHeader title="Add member" className="mb-6" />

          <div className="grid gap-4">
            <div>
              <label htmlFor="member-full-name" className={labelClass}>
                Full name
              </label>
              <input
                id="member-full-name"
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="member-email" className={labelClass}>
                Email address
              </label>
              <input
                id="member-email"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClass}
              />
            </div>

            <button
              type="button"
              onClick={addMember}
              disabled={addingMember}
              className="btn-gradient w-full py-3 disabled:opacity-50"
            >
              {addingMember ? "Adding member…" : "Add member"}
            </button>
          </div>
        </div>

        {loading ? (
          <MembersListSkeleton />
        ) : needsAttention.length + ok.length === 0 ? (
          <SaasEmptyState preset="members" />
        ) : (
          <div className={SAAS_PAGE_SECTION_GAP}>
            <section>
              <SaasSectionHeader
                title={`Needs attention (${needsAttention.length})`}
              />
              {needsAttention.length === 0 ? (
                <SaasEmptyState
                  preset="membersNeedsAttention"
                  compact
                  showAction={false}
                />
              ) : (
                <>
                  <MembersTable
                    members={needsAttention}
                    onDelete={setMemberToDelete}
                  />
                  <MemberCardGrid
                    members={needsAttention}
                    onDelete={setMemberToDelete}
                  />
                </>
              )}
            </section>

            <section>
              <SaasSectionHeader title={`Active (${ok.length})`} />
              {ok.length === 0 ? (
                <SaasEmptyState preset="membersActive" />
              ) : (
                <>
                  <MembersTable members={ok} onDelete={setMemberToDelete} />
                  <MemberCardGrid members={ok} onDelete={setMemberToDelete} />
                </>
              )}
            </section>
          </div>
        )}

        <ConfirmDialog
          open={memberToDelete !== null}
          title="Delete member?"
          message={
            memberToDelete
              ? `Are you sure you want to delete ${memberToDelete.full_name}? This cannot be undone.`
              : ""
          }
          confirmLabel="Delete"
          cancelLabel="Cancel"
          loading={deleting}
          onCancel={() => {
            if (!deleting) setMemberToDelete(null)
          }}
          onConfirm={() => void confirmDeleteMember()}
        />

        {toast ? (
          <Toast
            title={toast.title}
            description={toast.description}
            variant={toast.variant ?? "success"}
            onDismiss={() => setToast(null)}
          />
        ) : null}
      </main>
    </ProtectedShell>
  )
}
