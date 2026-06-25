import type { ReactNode } from "react"
import {
  CalendarDays,
  Flame,
  Globe2,
  Layers,
  TrendingUp,
} from "lucide-react"
import type { MarketingPost } from "@/lib/marketing/get-mock-marketing-data"
import { getPlatformBadgeClass } from "@/lib/marketing/post-pipeline"
import {
  formatPostPublishDate,
  getPostContentTypeDisplay,
  getPostEstimatedReachDisplay,
  getPostPlatformDisplay,
  getPostViralScoreDisplay,
  getViralScoreAccent,
} from "@/lib/marketing/post-performance-preview"
import {
  VIDEO_METRIC_LABEL,
  VIDEO_METRIC_VALUE,
  VIDEO_SECTION_LABEL,
} from "@/components/marketing/scheduled/scheduled-video-styles"

type MetricCardProps = {
  label: string
  value: string
  sublabel?: string
  icon: ReactNode
  className?: string
  valueClassName?: string
}

function MetricCard({
  label,
  value,
  sublabel,
  icon,
  className = "border-gray-200/80 bg-gradient-to-br from-white to-gray-50/80",
  valueClassName = "text-gray-950",
}: MetricCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-7 shadow-[0_4px_24px_rgba(15,23,42,0.04)] sm:p-8 ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className={VIDEO_METRIC_LABEL}>{label}</p>
          <p className={`mt-3 ${VIDEO_METRIC_VALUE} ${valueClassName}`}>
            {value}
          </p>
          {sublabel ? (
            <p className="mt-2 text-base font-medium text-gray-500 sm:text-lg">
              {sublabel}
            </p>
          ) : null}
        </div>
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/90 shadow-sm ring-1 ring-gray-100 sm:h-16 sm:w-16">
          {icon}
        </div>
      </div>
    </div>
  )
}

export default function PostPerformancePreview({ post }: { post: MarketingPost }) {
  const viral = getPostViralScoreDisplay(post)
  const viralAccent = getViralScoreAccent(viral.tier)
  const publishDate = formatPostPublishDate(post)
  const contentType = getPostContentTypeDisplay(post)
  const platform = getPostPlatformDisplay(post)
  const estimatedReach = getPostEstimatedReachDisplay(post)
  const platformClass = getPlatformBadgeClass(platform)

  return (
    <section aria-label="Post performance preview">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className={`${VIDEO_SECTION_LABEL} text-violet-600`}>
            Performance preview
          </p>
          <h4 className="mt-2 text-xl font-bold text-gray-950 sm:text-2xl">
            Projected metrics at publish
          </h4>
        </div>
        <span className="inline-flex w-fit items-center rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-800 sm:text-base">
          AI forecast
        </span>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <MetricCard
          label="Viral Score"
          value={viral.value}
          sublabel={
            viral.tier ? `${viral.sublabel} · /100` : viral.sublabel
          }
          valueClassName={viralAccent.value}
          className={viralAccent.card}
          icon={<Flame className={`h-7 w-7 ${viralAccent.icon}`} />}
        />

        <MetricCard
          label="Estimated Reach"
          value={estimatedReach}
          sublabel="Projected impressions"
          valueClassName="text-violet-700"
          className="border-violet-200/70 bg-gradient-to-br from-violet-50/80 via-white to-indigo-50/30"
          icon={<TrendingUp className="h-7 w-7 text-violet-600" />}
        />

        <MetricCard
          label="Content Type"
          value={contentType}
          sublabel="Format"
          icon={<Layers className="h-7 w-7 text-slate-600" />}
        />

        <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white to-gray-50/80 p-7 shadow-[0_4px_24px_rgba(15,23,42,0.04)] sm:p-8">
          <p className={VIDEO_METRIC_LABEL}>Platform</p>
          <div className="mt-4">
            <span
              className={`inline-flex rounded-full border px-4 py-2 text-base font-semibold sm:text-lg ${platformClass}`}
            >
              {platform}
            </span>
          </div>
          <p className="mt-3 text-base font-medium text-gray-500 sm:text-lg">
            Distribution channel
          </p>
          <div className="absolute right-6 top-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 shadow-sm ring-1 ring-gray-100 sm:h-16 sm:w-16">
            <Globe2 className="h-7 w-7 text-gray-600" />
          </div>
        </div>

        <MetricCard
          label={publishDate.label}
          value={publishDate.date}
          sublabel={
            publishDate.time
              ? publishDate.time
              : "Set a schedule to publish"
          }
          valueClassName={publishDate.iso ? "text-gray-950" : "text-gray-400"}
          className="border-sky-200/70 bg-gradient-to-br from-sky-50/60 via-white to-cyan-50/30 sm:col-span-2"
          icon={<CalendarDays className="h-7 w-7 text-sky-600" />}
        />
      </div>
    </section>
  )
}
