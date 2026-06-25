"use client"

import type { ReactNode } from "react"
import type { SaasEmptyCopy } from "@/lib/copy/saas-empty-states"

type ProgressEmptyStateProps = SaasEmptyCopy & {
  icon?: ReactNode
  action?: ReactNode
  compact?: boolean
}

export default function ProgressEmptyState({
  eyebrow,
  title,
  description,
  icon,
  action,
  compact = false,
}: ProgressEmptyStateProps) {
  return (
    <div
      className={`rounded-3xl border border-dashed border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent text-center transition-colors duration-200 hover:border-cyan-400/20 hover:from-cyan-500/[0.04] ${
        compact ? "px-4 py-10" : "px-6 py-16"
      }`}
    >
      {icon ? (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/15 to-cyan-500/10 text-cyan-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          {icon}
        </div>
      ) : null}
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400/90">
          {eyebrow}
        </p>
      ) : null}
      <p
        className={`font-semibold text-white ${eyebrow ? "mt-2" : ""} ${
          compact ? "text-sm" : "text-base"
        }`}
      >
        {title}
      </p>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
