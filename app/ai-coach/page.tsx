"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  ArrowLeft,
  Loader2,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  User,
} from "lucide-react"
import ProtectedShell from "../components/ProtectedShell"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import Toast from "../components/Toast"
import MessageBubble from "./components/MessageBubble"
import { getCoachScope } from "@/lib/auth/coach-scope"
import {
  fetchAiCoachThreads,
  type AiCoachThreadRow,
} from "@/lib/ai-coach/fetch-threads"
import type { AiCoachMessageRow } from "@/lib/ai-coach/messages"
import type { AiCoachResponseBody } from "@/lib/ai-coach/types"
import type { Database } from "@/lib/database.types"
import { createClient } from "@/lib/supabase/client"
import {
  premiumSelectClass,
  premiumTextareaClass,
} from "@/lib/ui/premium-input"

type Member = Database["public"]["Tables"]["members"]["Row"]

function formatThreadTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function AiCoachPage() {
  const supabase = createClient()
  const scrollRef = useRef<HTMLDivElement>(null)

  const [members, setMembers] = useState<Member[]>([])
  const [threads, setThreads] = useState<AiCoachThreadRow[]>([])
  const [messages, setMessages] = useState<AiCoachMessageRow[]>([])
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [selectedMemberId, setSelectedMemberId] = useState("")
  const [prompt, setPrompt] = useState("")
  const [mobileShowChat, setMobileShowChat] = useState(false)

  const [loadingThreads, setLoadingThreads] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [loadingMembers, setLoadingMembers] = useState(true)
  const [generating, setGenerating] = useState(false)

  const [threadsError, setThreadsError] = useState<string | null>(null)
  const [messagesError, setMessagesError] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const activeThread = threads.find((t) => t.id === activeThreadId)

  const fetchMembers = useCallback(async () => {
    const scope = await getCoachScope(supabase)
    let query = supabase
      .from("members")
      .select("*")
      .order("full_name", { ascending: true })
    if (scope.isCoach && scope.userId) {
      query = query.eq("coach_id", scope.userId)
    }
    const { data, error } = await query
    if (!error) setMembers(data ?? [])
  }, [supabase])

  const fetchThreads = useCallback(async () => {
    setLoadingThreads(true)
    setThreadsError(null)
    const { data, error } = await fetchAiCoachThreads(supabase)
    if (error) {
      setThreadsError(error)
      setThreads([])
    } else {
      setThreads(data)
    }
    setLoadingThreads(false)
  }, [supabase])

  const loadMessages = useCallback(
    async (threadId: string) => {
      setLoadingMessages(true)
      setMessagesError(null)
      const { data, error } = await supabase
        .from("ai_coach_messages")
        .select("*")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true })

      if (error) {
        setMessagesError(error.message)
        setMessages([])
      } else {
        setMessages(data ?? [])
      }
      setLoadingMessages(false)
    },
    [supabase],
  )

  useEffect(() => {
    fetchMembers().finally(() => setLoadingMembers(false))
    void fetchThreads()
  }, [fetchMembers, fetchThreads])

  useEffect(() => {
    if (!selectedMemberId && members.length > 0) {
      setSelectedMemberId(members[0].id)
    }
  }, [members, selectedMemberId])

  useEffect(() => {
    if (activeThreadId) {
      void loadMessages(activeThreadId)
    } else {
      setMessages([])
    }
  }, [activeThreadId, loadMessages])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, generating])

  const openThread = (thread: AiCoachThreadRow) => {
    setActiveThreadId(thread.id)
    setSelectedMemberId(thread.member_id)
    setSendError(null)
    setMobileShowChat(true)
  }

  const startNewThread = () => {
    setActiveThreadId(null)
    setMessages([])
    setPrompt("")
    setSendError(null)
    setMobileShowChat(true)
  }

  const handleSend = async () => {
    const trimmed = prompt.trim()
    if (!trimmed || generating || !selectedMemberId) return

    setGenerating(true)
    setSendError(null)

    const optimisticUser: AiCoachMessageRow = {
      id: `temp-${Date.now()}`,
      thread_id: activeThreadId ?? "",
      role: "user",
      content: trimmed,
      content_type: "general",
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimisticUser])
    setPrompt("")

    try {
      const res = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmed,
          memberId: selectedMemberId,
          threadId: activeThreadId ?? undefined,
        }),
      })

      const data = (await res.json()) as AiCoachResponseBody & { error?: string }

      if (!res.ok) {
        setSendError(data.error ?? "Failed to send.")
        setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id))
        setPrompt(trimmed)
        return
      }

      if (!activeThreadId) {
        setActiveThreadId(data.threadId)
      }

      await fetchThreads()
      await loadMessages(data.threadId)
    } catch {
      setSendError("Could not reach AI Coach.")
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id))
      setPrompt(trimmed)
    } finally {
      setGenerating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  const memberName =
    activeThread?.members?.full_name ??
    members.find((m) => m.id === selectedMemberId)?.full_name ??
    "Member"

  const canSend = Boolean(
    prompt.trim() && selectedMemberId && !generating && members.length > 0,
  )

  return (
    <ProtectedShell allowed={["admin", "coach"]}>
      <div className="-m-4 flex h-[calc(100vh-0px)] flex-col md:-m-8 md:h-[calc(100vh-0px)]">
        <div className="flex min-h-0 flex-1 flex-col border border-white/10 bg-[#050816] md:flex-row md:rounded-3xl md:overflow-hidden">
          {/* Sidebar */}
          <aside
            className={`flex w-full shrink-0 flex-col border-white/10 bg-black/40 md:w-80 md:border-r ${
              mobileShowChat ? "hidden md:flex" : "flex"
            }`}
          >
            <div className="border-b border-white/10 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.25em] text-cyan-400">
                    FitCore AI
                  </p>
                  <h1 className="text-xl font-bold text-white">AI Coach</h1>
                </div>
                <button
                  type="button"
                  onClick={startNewThread}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300 transition hover:bg-cyan-500/30"
                  aria-label="New conversation"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {loadingThreads ? (
                <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
                  <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                  <p className="text-sm">Loading threads…</p>
                </div>
              ) : threadsError ? (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                  {threadsError}
                </p>
              ) : threads.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center">
                  <MessageSquare className="mx-auto h-8 w-8 text-gray-600" />
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400/90">
                    {SAAS_EMPTY.aiCoach.eyebrow}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-gray-300">
                    {SAAS_EMPTY.aiCoach.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {SAAS_EMPTY.aiCoach.description}
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {threads.map((t) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => openThread(t)}
                        className={`w-full rounded-2xl border p-3 text-left transition ${
                          t.id === activeThreadId
                            ? "border-cyan-500/40 bg-cyan-500/10"
                            : "border-white/10 bg-[#0b1224] hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center gap-2 text-sm font-semibold text-white">
                          <User className="h-3.5 w-3.5 shrink-0 text-gray-500" />
                          <span className="truncate">
                            {t.members?.full_name ?? "Member"}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-gray-400">
                          {t.last_message ?? t.topic}
                        </p>
                        <p className="mt-2 text-[10px] text-gray-600">
                          {formatThreadTime(t.last_active)}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>

          {/* Chat panel */}
          <section
            className={`flex min-h-0 min-w-0 flex-1 flex-col ${
              mobileShowChat ? "flex" : "hidden md:flex"
            }`}
          >
            <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <button
                type="button"
                onClick={() => setMobileShowChat(false)}
                className="rounded-xl p-2 text-gray-400 hover:bg-white/5 md:hidden"
                aria-label="Back to threads"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Sparkles className="hidden h-5 w-5 text-purple-300 sm:block" />
              <div className="min-w-0 flex-1">
                {activeThread ? (
                  <>
                    <p className="truncate font-semibold text-white">
                      {memberName}
                    </p>
                    <p className="truncate text-xs text-cyan-400">
                      {activeThread.topic}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-white">New conversation</p>
                    {!loadingMembers && members.length > 0 ? (
                      <select
                        value={selectedMemberId}
                        onChange={(e) => setSelectedMemberId(e.target.value)}
                        className={`${premiumSelectClass} mt-1 w-full max-w-xs`}
                      >
                        {members.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.full_name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-xs text-gray-500">Select member</p>
                    )}
                  </>
                )}
              </div>
            </header>

            <div
              ref={scrollRef}
              className="min-h-0 flex-1 overflow-y-auto p-4"
            >
              {!activeThreadId && messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-gray-500">
                  <Sparkles className="h-10 w-10 text-gray-700" />
                  <p className="mt-4 text-sm font-medium text-gray-400">
                    {loadingMembers
                      ? "Loading members…"
                      : members.length === 0
                        ? "Add members first"
                        : "Ask the AI Coach a question"}
                  </p>
                  <p className="mt-2 max-w-sm text-xs text-gray-600">
                    Workouts, nutrition, and progress are included automatically
                    as context.
                  </p>
                </div>
              ) : loadingMessages ? (
                <div className="flex items-center justify-center gap-2 py-20 text-gray-400">
                  <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                  <span className="text-sm">Loading messages…</span>
                </div>
              ) : messagesError ? (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                  {messagesError}
                </p>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                  <Sparkles className="h-8 w-8 text-gray-600" />
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400/90">
                    {SAAS_EMPTY.aiCoachThread.eyebrow}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-gray-300">
                    {SAAS_EMPTY.aiCoachThread.title}
                  </p>
                  <p className="mt-1 max-w-sm text-xs text-gray-500">
                    {SAAS_EMPTY.aiCoachThread.description}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((m) => (
                    <MessageBubble
                      key={m.id}
                      message={m}
                      memberId={
                        activeThread?.member_id ?? selectedMemberId
                      }
                      onSaved={(label) => setToast(label)}
                    />
                  ))}
                  {generating ? (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0b1224] px-4 py-3 text-sm text-gray-400">
                        <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                        AI is thinking…
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <footer className="border-t border-white/10 p-4">
              {sendError ? (
                <p className="mb-2 text-xs text-red-400">{sendError}</p>
              ) : null}
              <div className="flex gap-2 rounded-2xl border border-white/10 bg-[#0b1224] p-2">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message…"
                  rows={2}
                  disabled={generating || members.length === 0}
                  className={`${premiumTextareaClass} max-h-32 flex-1`}
                />
                <button
                  type="button"
                  onClick={() => void handleSend()}
                  disabled={!canSend}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black transition hover:scale-105 disabled:opacity-50"
                  aria-label="Send"
                >
                  {generating ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-center text-[10px] text-gray-600">
                Enter = send · Shift+Enter = new line
              </p>
            </footer>
          </section>
        </div>
      </div>

      {toast ? (
        <Toast title={toast} variant="success" onDismiss={() => setToast(null)} />
      ) : null}
    </ProtectedShell>
  )
}
