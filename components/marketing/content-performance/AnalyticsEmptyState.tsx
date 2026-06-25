import { BarChart3 } from "lucide-react"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"

export default function AnalyticsEmptyState({
  title = SAAS_EMPTY.marketingAnalytics.title,
  description = SAAS_EMPTY.marketingAnalytics.description,
}: {
  title?: string
  description?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-600">
        <BarChart3 className="h-8 w-8" />
      </div>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-violet-600/80">
        {SAAS_EMPTY.marketingAnalytics.eyebrow}
      </p>
      <p className="mt-2 max-w-md text-lg font-semibold text-slate-800">{title}</p>
      <p className="mt-2 max-w-sm text-sm font-medium text-slate-500">
        {description}
      </p>
    </div>
  )
}
