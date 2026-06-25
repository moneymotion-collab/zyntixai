"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useCallback, useEffect, useState } from "react"
import { CheckCircle2, X, XCircle } from "lucide-react"

export type ToastVariant = "success" | "error"

export type ToastPayload = {
  title: string
  description?: string
  variant?: ToastVariant
}

type ToastProps = ToastPayload & {
  /** @deprecated Use `title` instead */
  message?: string
  variant?: ToastVariant
  onDismiss: () => void
  durationMs?: number
}

const ENTER = { opacity: 0, y: 12, scale: 0.98 }
const VISIBLE = { opacity: 1, y: 0, scale: 1 }
const EXIT = { opacity: 0, y: 8, scale: 0.98 }

export default function Toast({
  message,
  title,
  description,
  variant = "success",
  onDismiss,
  durationMs = 4500,
}: ToastProps) {
  const resolvedTitle = title ?? message ?? ""
  const isSuccess = variant === "success"
  const prefersReducedMotion = useReducedMotion()
  const [open, setOpen] = useState(true)

  const dismiss = useCallback(() => {
    setOpen(false)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(dismiss, durationMs)
    return () => window.clearTimeout(timer)
  }, [dismiss, durationMs, resolvedTitle, description])

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as const }

  const Icon = isSuccess ? CheckCircle2 : XCircle

  return (
    <AnimatePresence onExitComplete={onDismiss}>
      {open ? (
        <motion.div
          role="status"
          aria-live="polite"
          initial={prefersReducedMotion ? VISIBLE : ENTER}
          animate={VISIBLE}
          exit={prefersReducedMotion ? VISIBLE : EXIT}
          transition={transition}
          className={`pointer-events-auto fixed bottom-6 right-6 z-[100] w-[min(100vw-2rem,24rem)] overflow-hidden rounded-2xl border shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl ${
            isSuccess
              ? "border-emerald-400/25 bg-gradient-to-br from-emerald-500/20 via-[#0b1224]/95 to-[#0b1224]/95"
              : "border-red-400/25 bg-gradient-to-br from-red-500/20 via-[#0b1224]/95 to-[#0b1224]/95"
          }`}
        >
          <div
            className={`pointer-events-none absolute inset-x-0 top-0 h-px ${
              isSuccess
                ? "bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"
                : "bg-gradient-to-r from-transparent via-red-400/60 to-transparent"
            }`}
            aria-hidden="true"
          />

          <div className="flex items-start gap-3 p-4">
            <motion.div
              initial={
                prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }
              }
              animate={{ opacity: 1, scale: 1 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { delay: 0.06, duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }
              }
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${
                isSuccess
                  ? "border-emerald-400/25 bg-emerald-500/20 text-emerald-300"
                  : "border-red-400/20 bg-red-500/15 text-red-300"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </motion.div>

            <div className="min-w-0 flex-1 pt-0.5">
              <p
                className={`text-sm font-semibold ${
                  isSuccess ? "text-emerald-50" : "text-red-50"
                }`}
              >
                {resolvedTitle}
              </p>
              {description ? (
                <p
                  className={`mt-1 text-sm leading-relaxed ${
                    isSuccess ? "text-emerald-100/75" : "text-red-100/75"
                  }`}
                >
                  {description}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={dismiss}
              className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-white/5 hover:text-white"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
