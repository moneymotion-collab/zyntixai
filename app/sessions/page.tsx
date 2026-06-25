"use client"

import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, Plus } from "lucide-react"
import ProtectedShell from "../components/ProtectedShell"
import Toast, { type ToastPayload } from "../components/Toast"
import { successToast } from "@/lib/copy/success-toasts"
import { getCoachMemberIds, getCoachScope } from "@/lib/auth/coach-scope"
import type { Database } from "@/lib/database.types"
import { notifyCoachingCoreChanged } from "@/lib/coaching-core/notify"
import { useCoachingCoreChanged } from "@/app/hooks/useCoachingCoreChanged"
import { reportSupabaseError } from "@/lib/errors/reportSupabaseError"
import { createClient } from "@/lib/supabase/client"
import SaasEmptyState from "@/components/ui/saas-empty-state"
import SaasPageHeader from "@/components/ui/saas-page-header"
import { SessionsPageSkeleton } from "@/components/ui/page-skeletons"
import {
  SAAS_BTN_PRIMARY,
  SAAS_PAGE_CARD,
  SAAS_PAGE_GRID,
  SAAS_PAGE_MAIN,
} from "@/lib/ui/saas-page-layout"
import { premiumInputClass, premiumSelectClass } from "@/lib/ui/premium-input"

type Member = Database["public"]["Tables"]["members"]["Row"]
type Session = Database["public"]["Tables"]["sessions"]["Row"] & {
  members: Pick<Member, "full_name"> | null
}

const SESSION_STATUSES = ["gepland", "voltooid", "geannuleerd"] as const

const SESSION_STATUS_LABELS: Record<(typeof SESSION_STATUSES)[number], string> = {
  gepland: "Scheduled",
  voltooid: "Completed",
  geannuleerd: "Cancelled",
}

function todayDateString() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function nowTimeString() {
  const now = new Date()
  const h = String(now.getHours()).padStart(2, "0")
  const min = String(now.getMinutes()).padStart(2, "0")
  return `${h}:${min}`
}

const statusStyles: Record<string, string> = {
  gepland: "bg-blue-500/20 text-blue-300",
  voltooid: "bg-green-500/20 text-green-400",
  geannuleerd: "bg-red-500/20 text-red-300",
  Confirmed: "bg-blue-500/20 text-blue-300",
  Completed: "bg-green-500/20 text-green-400",
  Pending: "bg-yellow-500/20 text-yellow-400",
}

export default function SessionsPage() {
  return (
    <Suspense
      fallback={
        <ProtectedShell allowed={["admin", "coach"]}>
          <main className="flex-1 overflow-y-auto bg-[#070b14] p-4 text-white sm:p-6 lg:p-8">
            <SessionsPageSkeleton />
          </main>
        </ProtectedShell>
      }
    >
      <SessionsPageContent />
    </Suspense>
  )
}

function SessionsPageContent() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const highlightSessionId = searchParams.get("session")
  const hasScrolledToSessionRef = useRef(false)

  const [sessions, setSessions] = useState<Session[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [coachName, setCoachName] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastPayload | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [memberId, setMemberId] = useState("")
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")
  const [sessionType, setSessionType] = useState("Personal Training")
  const [status, setStatus] = useState<(typeof SESSION_STATUSES)[number]>("gepland")
  const [duration, setDuration] = useState("60")

  const fetchData = useCallback(async () => {
    setErrorMessage(null)
    const scope = await getCoachScope(supabase)

    const { data: userData } = await supabase.auth.getUser()
    if (userData.user?.email) {
      const localPart = userData.user.email.split("@")[0] ?? "Coach"
      setCoachName(localPart.replace(/\./g, " "))
    }

    let membersQuery = supabase
      .from("members")
      .select("*")
      .order("full_name", { ascending: true })

    if (scope.isCoach && scope.userId) {
      membersQuery = membersQuery.eq("coach_id", scope.userId)
    }

    const { data: membersData, error: membersError } = await membersQuery
    if (membersError) {
      setErrorMessage(membersError.message)
      setMembers([])
    } else {
      setMembers(membersData ?? [])
    }

    let sessionsQuery = supabase
      .from("sessions")
      .select(`*, members ( full_name )`)
      .order("scheduled_at", { ascending: false })

    if (scope.isCoach && scope.userId) {
      const memberIds = await getCoachMemberIds(supabase, scope.userId)
      if (memberIds.length === 0) {
        setSessions([])
        return
      }
      sessionsQuery = sessionsQuery.in("member_id", memberIds)
    }

    const { data, error } = await sessionsQuery

    if (error) {
      setErrorMessage(error.message)
      setSessions([])
    } else {
      setSessions((data as Session[]) ?? [])
    }
  }, [supabase])

  useEffect(() => {
    fetchData().finally(() => setLoading(false))
  }, [fetchData])

  useCoachingCoreChanged(() => {
    void fetchData()
  })

  useEffect(() => {
    if (members.length === 0) return
    const stillValid = members.some((m) => m.id === memberId)
    if (!memberId || !stillValid) {
      setMemberId(members[0].id)
    }
  }, [members, memberId])

  useEffect(() => {
    if (members.length === 0) return

    const memberParam = searchParams.get("member")
    if (memberParam && members.some((member) => member.id === memberParam)) {
      setMemberId(memberParam)
    }

    if (searchParams.get("new") === "1") {
      setShowForm(true)
      setScheduledDate((current) => current || todayDateString())
      setScheduledTime((current) => current || nowTimeString())
      setErrorMessage(null)
    }
  }, [members, searchParams])

  useEffect(() => {
    if (!highlightSessionId || loading || hasScrolledToSessionRef.current) return

    const element = document.getElementById(`session-${highlightSessionId}`)
    if (!element) return

    hasScrolledToSessionRef.current = true
    window.requestAnimationFrame(() => {
      element.scrollIntoView({ behavior: "smooth", block: "center" })
    })
  }, [highlightSessionId, loading, sessions])

  const createSession = async () => {
    if (members.length === 0) {
      setErrorMessage("Add a member on the Members page before scheduling a session.")
      return
    }
    const resolvedMemberId = memberId || members[0]?.id
    if (!resolvedMemberId || !scheduledDate || !scheduledTime) {
      setErrorMessage("Enter date, time, and member.")
      return
    }

    setSaving(true)
    setErrorMessage(null)

    const scheduledAt = new Date(
      `${scheduledDate}T${scheduledTime}:00`,
    ).toISOString()

    const { error } = await supabase.from("sessions").insert({
      member_id: resolvedMemberId,
      coach: coachName,
      session_type: sessionType,
      scheduled_at: scheduledAt,
      duration: Number(duration) || 60,
      status,
    })

    setSaving(false)

    if (error) {
      reportSupabaseError("[sessions] create session failed", error, {
        setError: setErrorMessage,
        setToast,
      })
      return
    }

    setToast(successToast("sessionScheduled"))
    setShowForm(false)
    setScheduledDate("")
    setScheduledTime("")
    await fetchData()
    notifyCoachingCoreChanged()
  }

  const updateStatus = async (sessionId: string, newStatus: string) => {
    const { error } = await supabase
      .from("sessions")
      .update({ status: newStatus })
      .eq("id", sessionId)

    if (error) {
      reportSupabaseError("[sessions] update status failed", error, {
        setError: setErrorMessage,
      })
      return
    }

    await fetchData()
    notifyCoachingCoreChanged()
  }

  return (
    <ProtectedShell allowed={["admin", "coach"]}>
      <main className={SAAS_PAGE_MAIN}>
        <SaasPageHeader
          eyebrow="FitCore AI"
          title="Sessions"
          description="Schedule and manage coaching sessions with your members."
          action={
            <button
              type="button"
              onClick={() => {
                if (showForm) {
                  setShowForm(false)
                  return
                }
                setScheduledDate((d) => d || todayDateString())
                setScheduledTime((t) => t || nowTimeString())
                if (members.length > 0) {
                  setMemberId((id) =>
                    members.some((m) => m.id === id) ? id : members[0].id,
                  )
                }
                setErrorMessage(null)
                setShowForm(true)
              }}
              className={SAAS_BTN_PRIMARY}
            >
              <Plus className="h-4 w-4" />
              New session
            </button>
          }
        />

        {errorMessage ? (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </div>
        ) : null}

        {showForm ? (
          <section className={`${SAAS_PAGE_CARD} mb-8`}>
            <h2 className="mb-4 text-lg font-bold">New session</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void createSession()
              }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs text-gray-500">Member</span>
                <select
                  value={
                    members.length === 0
                      ? ""
                      : members.some((m) => m.id === memberId)
                        ? memberId
                        : members[0].id
                  }
                  onChange={(e) => setMemberId(e.target.value)}
                  disabled={members.length === 0}
                  className={premiumSelectClass}
                >
                  {members.length === 0 ? (
                    <option value="">Add a member first to schedule sessions</option>
                  ) : (
                    members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name ?? m.email ?? "Member"}
                      </option>
                    ))
                  )}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-gray-500">Date</span>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className={premiumInputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-gray-500">Time</span>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className={premiumInputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-gray-500">Coach</span>
                <input
                  value={coachName}
                  onChange={(e) => setCoachName(e.target.value)}
                  className={premiumInputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-gray-500">Type</span>
                <input
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value)}
                  className={premiumInputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-gray-500">Status</span>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as (typeof SESSION_STATUSES)[number])
                  }
                  className={premiumSelectClass}
                >
                  {SESSION_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {SESSION_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-gray-500">
                  Duration (min)
                </span>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className={premiumInputClass}
                />
              </label>
              <button
                type="submit"
                disabled={saving}
                className={`${SAAS_BTN_PRIMARY} mt-4 sm:col-span-2`}
              >
                Save session
              </button>
            </form>
          </section>
        ) : null}

        {loading ? (
          <SessionsPageSkeleton />
        ) : sessions.length === 0 ? (
          <SaasEmptyState
            preset="sessions"
            action={
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="btn-gradient inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Schedule your first session
              </button>
            }
          />
        ) : (
          <div className={SAAS_PAGE_GRID}>
            {sessions.map((session) => {
              const isHighlighted = highlightSessionId === session.id

              return (
              <article
                key={session.id}
                id={`session-${session.id}`}
                className={`${SAAS_PAGE_CARD} transition ${
                  isHighlighted
                    ? "ring-2 ring-cyan-400/60 ring-offset-2 ring-offset-[#070b14]"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {session.session_type ?? "Session"}
                    </h2>
                    <p className="mt-1 text-sm text-gray-400">
                      {session.members?.full_name ?? "—"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Coach: {session.coach ?? "—"}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-xl px-2 py-1 text-xs capitalize ${
                      statusStyles[session.status ?? ""] ??
                      "bg-white/10 text-gray-300"
                    }`}
                  >
                    {SESSION_STATUS_LABELS[
                      session.status as (typeof SESSION_STATUSES)[number]
                    ] ?? session.status}
                  </span>
                </div>
                <p className="mt-4 text-sm text-gray-300">
                  {session.scheduled_at
                    ? new Date(session.scheduled_at).toLocaleString("nl-NL")
                    : "—"}
                  {session.duration ? ` · ${session.duration} min` : ""}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {SESSION_STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void updateStatus(session.id, s)}
                      className="rounded-xl border border-white/10 px-2 py-1 text-[10px] text-gray-400 hover:bg-white/5"
                    >
                      {SESSION_STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </article>
              )
            })}
          </div>
        )}
      </main>

      {toast ? (
        <Toast
          title={toast.title}
          description={toast.description}
          variant={toast.variant ?? "success"}
          onDismiss={() => setToast(null)}
        />
      ) : null}
    </ProtectedShell>
  )
}
