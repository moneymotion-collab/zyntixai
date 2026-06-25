"use client"

import { useCallback, useEffect, useState } from "react"
import { FileText, Loader2, Save } from "lucide-react"
import Toast, { type ToastPayload } from "@/app/components/Toast"
import { successToast } from "@/lib/copy/success-toasts"
import type { Database } from "@/lib/database.types"
import { createClient } from "@/lib/supabase/client"
import { premiumTextareaClass } from "@/lib/ui/premium-input"

type ClientProfile = Database["public"]["Tables"]["client_profiles"]["Row"]

type IntakeSummaryCardProps = {
  memberId: string
  refreshKey?: number
}

const textareaClassName = `${premiumTextareaClass} min-h-[200px] leading-relaxed`

export default function IntakeSummaryCard({
  memberId,
  refreshKey = 0,
}: IntakeSummaryCardProps) {
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [intakeSummary, setIntakeSummary] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastPayload | null>(null)

  const loadSummary = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)

    const { data, error } = await supabase
      .from("client_profiles")
      .select("intake_summary")
      .eq("member_id", memberId)
      .maybeSingle()

    if (error) {
      setErrorMessage(error.message)
      setLoading(false)
      return
    }

    const profile = data as Pick<ClientProfile, "intake_summary"> | null
    setIntakeSummary(profile?.intake_summary ?? "")
    setLoading(false)
  }, [memberId, supabase])

  useEffect(() => {
    void loadSummary()
  }, [loadSummary, refreshKey])

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
        intake_summary: intakeSummary || null,
      }),
    })

    const payload = (await response.json()) as
      | Partial<ClientProfile>
      | { error?: string }

    if (!response.ok) {
      setErrorMessage(
        "error" in payload && payload.error
          ? payload.error
          : "Could not save intake summary.",
      )
      setSaving(false)
      return
    }

    setToast(successToast("intakeSummarySaved"))
    setSaving(false)
  }

  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 via-white to-gray-50 px-6 py-5 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
                Onboarding
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-black">
                Intake Summary
              </h2>
              <p className="mt-1.5 max-w-xl text-sm text-gray-500">
                High-level overview from the client intake — goals, context, and
                key notes in one place.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm">
              <FileText className="h-3.5 w-3.5" aria-hidden />
              Coach view
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
            <div className="flex min-h-[200px] items-center justify-center gap-3 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              <span className="text-sm">Loading intake summary…</span>
            </div>
          ) : (
            <>
              <textarea
                value={intakeSummary}
                onChange={(event) => setIntakeSummary(event.target.value)}
                rows={8}
                placeholder="Summarize the client's intake…&#10;&#10;Examples:&#10;- Wants fat loss, training 4x/week&#10;- Previous knee injury, avoid deep squats&#10;- Prefers plant-based meals"
                className={textareaClassName}
              />

              <div className="flex justify-end border-t border-gray-100 pt-5">
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
                      Save summary
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
