"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/app/providers/AuthProvider"
import { isPublicAppPath } from "@/lib/navigation/is-public-path"
import {
  appendRecentPrompt,
  readRecentPrompts,
} from "@/lib/platform-assistant/recent-prompts-storage"
import { resolvePageContext } from "@/lib/platform-assistant/resolve-page-context"
import type {
  CommandBarChatResponse,
  PlatformChatMessage,
} from "@/lib/platform-assistant/types"

type PlatformAssistantContextValue = {
  isAvailable: boolean
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
  recentPrompts: string[]
  rememberPrompt: (prompt: string) => void
  messages: PlatformChatMessage[]
  isLoading: boolean
  error: string | null
  submitPrompt: (prompt: string) => Promise<void>
  retryLast: () => Promise<void>
  clearError: () => void
}

const PlatformAssistantContext =
  createContext<PlatformAssistantContextValue | null>(null)

function newMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function PlatformAssistantProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { loading: authLoading, user, role } = useAuth()

  const [isOpen, setIsOpen] = useState(false)
  const [recentPrompts, setRecentPrompts] = useState<string[]>([])
  const [messages, setMessages] = useState<PlatformChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const messagesRef = useRef(messages)
  messagesRef.current = messages

  const enabled =
    !authLoading && Boolean(user) && Boolean(role) && !isPublicAppPath(pathname)

  useEffect(() => {
    setRecentPrompts(readRecentPrompts())
  }, [])

  const open = useCallback(() => {
    if (!enabled) return
    setIsOpen(true)
  }, [enabled])

  const close = useCallback(() => setIsOpen(false), [])

  const toggle = useCallback(() => {
    if (!enabled) return
    setIsOpen((current) => !current)
  }, [enabled])

  const rememberPrompt = useCallback((prompt: string) => {
    const trimmed = prompt.trim()
    if (!trimmed) return
    setRecentPrompts(appendRecentPrompt(trimmed))
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const sendToApi = useCallback(
    async (
      prompt: string,
      history: PlatformChatMessage[],
      options: { appendUserMessage: boolean },
    ) => {
      const trimmed = prompt.trim()
      if (!trimmed || !enabled) return

      setError(null)
      setIsLoading(true)

      let nextMessages = history

      if (options.appendUserMessage) {
        const userMessage: PlatformChatMessage = {
          id: newMessageId(),
          role: "user",
          content: trimmed,
          timestamp: Date.now(),
        }
        nextMessages = [...history, userMessage]
        setMessages(nextMessages)
        rememberPrompt(trimmed)
      }

      try {
        const pageContext = resolvePageContext(pathname ?? "/dashboard")
        const res = await fetch("/api/platform-assistant/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: trimmed,
            history: nextMessages
              .filter((message) => message.role !== "system")
              .slice(0, options.appendUserMessage ? -1 : undefined)
              .map((message) => ({
                role: message.role as "user" | "assistant",
                content: message.content,
              })),
            pageContext,
          }),
        })

        const data = (await res.json()) as CommandBarChatResponse & {
          error?: string
        }

        if (!res.ok) {
          throw new Error(data.error ?? "Could not get a response from ZyntixAI.")
        }

        const assistantMessage: PlatformChatMessage = {
          id: newMessageId(),
          role: "assistant",
          content: data.reply,
          timestamp: Date.now(),
        }

        setMessages((current) => [...current, assistantMessage])
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Could not reach ZyntixAI."
        setError(message)
      } finally {
        setIsLoading(false)
      }
    },
    [enabled, pathname, rememberPrompt],
  )

  const submitPrompt = useCallback(
    async (prompt: string) => {
      if (isLoading) return
      await sendToApi(prompt, messagesRef.current, { appendUserMessage: true })
    },
    [isLoading, sendToApi],
  )

  const retryLast = useCallback(async () => {
    if (isLoading) return

    const current = messagesRef.current
    const lastUser = [...current].reverse().find((message) => message.role === "user")
    if (!lastUser) return

    const historyBefore = current.slice(
      0,
      current.findIndex((message) => message.id === lastUser.id),
    )

    await sendToApi(lastUser.content, historyBefore, { appendUserMessage: false })
  }, [isLoading, sendToApi])

  useEffect(() => {
    if (!enabled) return

    const onKeyDown = (event: KeyboardEvent) => {
      const isK = event.key.toLowerCase() === "k"
      const modifier = event.ctrlKey || event.metaKey
      if (!modifier || !isK) return

      event.preventDefault()
      toggle()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [enabled, toggle])

  const value = useMemo<PlatformAssistantContextValue>(
    () => ({
      isAvailable: enabled,
      isOpen,
      open,
      close,
      toggle,
      recentPrompts,
      rememberPrompt,
      messages,
      isLoading,
      error,
      submitPrompt,
      retryLast,
      clearError,
    }),
    [
      enabled,
      isOpen,
      open,
      close,
      toggle,
      recentPrompts,
      rememberPrompt,
      messages,
      isLoading,
      error,
      submitPrompt,
      retryLast,
      clearError,
    ],
  )

  return (
    <PlatformAssistantContext.Provider value={value}>
      {children}
    </PlatformAssistantContext.Provider>
  )
}

export function usePlatformAssistant(): PlatformAssistantContextValue {
  const context = useContext(PlatformAssistantContext)
  if (!context) {
    throw new Error(
      "usePlatformAssistant must be used within PlatformAssistantProvider",
    )
  }
  return context
}
