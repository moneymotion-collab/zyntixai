"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Plus, Repeat, Trash2 } from "lucide-react"
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import EmptyState from "@/components/ui/empty-state"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import {
  CLIENT_HABIT_TYPE_OPTIONS,
  clientHabitTypeLabel,
  deleteMemberClientHabit,
  fetchMemberClientHabits,
  formatClientHabitDate,
  insertMemberClientHabit,
} from "@/lib/members/member-client-habits"
import type { ClientHabit, ClientHabitType } from "@/lib/types/client-habits"
import { premiumInputClass, premiumTextareaClass } from "@/lib/ui/premium-input"
import { useCoachingCoreChanged } from "@/app/hooks/useCoachingCoreChanged"
import { createClient } from "@/lib/supabase/client"

type MemberHabitTrackerSectionProps = {
  memberId: string
  onHabitChanged?: () => void
}

const labelClassName = "mb-2 block text-sm font-medium text-gray-700"

const HABIT_TYPE_BADGE_CLASS: Record<ClientHabitType, string> = {
  general: "border-gray-200 bg-gray-50 text-gray-700",
  nutrition: "border-emerald-200 bg-emerald-50 text-emerald-800",
  sleep: "border-indigo-200 bg-indigo-50 text-indigo-800",
  movement: "border-cyan-200 bg-cyan-50 text-cyan-800",
  mindset: "border-violet-200 bg-violet-50 text-violet-800",
  recovery: "border-amber-200 bg-amber-50 text-amber-800",
  other: "border-slate-300 bg-slate-100 text-slate-800",
}

function todayIsoDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function HabitCard({
  habit,
  busy,
  onDelete,
}: {
  habit: ClientHabit
  busy: boolean
  onDelete: () => void
}) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-black">{habit.habit_name}</h3>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${HABIT_TYPE_BADGE_CLASS[habit.habit_type]}`}
            >
              {clientHabitTypeLabel(habit.habit_type)}
            </span>
          </div>
          <p className="text-xs font-medium text-gray-500">
            {formatClientHabitDate(habit.logged_at)}
          </p>
        </div>
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
          Delete
        </button>
      </div>
      {habit.notes ? (
        <p className="mt-3 text-sm leading-relaxed text-gray-700">{habit.notes}</p>
      ) : null}
    </article>
  )
}

export default function MemberHabitTrackerSection({
  memberId,
  onHabitChanged,
}: MemberHabitTrackerSectionProps) {
  const supabase = createClient()

  const [habits, setHabits] = useState<ClientHabit[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [actionHabitId, setActionHabitId] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [habitName, setHabitName] = useState("")
  const [habitType, setHabitType] = useState<ClientHabitType>("general")
  const [habitDate, setHabitDate] = useState(todayIsoDate())
  const [notes, setNotes] = useState("")

  const loadHabits = useCallback(async () => {
    setLoading(true)

    const result = await fetchMemberClientHabits(supabase, memberId)

    if (result.error) {
      setFormError(result.error)
      setHabits([])
    } else {
      setFormError(null)
      setHabits(result.habits)
    }

    setLoading(false)
  }, [memberId, supabase])

  useEffect(() => {
    void loadHabits()
  }, [loadHabits])

  useCoachingCoreChanged(() => {
    void loadHabits()
  })

  const resetForm = () => {
    setHabitName("")
    setHabitType("general")
    setHabitDate(todayIsoDate())
    setNotes("")
    setFormError(null)
  }

  const handleCreateHabit = async () => {
    setFormError(null)
    setSaving(true)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      setFormError(authError?.message ?? "You must be signed in to log habits.")
      setSaving(false)
      return
    }

    const result = await insertMemberClientHabit(supabase, user.id, {
      memberId,
      habitName,
      habitType,
      habitDate,
      notes: notes || null,
    })

    if (result.error) {
      setFormError(result.error)
      setSaving(false)
      return
    }

    if (result.habit) {
      setHabits((current) => [result.habit!, ...current])
    } else {
      await loadHabits()
    }

    resetForm()
    setShowForm(false)
    setSaving(false)
    onHabitChanged?.()
  }

  const handleDelete = async (habit: ClientHabit) => {
    const confirmed = window.confirm(`Delete habit log "${habit.habit_name}"?`)
    if (!confirmed) return

    setActionHabitId(habit.id)
    setFormError(null)

    const result = await deleteMemberClientHabit(supabase, habit.id)

    if (result.error) {
      setFormError(result.error)
      setActionHabitId(null)
      return
    }

    setHabits((current) => current.filter((item) => item.id !== habit.id))
    setActionHabitId(null)
    onHabitChanged?.()
  }

  return (
    <Card variant="light">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
            C6 Habit Tracker
          </p>
          <CardTitle className="mt-1">Habit Tracker</CardTitle>
          <p className="mt-2 text-sm text-gray-600">
            Log daily habits to keep members accountable and power automated
            reminders.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Repeat className="hidden h-8 w-8 text-cyan-600 sm:block" aria-hidden />
          <button
            type="button"
            onClick={() => {
              setShowForm((open) => !open)
              if (showForm) resetForm()
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-black px-4 py-2 text-sm font-semibold text-black transition hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" aria-hidden />
            {showForm ? "Cancel" : "Log habit"}
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {formError ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </p>
        ) : null}

        {showForm ? (
          <div className="space-y-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-5">
            <h3 className="text-lg font-semibold text-black">Log habit</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClassName} htmlFor={`habit-name-${memberId}`}>
                  Habit name
                </label>
                <input
                  id={`habit-name-${memberId}`}
                  type="text"
                  value={habitName}
                  onChange={(event) => setHabitName(event.target.value)}
                  placeholder="Morning walk, protein target, sleep routine…"
                  className={premiumInputClass}
                  disabled={saving}
                />
              </div>

              <div>
                <label className={labelClassName} htmlFor={`habit-type-${memberId}`}>
                  Habit type
                </label>
                <select
                  id={`habit-type-${memberId}`}
                  value={habitType}
                  onChange={(event) =>
                    setHabitType(event.target.value as ClientHabitType)
                  }
                  className={premiumInputClass}
                  disabled={saving}
                >
                  {CLIENT_HABIT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClassName} htmlFor={`habit-date-${memberId}`}>
                  Habit date
                </label>
                <input
                  id={`habit-date-${memberId}`}
                  type="date"
                  value={habitDate}
                  onChange={(event) => setHabitDate(event.target.value)}
                  className={premiumInputClass}
                  disabled={saving}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClassName} htmlFor={`habit-notes-${memberId}`}>
                  Notes
                </label>
                <textarea
                  id={`habit-notes-${memberId}`}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                  placeholder="Optional context for this habit log…"
                  className={premiumTextareaClass}
                  disabled={saving}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleCreateHabit()}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Plus className="h-4 w-4" aria-hidden />
              )}
              {saving ? "Saving…" : "Save habit log"}
            </button>
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Loading habits…
          </div>
        ) : habits.length === 0 ? (
          <EmptyState {...SAAS_EMPTY.memberHabits} variant="light" compact />
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                busy={actionHabitId === habit.id}
                onDelete={() => void handleDelete(habit)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
