"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Loader2,
  MessageSquare,
  RotateCcw,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react"
import ProtectedShell from "@/app/components/ProtectedShell"
import Textarea from "@/components/ui/textarea"
import {
  fitcoreCardClass,
  fitcoreMutedClass,
  fitcoreSurfaceClass,
} from "@/lib/ui/fitcore-form"
import ConfirmDialog from "@/app/components/ConfirmDialog"
import type { MarketingCoachMessageRow } from "@/lib/marketing/coach/conversations"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  message: string
}

const SUGGESTED_PROMPTS = [
  "How do I get more gym members from Instagram?",
  "What's a good lead magnet for online coaching?",
  "Help me structure a high-converting offer",
  "How can I improve client retention?",
] as const

function rowToMessage(row: MarketingCoachMessageRow): ChatMessage {
  return {
    id: row.id,
    role: row.role === "assistant" ? "assistant" : "user",
    message: row.message,
  }
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-2">
      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
    </div>
  )
}

export default function MarketingCoachPage() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [sending, setSending] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [confirmClearOpen, setConfirmClearOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastMode, setLastMode] = useState<"openai" | "strategy" | null>(null)

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true)
    setError(null)

    try {
      const res = await fetch("/api/marketing-coach", { credentials: "include" })
      const data = (await res.json()) as {
        messages?: MarketingCoachMessageRow[]
        error?: string
      }

      if (!res.ok) {
        setError(data.error ?? "Could not load conversation.")
        setMessages([])
        return
      }

      setMessages((data.messages ?? []).map(rowToMessage))
    } catch {
      setError("Could not load conversation.")
      setMessages([])
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  useEffect(() => {
    void loadHistory()
  }, [loadHistory])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, sending])

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || sending) return

    const optimisticId = `temp-${Date.now()}`
    setMessages((prev) => [
      ...prev,
      { id: optimisticId, role: "user", message: trimmed },
    ])
    setInput("")
    setSending(true)
    setError(null)

    try {
      const res = await fetch("/api/marketing-coach", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      })

      const data = (await res.json()) as {
        answer?: string
        mode?: "openai" | "strategy"
        error?: string
      }

      if (!res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
        setInput(trimmed)
        setError(data.error ?? "Something went wrong.")
        return
      }

      setLastMode(data.mode ?? "openai")
      await loadHistory()
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
      setInput(trimmed)
      setError("Could not reach Marketing Coach.")
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const handleClear = async () => {
    if (clearing || messages.length === 0) return

    setClearing(true)
    setError(null)
    setConfirmClearOpen(false)

    try {
      const res = await fetch("/api/marketing-coach", {
        method: "DELETE",
        credentials: "include",
      })

      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        setError(data.error ?? "Could not clear conversation.")
        return
      }

      setMessages([])
      setLastMode(null)
    } catch {
      setError("Could not clear conversation.")
    } finally {
      setClearing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void sendMessage(input)
    }
  }

  return (
    <ProtectedShell allowed={["admin", "coach"]}>
      <div className="mx-auto flex min-h-[calc(100dvh-7rem)] max-w-4xl flex-col sm:min-h-[calc(100dvh-8rem)]">
      <div className={`flex min-h-0 flex-1 flex-col ${fitcoreSurfaceClass}`}>
        {/* Header */}
        <div className={`${fitcoreCardClass} mb-4 shrink-0 p-4 sm:p-6`}>
          <div
            data-tour="marketing-ai"
            className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
                  FitCore AI
                </p>
                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  Marketing Coach
                </h1>
                <p className={`mt-1 max-w-lg text-sm ${fitcoreMutedClass}`}>
                  Senior strategist for leads, engagement, retention, revenue,
                  and authority — grounded in your business data.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-start">
              {lastMode === "strategy" ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
                  Strategy mode
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => setConfirmClearOpen(true)}
                disabled={clearing || messages.length === 0}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:text-gray-900 disabled:opacity-40"
              >
                {clearing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}
                Clear
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { icon: Users, label: "Gym & PT" },
              { icon: TrendingUp, label: "Social growth" },
              { icon: Target, label: "Lead gen" },
              { icon: Zap, label: "Offers & funnels" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600"
              >
                <Icon className="h-3.5 w-3.5 text-violet-500" />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className={`flex min-h-0 flex-1 flex-col overflow-hidden ${fitcoreCardClass}`}>
          <div
            ref={scrollRef}
            className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6"
          >
            {loadingHistory ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-600">
                <Loader2 className="h-7 w-7 animate-spin text-violet-500" />
                <p className="text-sm">Loading conversation…</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center px-2 py-10 text-center sm:py-16">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50">
                  <MessageSquare className="h-7 w-7 text-violet-500" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-slate-900">
                  What do you want to grow?
                </h2>
                <p className={`mt-2 max-w-md text-sm ${fitcoreMutedClass}`}>
                  Ask about social content, lead magnets, offer structure, or
                  retention — get actionable advice tailored to fitness
                  businesses.
                </p>
                <div className="mt-6 grid w-full max-w-lg gap-2 sm:grid-cols-2">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void sendMessage(prompt)}
                      disabled={sending}
                      className="min-h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm text-gray-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-900 disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => {
                  const isUser = msg.role === "user"

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[88%] sm:max-w-[75%] ${
                          isUser ? "order-1" : ""
                        }`}
                      >
                        {!isUser ? (
                          <div className="mb-1 flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                            <span className="text-xs font-medium text-violet-600">
                              FitCore AI Coach
                            </span>
                          </div>
                        ) : null}
                        <div
                          className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                            isUser
                              ? "rounded-br-md bg-gray-900 text-white"
                              : "rounded-bl-md border border-gray-100 bg-gray-50 text-gray-800"
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {sending ? (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-md border border-gray-100 bg-gray-50 px-4 py-2">
                      <TypingIndicator />
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {error ? (
            <div className="shrink-0 border-t border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700 sm:px-6">
              {error}
            </div>
          ) : null}

          {/* Input */}
          <div className="shrink-0 border-t border-gray-100 p-3 sm:p-4">
            <div className="flex items-end gap-2">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about marketing, leads, offers, funnels…"
                rows={1}
                disabled={sending || loadingHistory}
                className="max-h-32 flex-1"
              />
              <button
                type="button"
                onClick={() => void sendMessage(input)}
                disabled={!input.trim() || sending || loadingHistory}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white transition hover:bg-gray-800 disabled:opacity-40"
                aria-label="Send message"
              >
                {sending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className={`mt-2 hidden text-center text-xs ${fitcoreMutedClass} sm:block`}>
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
      </div>

      <ConfirmDialog
        open={confirmClearOpen}
        title="Clear conversation?"
        message="Clear this conversation? This cannot be undone."
        confirmLabel="Clear"
        loading={clearing}
        onConfirm={() => void handleClear()}
        onCancel={() => setConfirmClearOpen(false)}
      />
    </ProtectedShell>
  )
}
