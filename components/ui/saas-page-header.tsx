import type { ReactNode } from "react"

type SaasPageHeaderProps = {
  eyebrow: string
  title: string
  description?: string
  action?: ReactNode
  className?: string
  accent?: "cyan" | "emerald" | "violet" | "indigo"
}

const ACCENT_CLASS = {
  cyan: "text-cyan-400",
  emerald: "text-emerald-400",
  violet: "text-violet-400",
  indigo: "text-indigo-400",
} as const

export default function SaasPageHeader({
  eyebrow,
  title,
  description,
  action,
  className = "",
  accent = "cyan",
}: SaasPageHeaderProps) {
  return (
    <header
      className={`mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className}`.trim()}
    >
      <div className="min-w-0 flex-1">
        <p
          className={`text-xs font-medium uppercase tracking-[0.25em] sm:text-sm sm:tracking-[0.3em] ${ACCENT_CLASS[accent]}`}
        >
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <div className="flex w-full shrink-0 flex-wrap items-center gap-3 sm:w-auto sm:justify-end">
          {action}
        </div>
      ) : null}
    </header>
  )
}
