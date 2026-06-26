import type { ReactNode } from "react"

import { saasChartCardClass } from "@/lib/ui/saas-tokens"

type ChartCardProps = {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
  action?: ReactNode
}

export default function ChartCard({
  title,
  subtitle,
  children,
  className = "",
  action,
}: ChartCardProps) {
  return (
    <section className={`${saasChartCardClass} ${className}`.trim()}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="rounded-xl border border-white/[0.06] bg-[#0b1224]/80 p-3 sm:p-4">
        {children}
      </div>
    </section>
  )
}
