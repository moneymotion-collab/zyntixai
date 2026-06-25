"use client"

import { useCallback, useEffect, useState } from "react"
import { ClipboardList, Clock, Loader2, Save } from "lucide-react"
import Toast, { type ToastPayload } from "@/app/components/Toast"
import { successToast } from "@/lib/copy/success-toasts"
import type { Database } from "@/lib/database.types"
import { createClient } from "@/lib/supabase/client"
import { premiumTextareaClass } from "@/lib/ui/premium-input"

type ClientProfile = Database["public"]["Tables"]["client_profiles"]["Row"]

type CoachNotesCardProps = {
  memberId: string
  refreshKey?: number
}

const textareaClassName = `${premiumTextareaClass} min-h-[280px] leading-relaxed`

function formatLastUpdated(value: Date): string {
  return value.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function readTimestamp(profile: Partial<ClientProfile> | null): Date | null {
  if (!profile) return null

  const raw = profile.updated_at ?? profile.created_at
  if (!raw) return null

  const parsed = new Date(raw)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export default function CoachNotesCard({
  memberId,
  refreshKey = 0,
}: CoachNotesCardProps) {
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [coachNotes, setCoachNotes] = useState("")
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastPayload | null>(null)

  const loadNotes = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)

    const { data, error } = await supabase
      .from("client_profiles")
      .select("coach_notes, updated_at, created_at")
      .eq("member_id", memberId)
      .maybeSingle()

    if (error) {
      const fallback = await supabase
        .from("client_profiles")
        .select("coach_notes")
        .eq("member_id", memberId)
        .maybeSingle()

      if (fallback.error) {
        setErrorMessage(fallback.error.message)
        setLoading(false)
        return
      }

      setCoachNotes(fallback.data?.coach_notes ?? "")
      setLoading(false)
      return
    }

    const profile = data as Pick<
      ClientProfile,
      "coach_notes" | "updated_at" | "created_at"
    > | null

    setCoachNotes(profile?.coach_notes ?? "")
    setLastUpdatedAt(readTimestamp(profile))
    setLoading(false)
  }, [memberId, supabase])

  useEffect(() => {
    void loadNotes()
  }, [loadNotes, refreshKey])

  async function handleSave() {
    if (!memberId) {
      setErrorMessage("Member ID is missing.")
      return
    }

    setSaving(true)
    setErrorMessage(null)

    const response = await fetch("/api/client-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        member_id: memberId,
        coach_notes: coachNotes || null,
      }),
    })

    const payload = (await response.json()) as
      | Partial<ClientProfile>
      | { error?: string }

    if (!response.ok) {
      setErrorMessage(
        "error" in payload && payload.error
          ? payload.error
          : "Could not save coach notes.",
      )
      setSaving(false)
      return
    }

    const savedAt = readTimestamp(payload as Partial<ClientProfile>) ?? new Date()
    setLastUpdatedAt(savedAt)
    setToast(successToast("coachNotesSaved"))
    setSaving(false)
  }

  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 via-white to-gray-50 px-6 py-5 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
                Private notes
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-black">
                Coach Notes
              </h2>
              <p className="mt-1.5 max-w-xl text-sm text-gray-500">
                Session preferences, communication style, and coaching reminders
                for this member.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm">
              <ClipboardList className="h-3.5 w-3.5" aria-hidden />
              Coach only
            </span>
          </div>
        </div>

        <div className="space-y-5 p-6 sm:p-8">
          {errorMessage ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </p>
          ) : null}

          {loading ? (
            <div className="flex min-h-[280px] items-center justify-center gap-3 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              <span className="text-sm">Loading coach notes…</span>
            </div>
          ) : (
            <>
              <textarea
                value={coachNotes}
                onChange={(event) => setCoachNotes(event.target.value)}
                placeholder="Add private coaching notes…&#10;&#10;Examples:&#10;- Prefers morning sessions&#10;- Avoid high-impact movements on left knee&#10;- Responds well to short check-in messages"
                className={textareaClassName}
              />

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-5">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4 text-gray-400" aria-hidden />
                  {lastUpdatedAt ? (
                    <span>
                      Last updated{" "}
                      <span className="font-medium text-gray-700">
                        {formatLastUpdated(lastUpdatedAt)}
                      </span>
                    </span>
                  ) : (
                    <span>Not saved yet</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" aria-hidden />
                      Save notes
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {toast ? (
        <Toast
          title={toast.title}
          description={toast.description}
          variant={toast.variant ?? "success"}
          onDismiss={() => setToast(null)}
        />
      ) : null}
    </>
  )
}
