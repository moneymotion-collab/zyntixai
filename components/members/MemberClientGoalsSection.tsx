"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import EmptyState from "@/components/ui/empty-state"
import SectionLoadingState from "@/components/ui/section-loading-state"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import { reportSupabaseError } from "@/lib/errors/reportSupabaseError"
import { CLIENT_GOAL_TYPE_OPTIONS } from "@/lib/progress/client-goals"
import { premiumInputClass, premiumTextareaClass } from "@/lib/ui/premium-input"
import type { ClientGoal } from "@/lib/types/client-goals"
import { createClient } from "@/lib/supabase/client"

type MemberClientGoalsSectionProps = {
  goals: ClientGoal[]
  memberId: string
  memberName: string
  loading?: boolean
  onGoalAdded?: () => void
}

function computeGoalProgress(goal: ClientGoal): number {
  if (
    goal.start_value === null ||
    goal.current_value === null ||
    goal.target_value === null ||
    goal.target_value === goal.start_value
  ) {
    return 0
  }

  return Math.round(
    ((goal.current_value - goal.start_value) /
      (goal.target_value - goal.start_value)) *
      100,
  )
}

function defaultUnitForGoalType(goalType: string): string {
  switch (goalType) {
    case "body_fat_reduction":
      return "%"
    case "weight_loss":
    case "weight_gain":
    case "muscle_gain":
      return "kg"
    default:
      return ""
  }
}

export default function MemberClientGoalsSection({
  goals,
  memberId,
  memberName,
  loading = false,
  onGoalAdded,
}: MemberClientGoalsSectionProps) {
  const supabase = createClient()

  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [goalType, setGoalType] = useState("weight_loss")
  const [unit, setUnit] = useState("kg")
  const [startValue, setStartValue] = useState("")
  const [currentValue, setCurrentValue] = useState("")
  const [targetValue, setTargetValue] = useState("")
  const [deadline, setDeadline] = useState("")
  const [notes, setNotes] = useState("")

  const resetForm = () => {
    setTitle("")
    setGoalType("weight_loss")
    setUnit("kg")
    setStartValue("")
    setCurrentValue("")
    setTargetValue("")
    setDeadline("")
    setNotes("")
    setFormError(null)
  }

  const addGoal = async () => {
    setFormError(null)

    if (!title.trim()) {
      setFormError("Enter a goal title.")
      return
    }

    if (!deadline) {
      setFormError("Select a deadline.")
      return
    }

    const start = Number(startValue)
    const current = currentValue === "" ? start : Number(currentValue)
    const target = Number(targetValue)

    if (startValue === "" || Number.isNaN(start)) {
      setFormError("Enter a valid start value.")
      return
    }

    if (targetValue === "" || Number.isNaN(target)) {
      setFormError("Enter a valid target value.")
      return
    }

    if (Number.isNaN(current)) {
      setFormError("Enter a valid current value.")
      return
    }

    setSaving(true)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      setFormError(authError?.message ?? "You must be signed in to add goals.")
      setSaving(false)
      return
    }

    const goalTypeValue = goalType.trim()
    const unitValue = unit.trim() || defaultUnitForGoalType(goalTypeValue) || null

    const { error } = await supabase.from("client_goals").insert({
      coach_id: user.id,
      member_id: memberId,
      member_name: memberName.trim(),
      title: title.trim(),
      goal_type: goalTypeValue,
      unit: unitValue,
      start_value: start,
      current_value: current,
      target_value: target,
      target_date: deadline,
      deadline,
      notes: notes.trim() || null,
    })

    if (error) {
      reportSupabaseError("[client_goals] insert failed", error, {
        setError: setFormError,
      })
      setSaving(false)
      return
    }

    resetForm()
    setShowForm(false)
    setSaving(false)
    onGoalAdded?.()
  }

  if (loading) {
    return (
      <Card variant="light">
        <CardHeader>
          <CardTitle>Goal Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <SectionLoadingState label="Loading goals" rows={3} compact />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="light">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Goal Tracking</CardTitle>
        <button
          type="button"
          onClick={() => setShowForm((open) => !open)}
          className="rounded-xl border border-black px-4 py-2 text-sm font-semibold text-black transition hover:bg-gray-50"
        >
          {showForm ? "Cancel" : "Add goal"}
        </button>
      </CardHeader>

      <CardContent className="space-y-4">
        {showForm ? (
          <div className="space-y-4 rounded-xl border p-4">
            {formError ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </p>
            ) : null}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className={premiumInputClass}
                disabled={saving}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Goal type
                </label>
                <select
                  value={goalType}
                  onChange={(event) => {
                    const nextType = event.target.value
                    setGoalType(nextType)
                    setUnit(defaultUnitForGoalType(nextType))
                  }}
                  className={premiumInputClass}
                  disabled={saving}
                >
                  {CLIENT_GOAL_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Unit
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(event) => setUnit(event.target.value)}
                  placeholder="kg, %, reps…"
                  className={premiumInputClass}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Start value
                </label>
                <input
                  type="number"
                  step="any"
                  value={startValue}
                  onChange={(event) => setStartValue(event.target.value)}
                  className={premiumInputClass}
                  disabled={saving}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Current value
                </label>
                <input
                  type="number"
                  step="any"
                  value={currentValue}
                  onChange={(event) => setCurrentValue(event.target.value)}
                  placeholder="Defaults to start"
                  className={premiumInputClass}
                  disabled={saving}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Target value
                </label>
                <input
                  type="number"
                  step="any"
                  value={targetValue}
                  onChange={(event) => setTargetValue(event.target.value)}
                  className={premiumInputClass}
                  disabled={saving}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
                className={premiumInputClass}
                disabled={saving}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                className={premiumTextareaClass}
                disabled={saving}
              />
            </div>

            <button
              type="button"
              onClick={() => void addGoal()}
              disabled={saving}
              className="rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save goal"}
            </button>
          </div>
        ) : null}

        {goals.length === 0 ? (
          <EmptyState {...SAAS_EMPTY.goals} variant="light" compact />
        ) : (
          goals.map((goal) => {
            const progress = computeGoalProgress(goal)

            return (
              <div key={goal.id} className="space-y-2 rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{goal.title}</h3>
                    <p className="text-sm text-gray-500">
                      {goal.current_value} / {goal.target_value} {goal.unit}
                    </p>
                  </div>

                  <span className="text-sm font-medium">{progress}%</span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${Math.min(Math.max(progress, 0), 100)}%`,
                    }}
                  />
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
