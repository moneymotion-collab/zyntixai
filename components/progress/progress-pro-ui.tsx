"use client"

import type { ReactNode } from "react"

export const PROGRESS_PRO_CARD =
  "rounded-3xl border border-white/10 bg-white/5 transition-colors duration-200"

export const PROGRESS_PRO_CARD_INNER =
  "rounded-2xl border border-white/10 bg-[#0b1224]/50"

export const PROGRESS_PRO_BTN_PRIMARY = "btn-gradient"

export const PROGRESS_PRO_BTN_SECONDARY =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-gray-200 transition hover:border-white/20 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"

type ProgressProSectionHeaderProps = {
  eyebrow: string
  title: string
  description?: string
  action?: ReactNode
  accent?: "cyan" | "violet" | "emerald" | "amber"
}

const ACCENT_TEXT = {
  cyan: "text-cyan-400",
  violet: "text-violet-400",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
} as const

export function ProgressProSectionHeader({
  eyebrow,
  title,
  description,
  action,
  accent = "cyan",
}: ProgressProSectionHeaderProps) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4 sm:mb-6">
      <div className="min-w-0 flex-1">
        <p
          className={`text-xs font-medium uppercase tracking-[0.25em] ${ACCENT_TEXT[accent]}`}
        >
          {eyebrow}
        </p>
        <h3 className="mt-2 text-xl font-bold text-white sm:text-2xl">{title}</h3>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-gray-400">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export function ProgressProCard({
  children,
  className = "",
  padding = "p-6 sm:p-8",
}: {
  children: ReactNode
  className?: string
  padding?: string
}) {
  return (
    <div className={`${PROGRESS_PRO_CARD} ${padding} ${className}`}>{children}</div>
  )
}

export function ProgressProSuccessBanner({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 transition-all sm:px-5">
      <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
      <div>
        <p className="font-medium text-emerald-200">{title}</p>
        {description ? (
          <p className="mt-1 text-sm text-emerald-300/80">{description}</p>
        ) : null}
      </div>
    </div>
  )
}
