import { CalendarClock, ChevronRight, Layers, Radio } from "lucide-react"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import PostStatusBadge from "@/app/components/PostStatusBadge"
import {
  VIDEO_SECTION_LABEL,
  VIDEO_SECTION_TITLE,
} from "@/components/marketing/scheduled/scheduled-video-styles"
import type { PublishingTimelineEntry } from "@/lib/marketing/publishing-timeline"
import { getPlatformBadgeClass } from "@/lib/marketing/post-pipeline"
import {
  PIPELINE_STAGE_COLORS,
  PIPELINE_STAGE_LABELS,
  type PipelineStage,
} from "@/lib/marketing/post-pipeline"

function PipelineStatusBadge({ stage }: { stage: PipelineStage }) {
  const colors = PIPELINE_STAGE_COLORS[stage]

  return (
    <span
      className={`inline-flex rounded-full border px-4 py-2 text-sm font-bold sm:text-base ${colors.active}`}
    >
      {PIPELINE_STAGE_LABELS[stage]}
    </span>
  )
}

function TimelineRow({
  entry,
  isLast,
  onSelect,
}: {
  entry: PublishingTimelineEntry
  isLast: boolean
  onSelect: (id: string) => void
}) {
  const platformClass = getPlatformBadgeClass(entry.platform)
  const dotColor = PIPELINE_STAGE_COLORS[entry.pipelineStage].track

  return (
    <li className="relative flex gap-6 sm:gap-8">
      {!isLast ? (
        <span
          className="absolute left-[1.65rem] top-16 hidden h-[calc(100%-2rem)] w-0.5 bg-gradient-to-b from-amber-300 via-violet-200 to-transparent sm:left-[1.85rem] sm:block"
          aria-hidden
        />
      ) : null}

      <div className="relative z-10 flex w-14 shrink-0 flex-col items-center sm:w-16">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white shadow-md ring-4 ring-amber-100 sm:h-14 sm:w-14 ${dotColor}`}
        >
          <CalendarClock className="h-6 w-6 text-white" strokeWidth={2.25} />
        </span>
      </div>

      <button
        type="button"
        onClick={() => onSelect(entry.id)}
        className="group mb-8 min-w-0 flex-1 rounded-3xl border border-gray-200/80 bg-white p-6 text-left shadow-[0_8px_32px_rgba(15,23,42,0.06)] transition hover:border-violet-200 hover:shadow-[0_12px_40px_rgba(15,23,42,0.1)] sm:p-8"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-lg font-bold text-gray-950 sm:text-xl">
                {entry.weekdayLabel}
              </p>
              {entry.isPast ? (
                <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-sm font-bold text-rose-700">
                  Due now
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-base font-semibold text-gray-600 sm:text-lg">
              {entry.dateLabel} · {entry.timeLabel}
            </p>

            <h3 className="mt-5 text-xl font-bold leading-snug text-gray-950 sm:text-2xl">
              {entry.title}
            </h3>
          </div>

          <span className="hidden text-gray-300 transition group-hover:text-violet-500 lg:inline">
            <ChevronRight className="h-8 w-8" />
          </span>
        </div>

        <div className="mt-6 grid gap-4 border-t border-gray-100 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className={VIDEO_SECTION_LABEL}>Date</p>
            <p className="mt-2 text-base font-bold text-gray-900 sm:text-lg">
              {entry.dateLabel}
            </p>
            <p className="mt-1 text-sm font-medium text-gray-500 sm:text-base">
              {entry.timeLabel}
            </p>
          </div>

          <div>
            <p className={VIDEO_SECTION_LABEL}>Platform</p>
            <div className="mt-2">
              <span
                className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold sm:text-base ${platformClass}`}
              >
                {entry.platform}
              </span>
            </div>
          </div>

          <div>
            <p className={VIDEO_SECTION_LABEL}>Content type</p>
            <p className="mt-2 flex items-center gap-2 text-base font-bold text-gray-900 sm:text-lg">
              <Layers className="h-5 w-5 text-gray-400" />
              {entry.contentType}
            </p>
          </div>

          <div>
            <p className={VIDEO_SECTION_LABEL}>Status</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <PipelineStatusBadge stage={entry.pipelineStage} />
              <PostStatusBadge status={entry.status} large />
            </div>
          </div>
        </div>
      </button>
    </li>
  )
}

export default function PublishingTimeline({
  entries,
  onSelectPost,
}: {
  entries: PublishingTimelineEntry[]
  onSelectPost?: (id: string) => void
}) {
  function handleSelect(id: string) {
    onSelectPost?.(id)
    document
      .getElementById(`post-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border-2 border-gray-200/80 bg-gradient-to-br from-white via-white to-amber-50/20 shadow-[0_12px_48px_rgba(15,23,42,0.06)]">
      <div className="border-b border-gray-100 bg-gradient-to-r from-amber-50/50 via-white to-violet-50/40 px-8 py-7 sm:px-10 sm:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className={`${VIDEO_SECTION_LABEL} text-amber-700`}>
              Publishing timeline
            </p>
            <h2 className={`mt-3 ${VIDEO_SECTION_TITLE}`}>
              Upcoming scheduled content
            </h2>
            <p className="mt-3 text-lg font-medium text-gray-500 sm:text-xl">
              Chronological view of what publishes next
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-5 py-2.5 text-base font-bold text-amber-900 sm:text-lg">
            <Radio className="h-5 w-5" />
            {entries.length} upcoming
          </div>
        </div>
      </div>

      <div className="px-6 py-8 sm:px-10 sm:py-10">
        {entries.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50/80 px-8 py-14 text-center">
            <CalendarClock className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
              {SAAS_EMPTY.scheduledPosts.eyebrow}
            </p>
            <p className="mt-2 text-xl font-bold text-gray-900">
              {SAAS_EMPTY.scheduledPosts.title}
            </p>
            <p className="mt-2 text-lg text-gray-500">
              {SAAS_EMPTY.scheduledPosts.description}
            </p>
          </div>
        ) : (
          <ol className="space-y-0">
            {entries.map((entry, index) => (
              <TimelineRow
                key={entry.id}
                entry={entry}
                isLast={index === entries.length - 1}
                onSelect={handleSelect}
              />
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}
