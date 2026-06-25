import {
  BadgeCheck,
  CalendarClock,
  Clapperboard,
  Dumbbell,
  FilePenLine,
  GraduationCap,
  Layers,
  MessageSquareQuote,
  Radio,
  Salad,
  Sparkles,
  TrendingUp,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react"
import type { CalendarPostFormat, CalendarPostStatus } from "@/lib/marketing/calendar-types"
import {
  CALENDAR_FORMAT_STYLES,
  CALENDAR_STATUS_BORDER,
  CALENDAR_STATUS_LABELS,
  CALENDAR_STATUS_STYLES,
} from "@/lib/marketing/calendar-display"

const CONTENT_TYPE_ICONS: Record<CalendarPostFormat, LucideIcon> = {
  Reel: Clapperboard,
  Carousel: Layers,
  Story: Sparkles,
  Testimonial: MessageSquareQuote,
  Transformation: TrendingUp,
  Educational: GraduationCap,
  Nutrition: Salad,
  Workout: Dumbbell,
}

const STATUS_ICONS: Record<CalendarPostStatus, LucideIcon> = {
  draft: FilePenLine,
  approved: BadgeCheck,
  scheduled: CalendarClock,
  published: Radio,
  failed: TriangleAlert,
}

export function CalendarFormatBadge({
  format,
  size = "default",
}: {
  format: CalendarPostFormat
  size?: "compact" | "grid" | "default"
}) {
  const Icon = CONTENT_TYPE_ICONS[format]

  const sizeClasses =
    size === "compact"
      ? "gap-1 px-2 py-1 text-xs"
      : size === "grid"
        ? "gap-1.5 px-2.5 py-1 text-xs sm:text-sm"
        : "gap-2 px-3 py-1.5 text-sm"

  const iconWrapClasses =
    size === "compact"
      ? "h-4 w-4"
      : size === "grid"
        ? "h-5 w-5"
        : "h-5 w-5"

  const iconClasses =
    size === "compact"
      ? "h-3 w-3"
      : size === "grid"
        ? "h-3.5 w-3.5"
        : "h-4 w-4"

  return (
    <span
      className={`inline-flex items-center rounded-lg border-2 font-bold uppercase tracking-wide ${CALENDAR_FORMAT_STYLES[format]} ${sizeClasses}`}
    >
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded bg-white/20 ${iconWrapClasses}`}
      >
        <Icon className={iconClasses} strokeWidth={2.5} />
      </span>
      <span className="truncate">{format}</span>
    </span>
  )
}

export function CalendarStatusBadge({
  status,
  size = "default",
}: {
  status: CalendarPostStatus
  size?: "compact" | "grid" | "default"
}) {
  const Icon = STATUS_ICONS[status]

  const sizeClasses =
    size === "compact"
      ? "gap-1 px-2 py-1 text-xs"
      : size === "grid"
        ? "gap-1.5 px-2.5 py-1 text-xs sm:text-sm"
        : "gap-2 px-3 py-1.5 text-sm"

  const iconWrapClasses =
    size === "compact"
      ? "h-4 w-4"
      : size === "grid"
        ? "h-5 w-5"
        : "h-5 w-5"

  const iconClasses =
    size === "compact"
      ? "h-3 w-3"
      : size === "grid"
        ? "h-3.5 w-3.5"
        : "h-4 w-4"

  return (
    <span
      className={`inline-flex items-center rounded-lg border-2 font-bold uppercase tracking-wide ${CALENDAR_STATUS_STYLES[status]} ${sizeClasses}`}
      title={CALENDAR_STATUS_LABELS[status]}
    >
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded bg-white/20 ${iconWrapClasses}`}
      >
        <Icon className={iconClasses} strokeWidth={2.5} />
      </span>
      <span className="truncate">{CALENDAR_STATUS_LABELS[status]}</span>
    </span>
  )
}

export function getCalendarStatusBorderClass(status: CalendarPostStatus): string {
  return CALENDAR_STATUS_BORDER[status]
}

export function ContentTypeBadgeLegend() {
  const formats = Object.keys(CONTENT_TYPE_ICONS) as CalendarPostFormat[]

  return (
    <div className="flex flex-wrap gap-3">
      {formats.map((format) => (
        <CalendarFormatBadge key={format} format={format} size="default" />
      ))}
    </div>
  )
}

export function PostStatusBadgeLegend() {
  const statuses = Object.keys(STATUS_ICONS) as CalendarPostStatus[]

  return (
    <div className="flex flex-wrap gap-3">
      {statuses.map((status) => (
        <CalendarStatusBadge key={status} status={status} size="default" />
      ))}
    </div>
  )
}
