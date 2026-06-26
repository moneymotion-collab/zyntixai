"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  ClipboardList,
  Loader2,
  Pin,
  PinOff,
  Plus,
  Trash2,
} from "lucide-react"
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import EmptyState from "@/components/ui/empty-state"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import {
  CLIENT_NOTE_FILTER_OPTIONS,
  CLIENT_NOTE_TYPE_OPTIONS,
  clientNoteTypeLabel,
  deleteMemberClientNote,
  fetchMemberClientNotes,
  filterClientNotes,
  formatClientNoteDate,
  insertMemberClientNote,
  sortClientNotes,
  toggleMemberClientNotePinned,
} from "@/lib/members/member-client-notes"
import type {
  ClientNote,
  ClientNoteFilter,
  ClientNoteType,
} from "@/lib/types/client-notes"
import {
  premiumInputClass,
  premiumTextareaClass,
} from "@/lib/ui/premium-input"
import { useCoachingCoreChanged } from "@/app/hooks/useCoachingCoreChanged"
import { createClient } from "@/lib/supabase/client"

type MemberCoachNotesSectionProps = {
  memberId: string
  onNoteCreated?: () => void
  onNoteUpdated?: () => void
  onNoteDeleted?: () => void
}

const labelClassName = "mb-2 block text-sm font-medium text-gray-700"

const NOTE_TYPE_BADGE_CLASS: Record<ClientNoteType, string> = {
  general: "border-gray-200 bg-gray-50 text-gray-700",
  injury: "border-red-200 bg-red-50 text-red-800",
  mindset: "border-violet-200 bg-violet-50 text-violet-800",
  nutrition: "border-emerald-200 bg-emerald-50 text-emerald-800",
  workout: "border-cyan-200 bg-cyan-50 text-cyan-800",
  progress: "border-amber-200 bg-amber-50 text-amber-800",
  admin: "border-slate-300 bg-slate-100 text-slate-800",
}

function NoteTypeBadge({ type }: { type: ClientNoteType }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${NOTE_TYPE_BADGE_CLASS[type]}`}
    >
      {clientNoteTypeLabel(type)}
    </span>
  )
}

function NoteCard({
  note,
  busy,
  onTogglePin,
  onDelete,
}: {
  note: ClientNote
  busy: boolean
  onTogglePin: () => void
  onDelete: () => void
}) {
  return (
    <article
      className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
        note.is_pinned ? "border-cyan-200 ring-1 ring-cyan-100" : "border-gray-200"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-black">{note.title}</h3>
            <NoteTypeBadge type={note.note_type} />
            {note.is_pinned ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-0.5 text-xs font-semibold text-cyan-800">
                <Pin className="h-3 w-3" aria-hidden />
                Pinned
              </span>
            ) : null}
          </div>
          <p className="text-xs font-medium text-gray-500">
            {formatClientNoteDate(note.created_at)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onTogglePin}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            title={note.is_pinned ? "Unpin note" : "Pin note"}
          >
            {note.is_pinned ? (
              <PinOff className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <Pin className="h-3.5 w-3.5" aria-hidden />
            )}
            {note.is_pinned ? "Unpin" : "Pin"}
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
            title="Delete note"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            Delete
          </button>
        </div>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
        {note.content}
      </p>
    </article>
  )
}

export default function MemberCoachNotesSection({
  memberId,
  onNoteCreated,
  onNoteUpdated,
  onNoteDeleted,
}: MemberCoachNotesSectionProps) {
  const supabase = createClient()

  const [notes, setNotes] = useState<ClientNote[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [actionNoteId, setActionNoteId] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [activeFilter, setActiveFilter] = useState<ClientNoteFilter>("all")

  const [noteType, setNoteType] = useState<ClientNoteType>("general")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isPinned, setIsPinned] = useState(false)

  const loadNotes = useCallback(async () => {
    setLoading(true)

    const result = await fetchMemberClientNotes(supabase, memberId)

    if (result.error) {
      setFormError(result.error)
      setNotes([])
    } else {
      setFormError(null)
      setNotes(result.notes)
    }

    setLoading(false)
  }, [memberId, supabase])

  useEffect(() => {
    void loadNotes()
  }, [loadNotes])

  useCoachingCoreChanged(() => {
    void loadNotes()
  })

  const filteredNotes = useMemo(
    () => filterClientNotes(notes, activeFilter),
    [activeFilter, notes],
  )

  const resetForm = () => {
    setNoteType("general")
    setTitle("")
    setContent("")
    setIsPinned(false)
    setFormError(null)
  }

  const handleCreateNote = async () => {
    setFormError(null)
    setSaving(true)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      setFormError(authError?.message ?? "You must be signed in to add notes.")
      setSaving(false)
      return
    }

    const result = await insertMemberClientNote(supabase, user.id, {
      memberId,
      noteType,
      title,
      content,
      isPinned,
    })

    if (result.error) {
      setFormError(result.error)
      setSaving(false)
      return
    }

    if (result.note) {
      setNotes((current) => sortClientNotes([result.note!, ...current]))
    } else {
      await loadNotes()
    }

    resetForm()
    setShowForm(false)
    setSaving(false)
    onNoteCreated?.()
  }

  const handleTogglePin = async (note: ClientNote) => {
    setActionNoteId(note.id)
    setFormError(null)

    const result = await toggleMemberClientNotePinned(
      supabase,
      note.id,
      !note.is_pinned,
    )

    if (result.error) {
      setFormError(result.error)
      setActionNoteId(null)
      return
    }

    if (result.note) {
      setNotes((current) =>
        sortClientNotes(
          current.map((item) => (item.id === result.note!.id ? result.note! : item)),
        ),
      )
    } else {
      await loadNotes()
    }

    setActionNoteId(null)
    onNoteUpdated?.()
  }

  const handleDeleteNote = async (note: ClientNote) => {
    const confirmed = window.confirm(`Delete note "${note.title}"?`)
    if (!confirmed) return

    setActionNoteId(note.id)
    setFormError(null)

    const result = await deleteMemberClientNote(supabase, note.id)

    if (result.error) {
      setFormError(result.error)
      setActionNoteId(null)
      return
    }

    setNotes((current) => current.filter((item) => item.id !== note.id))
    setActionNoteId(null)
    onNoteDeleted?.()
  }

  return (
    <Card variant="light">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
            C5 Coach Notes Pro
          </p>
          <CardTitle className="mt-1">Coach Notes</CardTitle>
          <p className="mt-2 text-sm text-gray-600">
            Structured coaching notes with types, pins, and quick filters for
            injury, mindset, nutrition, and more.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 sm:inline-flex">
            <ClipboardList className="h-3.5 w-3.5" aria-hidden />
            Coach only
          </span>
          <button
            type="button"
            onClick={() => {
              setShowForm((open) => !open)
              if (showForm) resetForm()
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-black px-4 py-2 text-sm font-semibold text-black transition hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" aria-hidden />
            {showForm ? "Cancel" : "Add note"}
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
            <h3 className="text-lg font-semibold text-black">Create note</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClassName} htmlFor={`note-type-${memberId}`}>
                  Note type
                </label>
                <select
                  id={`note-type-${memberId}`}
                  value={noteType}
                  onChange={(event) =>
                    setNoteType(event.target.value as ClientNoteType)
                  }
                  className={premiumInputClass}
                  disabled={saving}
                >
                  {CLIENT_NOTE_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClassName} htmlFor={`note-title-${memberId}`}>
                  Title
                </label>
                <input
                  id={`note-title-${memberId}`}
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Session summary, injury update, mindset check…"
                  className={premiumInputClass}
                  disabled={saving}
                />
              </div>
            </div>

            <div>
              <label className={labelClassName} htmlFor={`note-content-${memberId}`}>
                Content
              </label>
              <textarea
                id={`note-content-${memberId}`}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={5}
                placeholder="Detailed coaching notes, observations, and follow-up actions…"
                className={premiumTextareaClass}
                disabled={saving}
              />
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(event) => setIsPinned(event.target.checked)}
                disabled={saving}
                className="h-4 w-4 rounded border-gray-300"
              />
              Pin this note to the top
            </label>

            <button
              type="button"
              onClick={() => void handleCreateNote()}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Plus className="h-4 w-4" aria-hidden />
              )}
              {saving ? "Saving…" : "Save note"}
            </button>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {CLIENT_NOTE_FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setActiveFilter(option.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                activeFilter === option.value
                  ? "border-black bg-black text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Loading notes…
          </div>
        ) : filteredNotes.length === 0 ? (
          <EmptyState
            {...(notes.length === 0
              ? SAAS_EMPTY.memberCoachNotes
              : SAAS_EMPTY.memberCoachNotesFiltered)}
            variant="light"
            compact
          />
        ) : (
          <div className="space-y-4">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                busy={actionNoteId === note.id}
                onTogglePin={() => void handleTogglePin(note)}
                onDelete={() => void handleDeleteNote(note)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
