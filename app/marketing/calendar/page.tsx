"use client"

import { useEffect, useMemo, useState } from "react"
import { Calendar, Loader2, Zap } from "lucide-react"
import ProtectedShell from "@/app/components/ProtectedShell"
import { useMarketingCoreChanged } from "@/app/hooks/useMarketingCoreChanged"
import SaasEmptyState from "@/components/ui/saas-empty-state"
import Toast, { type ToastPayload } from "@/app/components/Toast"
import { successToast } from "@/lib/copy/success-toasts"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import AiPlanningSummarySection from "@/components/marketing/calendar/AiPlanningSummary"
import AiRecommendationsSection from "@/components/marketing/calendar/AiRecommendations"
import CalendarDayPanel from "@/components/marketing/calendar/CalendarDayPanel"
import { ContentTypeBadgeLegend, PostStatusBadgeLegend } from "@/components/marketing/calendar/CalendarBadges"
import CalendarSummaryBar from "@/components/marketing/calendar/CalendarSummaryBar"
import ContentCalendarMonth from "@/components/marketing/calendar/ContentCalendarMonth"
import { buildAiPlanningSummary, buildAiRecommendations } from "@/lib/marketing/calendar-ai-planning"
import {
  buildCalendarSummary,
  getCalendarPostStatus,
} from "@/lib/marketing/calendar-display"
import type { CalendarPost } from "@/lib/marketing/calendar-types"
import {
  canApproveCalendarPost,
  canPublishCalendarPostToInstagram,
  canScheduleCalendarPost,
  confirmInstagramPublishWithoutApproval,
} from "@/lib/marketing/post-eligibility"
import {
  addMonths,
  buildMonthGrid,
  formatMonthYear,
  groupPostsByDay,
  startOfMonth,
  toDateKey,
} from "@/lib/marketing/calendar-utils"
import { useIsDemoWorkspace } from "@/app/hooks/useIsDemoWorkspace"
import { buildMockCalendarPosts } from "@/lib/marketing/mock-calendar-posts"
import {
  buildAiSuggestedScheduledFor,
  resolveScheduledFor,
} from "@/lib/marketing/posting-times"
import { schedulePost } from "@/lib/marketing/schedule-post"
import { notifyMarketingCoreChanged } from "@/lib/marketing/notify"

function normalizeApiPost(post: CalendarPost): CalendarPost {
  return {
    ...post,
    post_type: post.post_type?.trim() || "Reel",
  }
}

export default function CalendarPage() {
  const { isDemoWorkspace: demoMode, loading: demoLoading } = useIsDemoWorkspace()
  const [posts, setPosts] = useState<CalendarPost[]>([])
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()))
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(() =>
    toDateKey(new Date()),
  )
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastPayload | null>(null)
  const [scheduleInputs, setScheduleInputs] = useState<Record<string, string>>({})
  const [schedulingId, setSchedulingId] = useState<string | null>(null)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [publishingId, setPublishingId] = useState<string | null>(null)
  const [hasInstagramConnection, setHasInstagramConnection] = useState(false)

  useEffect(() => {
    if (demoLoading) return

    if (demoMode) {
      setPosts(buildMockCalendarPosts())
      setLoading(false)
      return
    }

    void fetchPosts()
  }, [demoMode, demoLoading])

  useEffect(() => {
    async function loadInstagramConnection() {
      try {
        const res = await fetch("/api/instagram/connection", {
          credentials: "include",
        })
        const data = (await res.json()) as {
          connection?: unknown | null
          status?: "connected" | "token_expiring_soon" | "reconnect_required" | "disconnected"
        }
        setHasInstagramConnection(
          res.ok &&
            (data.status === "connected" ||
              data.status === "token_expiring_soon"),
        )
      } catch {
        setHasInstagramConnection(false)
      }
    }

    void loadInstagramConnection()
  }, [])

  useMarketingCoreChanged(() => {
    if (demoLoading || demoMode) return
    void fetchPosts()
  }, !demoLoading)

  const postsByDay = useMemo(() => groupPostsByDay(posts), [posts])
  const monthCells = useMemo(
    () => buildMonthGrid(visibleMonth, postsByDay),
    [visibleMonth, postsByDay],
  )

  const summary = useMemo(() => buildCalendarSummary(posts), [posts])

  const aiPlanning = useMemo(
    () => buildAiPlanningSummary(posts, summary.estimatedReach),
    [posts, summary.estimatedReach],
  )

  const aiRecommendations = useMemo(
    () => buildAiRecommendations(posts),
    [posts],
  )

  const selectedPosts = useMemo(() => {
    if (!selectedDateKey) return []
    return postsByDay.get(selectedDateKey) ?? []
  }, [postsByDay, selectedDateKey])

  const selectedDateLabel = useMemo(() => {
    if (!selectedDateKey) return "Select a day"
    const date = new Date(`${selectedDateKey}T12:00:00`)
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }, [selectedDateKey])

  async function fetchPosts() {
    setLoading(true)
    setErrorMessage(null)
    setToast(null)

    try {
      const res = await fetch("/api/marketing/get-posts", {
        credentials: "include",
      })
      const data = (await res.json()) as CalendarPost[] | { error?: string }

      if (!res.ok) {
        setErrorMessage(
          "error" in data ? (data.error ?? "Could not load posts.") : "Could not load posts.",
        )
        setPosts([])
        return
      }

      setPosts(
        Array.isArray(data) ? data.map((post) => normalizeApiPost(post)) : [],
      )
    } catch {
      setErrorMessage("Could not load posts.")
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  function shouldShowApprove(post: CalendarPost) {
    return canApproveCalendarPost(post)
  }

  function shouldShowSchedule(post: CalendarPost) {
    return canScheduleCalendarPost(post)
  }

  function shouldShowInstagramPublish(post: CalendarPost) {
    return canPublishCalendarPostToInstagram(post, hasInstagramConnection)
  }

  async function handleApprovePost(id: string) {
    const post = posts.find((item) => item.id === id)
    if (!post || !shouldShowApprove(post)) return

    setApprovingId(id)
    setErrorMessage(null)
    setToast(null)

    if (demoMode) {
      setPosts((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, viral_status: "approved", status: "approved" }
            : item,
        ),
      )
      setToast(successToast("postApproved"))
      notifyMarketingCoreChanged()
      setApprovingId(null)
      return
    }

    try {
      const res = await fetch("/api/content/update", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          viral_status: "approved",
        }),
      })

      const payload = (await res.json()) as {
        data?: { viral_status?: string | null } | null
        error?: { message?: string } | null
      }

      if (!res.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "Could not approve post.")
      }

      setPosts((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                viral_status: payload.data!.viral_status ?? "approved",
                status: "approved",
              }
            : item,
        ),
      )
      setToast(successToast("postApproved"))
      notifyMarketingCoreChanged()
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Could not approve post.",
      )
    } finally {
      setApprovingId(null)
    }
  }

  async function handlePublishToInstagram(id: string) {
    const post = posts.find((item) => item.id === id)
    if (!post) return
    if (!shouldShowInstagramPublish(post)) return

    const displayStatus = getCalendarPostStatus(post)
    if (
      !confirmInstagramPublishWithoutApproval(
        post.viral_status,
        displayStatus === "scheduled",
      )
    ) {
      return
    }

    setPublishingId(id)
    setErrorMessage(null)
    setToast(null)

    if (demoMode) {
      setPosts((current) =>
        current.map((item) =>
          item.id === id ? { ...item, status: "published" } : item,
        ),
      )
      setToast(successToast("instagramPublished"))
      notifyMarketingCoreChanged()
      setPublishingId(null)
      return
    }

    try {
      const res = await fetch("/api/instagram/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ contentPostId: id }),
      })
      const payload = (await res.json()) as { error?: { message?: string } | null }

      if (!res.ok) {
        throw new Error(payload.error?.message ?? "Could not publish to Instagram.")
      }

      setToast(successToast("instagramPublished"))
      notifyMarketingCoreChanged()
      await fetchPosts()
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Could not publish to Instagram.",
      )
    } finally {
      setPublishingId(null)
    }
  }

  async function handleSchedulePost(id: string) {
    const post = posts.find((item) => item.id === id)
    if (!post || !shouldShowSchedule(post)) return

    const userSelectedTime = scheduleInputs[id] || null
    const aiSuggestedTime = userSelectedTime
      ? null
      : post.scheduled_date ?? buildAiSuggestedScheduledFor(post.platform)
    const scheduled_for = resolveScheduledFor(aiSuggestedTime, userSelectedTime)

    if (!scheduled_for) return

    setSchedulingId(id)
    setErrorMessage(null)

    if (demoMode) {
      setPosts((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, status: "scheduled", scheduled_date: scheduled_for }
            : item,
        ),
      )
      setToast(successToast("postScheduled"))
      notifyMarketingCoreChanged()
      setSchedulingId(null)
      return
    }

    try {
      await schedulePost(id, scheduled_for, "scheduled")
      await fetchPosts()
      setToast(successToast("postScheduled"))
      notifyMarketingCoreChanged()
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Could not schedule post.",
      )
    } finally {
      setSchedulingId(null)
    }
  }

  function handleOptimizedApplied(
    postId: string,
    applied: { title: string; caption: string; hashtags: string },
  ) {
    setPosts((current) =>
      current.map((item) =>
        item.id === postId
          ? {
              ...item,
              hook: applied.title,
              content: [applied.caption, applied.hashtags]
                .filter(Boolean)
                .join("\n\n"),
            }
          : item,
      ),
    )
    setToast(successToast("postOptimized"))
  }

  return (
    <ProtectedShell allowed={["admin", "coach"]}>
      <div className="min-h-full overflow-x-hidden bg-gradient-to-b from-slate-50 via-white to-violet-50/20">
        <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <header className="mb-12">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-600">
                  Marketing AI
                </p>
                <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                  Content Calendar
                </h1>
                <p className="mt-4 text-lg leading-relaxed text-gray-600 sm:text-xl">
                  Plan reels, carousels, and stories across the month — review
                  status, timing, and publishing in one place.
                </p>
              </div>

              {demoMode ? (
                <div className="inline-flex items-center gap-2 self-start rounded-full border-2 border-violet-200 bg-white px-5 py-3 text-base font-semibold text-violet-800 shadow-sm">
                  <Zap className="h-5 w-5 text-violet-500" />
                  Demo mode — calendar pre-filled
                </div>
              ) : null}
            </div>
          </header>

          <div className="space-y-10 sm:space-y-12">
            <CalendarSummaryBar summary={summary} />

            {!loading ? <AiPlanningSummarySection planning={aiPlanning} /> : null}

            {!loading ? (
              <AiRecommendationsSection recommendations={aiRecommendations} />
            ) : null}

            {loading ? (
              <div className="flex flex-col items-center justify-center gap-5 rounded-3xl border-2 border-gray-200 bg-white py-28 shadow-md">
                <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
                <p className="text-base font-medium text-gray-600">
                  Loading your content plan…
                </p>
              </div>
            ) : posts.length === 0 && !demoMode ? (
              <SaasEmptyState preset="calendarPosts" variant="light" />
            ) : (
              <div className="space-y-10">
                <ContentCalendarMonth
                  cells={monthCells}
                  monthLabel={formatMonthYear(visibleMonth)}
                  selectedDateKey={selectedDateKey}
                  onSelectDate={setSelectedDateKey}
                  onPreviousMonth={() =>
                    setVisibleMonth((current) => addMonths(current, -1))
                  }
                  onNextMonth={() =>
                    setVisibleMonth((current) => addMonths(current, 1))
                  }
                />

                <CalendarDayPanel
                  dateLabel={selectedDateLabel}
                  posts={selectedPosts}
                  scheduleInputs={scheduleInputs}
                  schedulingId={schedulingId}
                  approvingId={approvingId}
                  publishingId={publishingId}
                  demoMode={demoMode}
                  onScheduleInputChange={(id, value) =>
                    setScheduleInputs((current) => ({ ...current, [id]: value }))
                  }
                  onSchedulePost={(id) => void handleSchedulePost(id)}
                  onApprovePost={(id) => void handleApprovePost(id)}
                  shouldShowApprove={shouldShowApprove}
                  shouldShowSchedule={shouldShowSchedule}
                  onPublishInstagram={(id) => void handlePublishToInstagram(id)}
                  shouldShowInstagramPublish={shouldShowInstagramPublish}
                  onOptimizedApplied={handleOptimizedApplied}
                  onOptimizationError={setErrorMessage}
                />

                <div className="grid gap-6 lg:grid-cols-2">
                  <section className="rounded-2xl border-2 border-gray-200 bg-white px-6 py-5 shadow-sm">
                    <p className="mb-4 text-sm font-bold uppercase tracking-[0.14em] text-gray-500">
                      Content types
                    </p>
                    <ContentTypeBadgeLegend />
                  </section>
                  <section className="rounded-2xl border-2 border-gray-200 bg-white px-6 py-5 shadow-sm">
                    <p className="mb-4 text-sm font-bold uppercase tracking-[0.14em] text-gray-500">
                      Post status
                    </p>
                    <PostStatusBadgeLegend />
                  </section>
                </div>
              </div>
            )}

            {errorMessage ? (
              <p className="rounded-2xl border-2 border-red-200 bg-red-50 px-5 py-4 text-base font-medium text-red-700 shadow-sm">
                {errorMessage}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {toast ? (
        <Toast
          title={toast.title}
          description={toast.description}
          variant={toast.variant ?? "success"}
          onDismiss={() => setToast(null)}
        />
      ) : null}
    </ProtectedShell>
  )
}
