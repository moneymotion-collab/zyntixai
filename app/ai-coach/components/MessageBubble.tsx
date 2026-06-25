"use client"

import { useState } from "react"
import { Dumbbell, FileText, Loader2, Salad } from "lucide-react"
import type { AiMessageContentType } from "@/lib/ai-coach/types"
import type { AiCoachMessageRow } from "@/lib/ai-coach/messages"

type MessageBubbleProps = {
  message: AiCoachMessageRow
  memberId: string
  onSaved?: (label: string) => void
}

export default function MessageBubble({
  message,
  memberId,
  onSaved,
}: MessageBubbleProps) {
  const [saving, setSaving] = useState<string | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)

  const isUser = message.role === "user"
  const contentType = message.content_type as AiMessageContentType

  const save = async (endpoint: string, label: string) => {
    setSaving(endpoint)
    setLocalError(null)

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          content: message.content,
          messageId: message.id,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setLocalError(data.error ?? "Failed to save.")
        return
      }
      onSaved?.(label)
    } catch {
      setLocalError("Could not save.")
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[92%] rounded-2xl px-4 py-3 sm:max-w-[80%] ${
          isUser
            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-black"
            : "border border-white/10 bg-[#0b1224] text-gray-100"
        }`}
      >
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.content}
        </p>
        <p
          className={`mt-2 text-[10px] ${
            isUser ? "text-black/60" : "text-gray-500"
          }`}
        >
          {new Date(message.created_at).toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        {!isUser && contentType !== "general" ? (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-3">
            {contentType === "workout" ? (
              <SaveButton
                icon={Dumbbell}
                label="Save as Workout"
                loading={saving === "/api/ai-coach/save-workout"}
                onClick={() =>
                  void save("/api/ai-coach/save-workout", "Workout saved")
                }
              />
            ) : null}
            {contentType === "nutrition" ? (
              <SaveButton
                icon={Salad}
                label="Save as Nutrition Plan"
                loading={saving === "/api/ai-coach/save-nutrition"}
                onClick={() =>
                  void save(
                    "/api/ai-coach/save-nutrition",
                    "Nutrition plan saved",
                  )
                }
              />
            ) : null}
            {contentType === "progress" ? (
              <SaveButton
                icon={FileText}
                label="Save as Coach Note"
                loading={saving === "/api/ai-coach/save-note"}
                onClick={() =>
                  void save("/api/ai-coach/save-note", "Coach note saved")
                }
              />
            ) : null}
          </div>
        ) : null}

        {localError ? (
          <p className="mt-2 text-xs text-red-400">{localError}</p>
        ) : null}
      </div>
    </div>
  )
}

function SaveButton({
  icon: Icon,
  label,
  loading,
  onClick,
}: {
  icon: typeof Dumbbell
  label: string
  loading: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-cyan-300 transition hover:bg-white/10 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Icon className="h-3.5 w-3.5" />
      )}
      {label}
    </button>
  )
}
