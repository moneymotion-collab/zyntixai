import type { ReactNode } from "react"

type SaasSectionHeaderProps = {
  title: string
  description?: ReactNode
  action?: ReactNode
  className?: string
}

export default function SaasSectionHeader({
  title,
  description,
  action,
  className = "",
}: SaasSectionHeaderProps) {
  return (
    <div
      className={`mb-5 flex flex-wrap items-end justify-between gap-4 sm:mb-6 ${className}`.trim()}
    >
      <div className="min-w-0">
        <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-400">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </div>
  )
}
