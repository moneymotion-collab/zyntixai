"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Bell,
  CheckCircle2,
  Loader2,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react"
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import EmptyState from "@/components/ui/empty-state"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import {
  CLIENT_REMINDER_PRIORITY_OPTIONS,
  CLIENT_REMINDER_TYPE_OPTIONS,
  clientReminderPriorityLabel,
  clientReminderTypeLabel,
  deleteMemberClientReminder,
  fetchMemberClientReminders,
  formatClientReminderDate,
  insertMemberClientReminder,
  sortClientReminders,
  syncAutomaticClientReminders,
  updateMemberClientReminderStatus,
} from "@/lib/members/member-client-reminders"
import type {
  ClientReminder,
  ClientReminderPriority,
  ClientReminderType,
} from "@/lib/types/client-reminders"
import { premiumInputClass, premiumTextareaClass } from "@/lib/ui/premium-input"
import { useCoachingCoreChanged } from "@/app/hooks/useCoachingCoreChanged"
import { createClient } from "@/lib/supabase/client"

type MemberClientRemindersSectionProps = {
  memberId: string
  onReminderCreated?: () => void
  onReminderUpdated?: () => void
  onReminderDeleted?: () => void
}

const labelClassName = "mb-2 block text-sm font-medium text-gray-700"

const PRIORITY_BADGE_CLASS: Record<ClientReminderPriority, string> = {
  high: "border-red-200 bg-red-50 text-red-800",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  low: "border-gray-200 bg-gray-50 text-gray-700",
}

const STATUS_BADGE_CLASS = {
  open: "border-cyan-200 bg-cyan-50 text-cyan-800",
  done: "border-emerald-200 bg-emerald-50 text-emerald-800",
} as const

function todayIsoDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function PriorityBadge({ priority }: { priority: ClientReminderPriority }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${PRIORITY_BADGE_CLASS[priority]}`}
    >
      {clientReminderPriorityLabel(priority)}
    </span>
  )
}

function ReminderCard({
  reminder,
  busy,
  onMarkDone,
  onReopen,
  onDelete,
}: {
  reminder: ClientReminder
  busy: boolean
  onMarkDone: () => void
  onReopen: () => void
  onDelete: () => void
}) {
  return (
    <article
      className={`rounded-2xl border bg-white p-5 shadow-sm ${
        reminder.status === "open" ? "border-gray-200" : "border-gray-100 opacity-90"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-black">{reminder.title}</h3>
            <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
              {clientReminderTypeLabel(reminder.reminder_type)}
            </span>
            <PriorityBadge priority={reminder.priority} />
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE_CLASS[reminder.status]}`}
            >
              {reminder.status === "open" ? "Open" : "Done"}
            </span>
            {reminder.is_automatic ? (
              <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-800">
                Auto
              </span>
            ) : null}
          </div>
          <p className="text-xs font-medium text-gray-500">
            Due {formatClientReminderDate(reminder.due_date)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {reminder.status === "open" ? (
            <button
              type="button"
              onClick={onMarkDone}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
            >
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              Mark done
            </button>
          ) : (
            <button
              type="button"
              onClick={onReopen}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              Reopen
            </button>
          )}
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
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
        {reminder.message}
      </p>
    </article>
  )
}

export default function MemberClientRemindersSection({
  memberId,
  onReminderCreated,
  onReminderUpdated,
  onReminderDeleted,
}: MemberClientRemindersSectionProps) {
  const supabase = createClient()

  const [reminders, setReminders] = useState<ClientReminder[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [actionReminderId, setActionReminderId] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [reminderType, setReminderType] = useState<ClientReminderType>("general")
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [dueDate, setDueDate] = useState(todayIsoDate())
  const [priority, setPriority] = useState<ClientReminderPriority>("medium")

  const loadReminders = useCallback(async () => {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const syncResult = await syncAutomaticClientReminders(
        supabase,
        user.id,
        memberId,
      )
      if (syncResult.error) {
        setFormError(syncResult.error)
      }
    }

    const result = await fetchMemberClientReminders(supabase, memberId)

    if (result.error) {
      setFormError(result.error)
      setReminders([])
    } else {
      setFormError(null)
      setReminders(result.reminders)
    }

    setLoading(false)
  }, [memberId, supabase])

  useEffect(() => {
    void loadReminders()
  }, [loadReminders])

  useCoachingCoreChanged(() => {
    void loadReminders()
  })

  const resetForm = () => {
    setReminderType("general")
    setTitle("")
    setMessage("")
    setDueDate(todayIsoDate())
    setPriority("medium")
    setFormError(null)
  }

  const handleCreateReminder = async () => {
    setFormError(null)
    setSaving(true)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      setFormError(authError?.message ?? "You must be signed in to add reminders.")
      setSaving(false)
      return
    }

    const result = await insertMemberClientReminder(supabase, user.id, {
      memberId,
      reminderType,
      title,
      message,
      dueDate,
      priority,
    })

    if (result.error) {
      setFormError(result.error)
      setSaving(false)
      return
    }

    if (result.reminder) {
      setReminders((current) => sortClientReminders([result.reminder!, ...current]))
    } else {
      await loadReminders()
    }

    resetForm()
    setShowForm(false)
    setSaving(false)
    onReminderCreated?.()
  }

  const handleMarkDone = async (reminder: ClientReminder) => {
    setActionReminderId(reminder.id)
    setFormError(null)

    const result = await updateMemberClientReminderStatus(
      supabase,
      reminder.id,
      "done",
    )

    if (result.error) {
      setFormError(result.error)
      setActionReminderId(null)
      return
    }

    if (result.reminder) {
      setReminders((current) =>
        sortClientReminders(
          current.map((item) =>
            item.id === result.reminder!.id ? result.reminder! : item,
          ),
        ),
      )
    } else {
      await loadReminders()
    }

    setActionReminderId(null)
    onReminderUpdated?.()
  }

  const handleReopen = async (reminder: ClientReminder) => {
    setActionReminderId(reminder.id)
    setFormError(null)

    const result = await updateMemberClientReminderStatus(
      supabase,
      reminder.id,
      "open",
    )

    if (result.error) {
      setFormError(result.error)
      setActionReminderId(null)
      return
    }

    if (result.reminder) {
      setReminders((current) =>
        sortClientReminders(
          current.map((item) =>
            item.id === result.reminder!.id ? result.reminder! : item,
          ),
        ),
      )
    } else {
      await loadReminders()
    }

    setActionReminderId(null)
    onReminderUpdated?.()
  }

  const handleDelete = async (reminder: ClientReminder) => {
    const confirmed = window.confirm(`Delete reminder "${reminder.title}"?`)
    if (!confirmed) return

    setActionReminderId(reminder.id)
    setFormError(null)

    const result = await deleteMemberClientReminder(supabase, reminder.id)

    if (result.error) {
      setFormError(result.error)
      setActionReminderId(null)
      return
    }

    setReminders((current) => current.filter((item) => item.id !== reminder.id))
    setActionReminderId(null)
    onReminderDeleted?.()
  }

  return (
    <Card variant="light">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
            C7 Automated Reminders
          </p>
          <CardTitle className="mt-1">Reminders</CardTitle>
          <p className="mt-2 text-sm text-gray-600">
            Manual follow-ups plus automatic alerts for missing check-ins, habits,
            progress updates, and workout completions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Bell className="hidden h-8 w-8 text-cyan-600 sm:block" aria-hidden />
          <button
            type="button"
            onClick={() => {
              setShowForm((open) => !open)
              if (showForm) resetForm()
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-black px-4 py-2 text-sm font-semibold text-black transition hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" aria-hidden />
            {showForm ? "Cancel" : "Add reminder"}
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
            <h3 className="text-lg font-semibold text-black">Create reminder</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClassName} htmlFor={`reminder-type-${memberId}`}>
                  Reminder type
                </label>
                <select
                  id={`reminder-type-${memberId}`}
                  value={reminderType}
                  onChange={(event) =>
                    setReminderType(event.target.value as ClientReminderType)
                  }
                  className={premiumInputClass}
                  disabled={saving}
                >
                  {CLIENT_REMINDER_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClassName} htmlFor={`reminder-priority-${memberId}`}>
                  Priority
                </label>
                <select
                  id={`reminder-priority-${memberId}`}
                  value={priority}
                  onChange={(event) =>
                    setPriority(event.target.value as ClientReminderPriority)
                  }
                  className={premiumInputClass}
                  disabled={saving}
                >
                  {CLIENT_REMINDER_PRIORITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className={labelClassName} htmlFor={`reminder-title-${memberId}`}>
                  Title
                </label>
                <input
                  id={`reminder-title-${memberId}`}
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Follow up on nutrition adherence"
                  className={premiumInputClass}
                  disabled={saving}
                />
              </div>

              <div>
                <label className={labelClassName} htmlFor={`reminder-due-${memberId}`}>
                  Due date
                </label>
                <input
                  id={`reminder-due-${memberId}`}
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className={premiumInputClass}
                  disabled={saving}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClassName} htmlFor={`reminder-message-${memberId}`}>
                  Message
                </label>
                <textarea
                  id={`reminder-message-${memberId}`}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={4}
                  placeholder="What should you follow up on and why?"
                  className={premiumTextareaClass}
                  disabled={saving}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleCreateReminder()}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Plus className="h-4 w-4" aria-hidden />
              )}
              {saving ? "Saving…" : "Save reminder"}
            </button>
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Loading reminders…
          </div>
        ) : reminders.length === 0 ? (
          <EmptyState {...SAAS_EMPTY.memberReminders} variant="light" compact />
        ) : (
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                busy={actionReminderId === reminder.id}
                onMarkDone={() => void handleMarkDone(reminder)}
                onReopen={() => void handleReopen(reminder)}
                onDelete={() => void handleDelete(reminder)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
