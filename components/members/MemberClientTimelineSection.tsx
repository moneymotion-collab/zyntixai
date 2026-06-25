"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { LucideIcon } from "lucide-react"
import {
  Bell,
  CalendarClock,
  Camera,
  ClipboardList,
  Dumbbell,
  Flag,
  History,
  Loader2,
  Repeat,
  Salad,
  TrendingUp,
} from "lucide-react"
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import EmptyState from "@/components/ui/empty-state"
import ErrorStateBanner from "@/components/ui/error-state-banner"
import SectionLoadingState from "@/components/ui/section-loading-state"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import { reportSupabaseError } from "@/lib/errors/reportSupabaseError"
import {
  CLIENT_TIMELINE_FILTER_OPTIONS,
  clientTimelineTypeLabel,
  fetchMemberClientTimeline,
  filterTimelineItems,
  formatTimelineDate,
  paginateTimelineItems,
  TIMELINE_DEFAULT_LIMIT,
} from "@/lib/members/member-client-timeline"
import type {
  ClientTimelineFilter,
  ClientTimelineItem,
} from "@/lib/types/client-timeline"
import { createClient } from "@/lib/supabase/client"

type MemberClientTimelineSectionProps = {
  memberId: string
  refreshKey?: number
}

const TYPE_ICON: Record<string, LucideIcon> = {
  workout_assignment: Dumbbell,
  workout_completion: Dumbbell,
  nutrition_assignment: Salad,
  progress_log: TrendingUp,
  goal: Flag,
  check_in: ClipboardList,
  progress_photo: Camera,
  note: ClipboardList,
  habit: Repeat,
  reminder: Bell,
  session: CalendarClock,
}

const TYPE_BADGE_CLASS: Record<string, string> = {
  workout_assignment: "border-cyan-200 bg-cyan-50 text-cyan-800",
  workout_completion: "border-emerald-200 bg-emerald-50 text-emerald-800",
  nutrition_assignment: "border-lime-200 bg-lime-50 text-lime-800",
  progress_log: "border-amber-200 bg-amber-50 text-amber-800",
  goal: "border-violet-200 bg-violet-50 text-violet-800",
  check_in: "border-sky-200 bg-sky-50 text-sky-800",
  progress_photo: "border-pink-200 bg-pink-50 text-pink-800",
  note: "border-slate-300 bg-slate-100 text-slate-800",
  habit: "border-indigo-200 bg-indigo-50 text-indigo-800",
  reminder: "border-orange-200 bg-orange-50 text-orange-800",
  session: "border-teal-200 bg-teal-50 text-teal-800",
}

function TimelineTypeBadge({ type }: { type: string }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
        TYPE_BADGE_CLASS[type] ?? "border-gray-200 bg-gray-50 text-gray-700"
      }`}
    >
      {clientTimelineTypeLabel(type)}
    </span>
  )
}

function TimelineEntry({ item }: { item: ClientTimelineItem }) {
  const Icon = TYPE_ICON[item.type] ?? History

  return (
    <li className="relative flex gap-4 pb-8 last:pb-0">
      <div className="relative flex flex-col items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
          <Icon className="h-4 w-4 text-cyan-700" aria-hidden />
        </div>
        <div className="mt-2 h-full w-px flex-1 bg-gray-200" aria-hidden />
      </div>

      <article className="min-w-0 flex-1 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-black">{item.title}</h3>
              <TimelineTypeBadge type={item.type} />
              {item.status ? (
                <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                  {item.status}
                </span>
              ) : null}
            </div>
            <p className="text-xs font-medium text-gray-500">
              {formatTimelineDate(item.date)}
            </p>
          </div>
        </div>

        {item.description ? (
          <p className="mt-3 text-sm leading-relaxed text-gray-700">
            {item.description}
          </p>
        ) : null}
      </article>
    </li>
  )
}

export default function MemberClientTimelineSection({
  memberId,
  refreshKey = 0,
}: MemberClientTimelineSectionProps) {
  const supabase = createClient()

  const [items, setItems] = useState<ClientTimelineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<ClientTimelineFilter>("all")
  const [visibleCount, setVisibleCount] = useState(TIMELINE_DEFAULT_LIMIT)

  const loadTimeline = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)

    const result = await fetchMemberClientTimeline(supabase, memberId)

    if (result.error) {
      reportSupabaseError("[client_timeline] load failed", result.error, {
        setError: setErrorMessage,
      })
      setItems([])
    } else {
      setItems(result.items)
    }

    setLoading(false)
  }, [memberId, supabase])

  useEffect(() => {
    void loadTimeline()
  }, [loadTimeline, refreshKey])

  useEffect(() => {
    setVisibleCount(TIMELINE_DEFAULT_LIMIT)
  }, [activeFilter, refreshKey])

  const filteredItems = useMemo(
    () => filterTimelineItems(items, activeFilter),
    [activeFilter, items],
  )

  const { visible, hasMore } = useMemo(
    () => paginateTimelineItems(filteredItems, visibleCount),
    [filteredItems, visibleCount],
  )

  return (
    <Card variant="light">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
            C8 Client Timeline
          </p>
          <CardTitle className="mt-1">Activity Timeline</CardTitle>
          <p className="mt-2 text-sm text-gray-600">
            Unified activity feed across workouts, nutrition, progress, check-ins,
            photos, notes, habits, reminders, and sessions.
          </p>
        </div>
        <History className="hidden h-8 w-8 text-cyan-600 sm:block" aria-hidden />
      </CardHeader>

      <CardContent className="space-y-6">
        {errorMessage ? (
          <ErrorStateBanner
            variant="light"
            title="Could not load timeline"
            message={errorMessage}
            onRetry={() => void loadTimeline()}
            embedded
          />
        ) : null}

        <div className="flex flex-wrap gap-2">
          {CLIENT_TIMELINE_FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setActiveFilter(option.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                activeFilter === option.value
                  ? "border-black bg-black text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {loading ? (
          <SectionLoadingState label="Loading timeline" rows={5} />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            {...(items.length === 0
              ? SAAS_EMPTY.memberTimeline
              : SAAS_EMPTY.memberTimelineFiltered)}
            variant="light"
            compact
          />
        ) : (
          <>
            <ol className="space-y-0">
              {visible.map((item) => (
                <TimelineEntry key={item.id} item={item} />
              ))}
            </ol>

            {hasMore ? (
              <button
                type="button"
                onClick={() =>
                  setVisibleCount((count) => count + TIMELINE_DEFAULT_LIMIT)
                }
                className="rounded-2xl border border-black px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-50"
              >
                Show more
              </button>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  )
}
