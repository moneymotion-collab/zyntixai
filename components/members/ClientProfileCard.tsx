"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Save } from "lucide-react"
import Toast, { type ToastPayload } from "@/app/components/Toast"
import { successToast } from "@/lib/copy/success-toasts"
import type { Database } from "@/lib/database.types"
import { createClient } from "@/lib/supabase/client"
import {
  premiumInputClass,
  premiumTextareaClass,
} from "@/lib/ui/premium-input"

type Member = Database["public"]["Tables"]["members"]["Row"]

type ClientProfileCardProps = {
  memberId: string
  onSaved?: () => void
}

const inputClassName = premiumInputClass
const textareaClassName = premiumTextareaClass
const labelClassName = "mb-2 block text-sm font-medium text-gray-700"

function numberToInput(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) return ""
  return String(value)
}

function optionalNumber(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

export default function ClientProfileCard({
  memberId,
  onSaved,
}: ClientProfileCardProps) {
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<ToastPayload | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [phone, setPhone] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState("")
  const [heightCm, setHeightCm] = useState("")
  const [currentWeight, setCurrentWeight] = useState("")
  const [goal, setGoal] = useState("")
  const [activityLevel, setActivityLevel] = useState("")
  const [intakeSummary, setIntakeSummary] = useState("")

  const loadProfile = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)

    const { data, error } = await supabase
      .from("members")
      .select(
        "phone, age, gender, height_cm, current_weight, goal, activity_level, intake_summary",
      )
      .eq("id", memberId)
      .maybeSingle()

    if (error) {
      setErrorMessage(error.message)
      setLoading(false)
      return
    }

    const member = data as Pick<
      Member,
      | "phone"
      | "age"
      | "gender"
      | "height_cm"
      | "current_weight"
      | "goal"
      | "activity_level"
      | "intake_summary"
    > | null

    setPhone(member?.phone ?? "")
    setAge(numberToInput(member?.age))
    setGender(member?.gender ?? "")
    setHeightCm(numberToInput(member?.height_cm))
    setCurrentWeight(numberToInput(member?.current_weight))
    setGoal(member?.goal ?? "")
    setActivityLevel(member?.activity_level ?? "")
    setIntakeSummary(member?.intake_summary ?? "")
    setLoading(false)
  }, [memberId, supabase])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  const saveClientProfile = async () => {
    if (!memberId) {
      setErrorMessage("Member ID is missing.")
      return
    }

    setSaving(true)
    setErrorMessage(null)

    const { error } = await supabase
      .from("members")
      .update({
        phone: phone.trim() || null,
        age: optionalNumber(age),
        gender: gender.trim() || null,
        height_cm: optionalNumber(heightCm),
        current_weight: optionalNumber(currentWeight),
        goal: goal.trim() || null,
        activity_level: activityLevel.trim() || null,
        intake_summary: intakeSummary.trim() || null,
      })
      .eq("id", memberId)

    if (error) {
      setErrorMessage(error.message)
      setSaving(false)
      return
    }

    setToast(successToast("profileSaved"))
    onSaved?.()
    setSaving(false)
  }

  return (
    <>
      <div className="space-y-6">
        <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5 sm:px-8">
            <h2 className="text-2xl font-bold text-black">Client Profile</h2>
          </div>

          <div className="space-y-4 p-6 sm:p-8">
            {errorMessage ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </p>
            ) : null}

            {loading ? (
              <div className="flex min-h-[240px] items-center justify-center gap-3 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                <span className="text-sm">Loading client profile…</span>
              </div>
            ) : (
              <>
                <div>
                  <label className={labelClassName}>Phone</label>
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className={labelClassName}>Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(event) => setAge(event.target.value)}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className={labelClassName}>Gender</label>
                  <input
                    value={gender}
                    onChange={(event) => setGender(event.target.value)}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className={labelClassName}>Height (cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(event) => setHeightCm(event.target.value)}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className={labelClassName}>Current Weight</label>
                  <input
                    type="number"
                    value={currentWeight}
                    onChange={(event) => setCurrentWeight(event.target.value)}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className={labelClassName}>Goal</label>
                  <input
                    value={goal}
                    onChange={(event) => setGoal(event.target.value)}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className={labelClassName}>Activity Level</label>
                  <input
                    value={activityLevel}
                    onChange={(event) => setActivityLevel(event.target.value)}
                    className={inputClassName}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5 sm:px-8">
            <h2 className="text-2xl font-bold text-black">Intake Summary</h2>
          </div>
          <div className="p-6 sm:p-8">
            <textarea
              value={intakeSummary}
              onChange={(event) => setIntakeSummary(event.target.value)}
              rows={8}
              className={`${textareaClassName} min-h-[200px] leading-relaxed`}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => void saveClientProfile()}
            disabled={saving || loading}
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
                Save Profile
              </>
            )}
          </button>
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
