import { type ReactNode } from "react"
import type { SaasEmptyCopy } from "@/lib/copy/saas-empty-states"

type EmptyStateProps = SaasEmptyCopy & {
  action?: ReactNode
  icon?: ReactNode
  variant?: "dark" | "light"
  compact?: boolean
}

export default function EmptyState({
  eyebrow,
  title,
  description,
  action,
  icon,
  variant = "dark",
  compact = false,
}: EmptyStateProps) {
  const isDark = variant === "dark"

  return (
    <div
      className={
        isDark
          ? `glass-panel flex flex-col items-center text-center ring-1 ring-white/[0.06] ${
              compact ? "px-5 py-10 sm:px-8" : "px-6 py-12 sm:px-10 sm:py-16"
            }`
          : `flex flex-col items-center rounded-3xl border border-gray-200/90 bg-gradient-to-b from-white via-gray-50/80 to-white text-center shadow-[0_8px_40px_rgba(15,23,42,0.06)] ring-1 ring-gray-100 ${
              compact ? "px-5 py-10 sm:px-8" : "px-6 py-12 sm:px-10 sm:py-16"
            }`
      }
    >
      {icon ? (
        <div
          className={
            isDark
              ? "mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/25 via-violet-500/15 to-cyan-500/10 text-cyan-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_40px_rgba(99,102,241,0.12)]"
              : "mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-cyan-50 text-violet-600 shadow-sm"
          }
        >
          {icon}
        </div>
      ) : null}
      {eyebrow ? (
        <p
          className={
            isDark
              ? "text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400/90"
              : "text-xs font-semibold uppercase tracking-[0.22em] text-gray-500"
          }
        >
          {eyebrow}
        </p>
      ) : null}
      <h3
        className={`font-semibold ${eyebrow ? "mt-2" : ""} ${
          compact ? "text-base" : "text-lg"
        } ${isDark ? "text-white" : "text-gray-900"}`}
      >
        {title}
      </h3>
      <p
        className={`mt-2 max-w-md text-sm leading-relaxed ${
          isDark ? "text-slate-400" : "text-gray-600"
        }`}
      >
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
