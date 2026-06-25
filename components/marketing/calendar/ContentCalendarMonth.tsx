"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import type { CalendarCell } from "@/lib/marketing/calendar-utils"
import {
  getCalendarPostFormat,
  getCalendarPostStatus,
} from "@/lib/marketing/calendar-display"
import {
  CalendarFormatBadge,
  CalendarStatusBadge,
  getCalendarStatusBorderClass,
} from "@/components/marketing/calendar/CalendarBadges"

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const

export default function ContentCalendarMonth({
  cells,
  monthLabel,
  selectedDateKey,
  onSelectDate,
  onPreviousMonth,
  onNextMonth,
}: {
  cells: CalendarCell[]
  monthLabel: string
  selectedDateKey: string | null
  onSelectDate: (dateKey: string) => void
  onPreviousMonth: () => void
  onNextMonth: () => void
}) {
  return (
    <section className="overflow-hidden rounded-3xl border-2 border-gray-200 bg-white shadow-lg shadow-gray-200/50">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 via-white to-violet-50/40 px-6 py-6 sm:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-600">
            Monthly view
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {monthLabel}
          </h2>
        </div>

        <div className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm">
          <button
            type="button"
            onClick={onPreviousMonth}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="px-2 py-4 text-center text-sm font-bold uppercase tracking-wide text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 bg-white">
        {cells.map((cell) => {
          const dateKey = `${cell.date.getFullYear()}-${String(cell.date.getMonth() + 1).padStart(2, "0")}-${String(cell.date.getDate()).padStart(2, "0")}`
          const selected = selectedDateKey === dateKey
          const previewPost = cell.posts[0]
          const hiddenCount = cell.posts.length - (previewPost ? 1 : 0)

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onSelectDate(dateKey)}
              className={`group min-h-[152px] border-b border-r border-gray-100 p-3 text-left transition duration-200 sm:min-h-[172px] sm:p-4 ${
                cell.inMonth ? "bg-white" : "bg-gray-50/60"
              } ${
                selected
                  ? "bg-violet-50 ring-2 ring-inset ring-violet-400"
                  : "hover:bg-violet-50/40"
              }`}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-base font-bold transition ${
                    cell.isToday
                      ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/30"
                      : cell.inMonth
                        ? "text-gray-900 group-hover:bg-gray-100"
                        : "text-gray-400"
                  }`}
                >
                  {cell.date.getDate()}
                </span>
                {cell.posts.length > 0 ? (
                  <span className="rounded-full bg-violet-100 px-2.5 py-1 text-sm font-bold tabular-nums text-violet-700">
                    {cell.posts.length}
                  </span>
                ) : null}
              </div>

              {previewPost ? (
                (() => {
                  const format = getCalendarPostFormat(previewPost)
                  const status = getCalendarPostStatus(previewPost)

                  return (
                    <div
                      className={`rounded-2xl border-2 border-gray-200 border-l-4 bg-white p-3 shadow-sm ${getCalendarStatusBorderClass(status)}`}
                    >
                      <div className="flex flex-col gap-2">
                        <CalendarStatusBadge status={status} size="grid" />
                        <CalendarFormatBadge format={format} size="grid" />
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm font-semibold leading-snug text-gray-900">
                        {previewPost.hook}
                      </p>
                    </div>
                  )
                })()
              ) : null}

              {hiddenCount > 0 ? (
                <p className="mt-2 text-sm font-semibold text-violet-600">
                  +{hiddenCount} more
                </p>
              ) : null}
            </button>
          )
        })}
      </div>
    </section>
  )
}
