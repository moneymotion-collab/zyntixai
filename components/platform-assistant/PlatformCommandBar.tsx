"use client"

import { useEffect, useRef, useState } from "react"
import {
  AlertCircle,
  Clock3,
  Loader2,
  RotateCcw,
  Sparkles,
  WandSparkles,
} from "lucide-react"
import AnimatedModal, {
  useMountAnimatedModal,
} from "@/components/ui/animated-modal"
import { usePlatformAssistant } from "./PlatformAssistantProvider"

const SUGGESTED_ACTIONS = [
  "Create a workout plan",
  "Assign today's workout",
  "Schedule a session",
  "Show members at risk",
  "Summarize my dashboard",
  "Generate social content",
]

function CommandBarBody({ onClose }: { onClose: () => void }) {
  const {
    recentPrompts,
    messages,
    isLoading,
    error,
    submitPrompt,
    retryLast,
    clearError,
  } = usePlatformAssistant()

  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { open, requestClose, onExitComplete } = useMountAnimatedModal(onClose)

  const hasConversation = messages.length > 0

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, isLoading, error])

  const commitInput = () => {
    const value = input.trim()
    if (!value || isLoading) return
    clearError()
    setInput("")
    void submitPrompt(value)
  }

  const fillInput = (value: string) => {
    clearError()
    setInput(value)
    inputRef.current?.focus()
  }

  return (
    <AnimatedModal
      open={open}
      onClose={requestClose}
      onExitComplete={onExitComplete}
      ariaLabelledBy="zyntix-ai-command-title"
      panelClassName="flex max-h-[min(90dvh,720px)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f1a] shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
      backdropClassName="bg-black/70 backdrop-blur-sm"
    >
      <div className="shrink-0 border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300">
            <Sparkles className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2
              id="zyntix-ai-command-title"
              className="text-base font-semibold text-white"
            >
              ZyntixAI
            </h2>
            <p className="text-xs text-slate-500">
              Ask anything — responses are advisory only for now
            </p>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-4"
      >
        {!hasConversation && !isLoading && !error ? (
          <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] px-4 py-6 text-center">
            <Sparkles
              className="mx-auto mb-3 h-8 w-8 text-violet-400/70"
              aria-hidden
            />
            <p className="text-sm font-medium text-slate-200">
              Ask ZyntixAI anything
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              Get coaching ideas, workout suggestions, and platform guidance.
              Actions are not executed yet — this is read-only advice.
            </p>
          </div>
        ) : null}

        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === "user"
                ? "ml-6 rounded-2xl rounded-tr-md bg-violet-500/15 px-4 py-3 text-sm text-violet-50"
                : "mr-2 rounded-2xl rounded-tl-md border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-slate-200"
            }
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        ))}

        {isLoading ? (
          <div
            className="mr-2 flex items-center gap-2 rounded-2xl rounded-tl-md border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-slate-400"
            aria-live="polite"
            aria-busy="true"
          >
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
            ZyntixAI is thinking…
          </div>
        ) : null}

        {error ? (
          <div
            className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3"
            role="alert"
          >
            <div className="flex items-start gap-2">
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0 text-red-300"
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-red-100">
                  Could not get a response
                </p>
                <p className="mt-1 text-sm leading-relaxed text-red-200/80">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={() => void retryLast()}
                  disabled={isLoading}
                  className="saas-focus-ring mt-3 inline-flex items-center gap-1.5 rounded-lg border border-red-400/30 bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-100 transition hover:bg-red-500/25 disabled:opacity-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                  Try again
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {!hasConversation && !isLoading ? (
          <>
            <section aria-label="Recent prompts">
              <p className="mb-2.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                <Clock3 className="h-3.5 w-3.5" aria-hidden />
                Recent prompts
              </p>
              {recentPrompts.length > 0 ? (
                <ul className="space-y-1">
                  {recentPrompts.map((prompt) => (
                    <li key={prompt}>
                      <button
                        type="button"
                        onClick={() => fillInput(prompt)}
                        className="saas-focus-ring w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
                      >
                        {prompt}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] px-3 py-4 text-sm text-slate-500">
                  Your recent prompts will appear here.
                </p>
              )}
            </section>

            <section aria-label="Suggested actions">
              <p className="mb-2.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                <WandSparkles className="h-3.5 w-3.5" aria-hidden />
                Suggested actions
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_ACTIONS.map((action) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => fillInput(action)}
                    className="saas-focus-ring rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-left text-xs text-slate-300 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-100"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </section>
          </>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-white/[0.06] p-4">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            commitInput()
          }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask ZyntixAI anything..."
            disabled={isLoading}
            className="saas-input min-h-11 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white placeholder:text-slate-500 disabled:opacity-60"
            aria-label="Ask ZyntixAI"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              "Ask"
            )}
          </button>
        </form>
      </div>
    </AnimatedModal>
  )
}

export default function PlatformCommandBar() {
  const { isOpen, close } = usePlatformAssistant()
  if (!isOpen) return null
  return <CommandBarBody onClose={close} />
}
