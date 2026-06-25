"use client"

import { CalendarClock, Loader2, Send, Sparkles } from "lucide-react"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import PostOptimizationFlow from "@/components/marketing/PostOptimizationFlow"
import type { AppliedOptimizedPost } from "@/lib/marketing/marketing-optimize-client"
import type { CalendarPost } from "@/lib/marketing/calendar-types"
import {
  getCalendarPostFormat,
  getCalendarPostStatus,
} from "@/lib/marketing/calendar-display"
import { parseScheduledDate } from "@/lib/marketing/calendar-utils"
import { getBestPostingTime } from "@/lib/marketing/posting-times"
import { shouldShowTikTokPublishingComingSoon } from "@/lib/marketing/post-eligibility"
import { premiumInputClass } from "@/lib/ui/premium-input"
import TikTokPublishingComingSoon from "@/components/marketing/TikTokPublishingComingSoon"
import {
  CalendarFormatBadge,
  CalendarStatusBadge,
  getCalendarStatusBorderClass,
} from "@/components/marketing/calendar/CalendarBadges"

export default function CalendarDayPanel({
  dateLabel,
  posts,
  scheduleInputs,
  schedulingId,
  approvingId,
  publishingId,
  demoMode = false,
  onScheduleInputChange,
  onSchedulePost,
  onApprovePost,
  shouldShowApprove,
  shouldShowSchedule,
  onPublishInstagram,
  shouldShowInstagramPublish,
  onOptimizedApplied,
  onOptimizationError,
}: {
  dateLabel: string
  posts: CalendarPost[]
  scheduleInputs: Record<string, string>
  schedulingId: string | null
  approvingId: string | null
  publishingId: string | null
  demoMode?: boolean
  onScheduleInputChange: (id: string, value: string) => void
  onSchedulePost: (id: string) => void
  onApprovePost: (id: string) => void
  shouldShowApprove: (post: CalendarPost) => boolean
  shouldShowSchedule: (post: CalendarPost) => boolean
  onPublishInstagram: (id: string) => void
  shouldShowInstagramPublish: (post: CalendarPost) => boolean
  onOptimizedApplied: (postId: string, applied: AppliedOptimizedPost) => void
  onOptimizationError?: (message: string) => void
}) {
  return (
    <section className="overflow-hidden rounded-3xl border-2 border-gray-200 bg-white shadow-lg shadow-gray-200/50">
      <div className="border-b border-gray-100 bg-gradient-to-br from-gray-50 via-white to-cyan-50/30 px-6 py-6 sm:px-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-gray-500">
              Day details
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
              {dateLabel}
            </h2>
            <p className="mt-2 text-base text-gray-600">
              {posts.length === 0
                ? SAAS_EMPTY.calendarPosts.title
                : `${posts.length} post${posts.length === 1 ? "" : "s"} planned`}
            </p>
          </div>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="px-6 py-16 text-center sm:px-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
            <CalendarClock className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
            {SAAS_EMPTY.calendarPosts.eyebrow}
          </p>
          <p className="mt-2 text-lg font-semibold text-gray-800">
            {SAAS_EMPTY.calendarPosts.title}
          </p>
          <p className="mt-2 text-base text-gray-500">
            {SAAS_EMPTY.calendarPosts.description}
          </p>
        </div>
      ) : (
        <div className="space-y-6 p-6 sm:p-8">
          {posts.map((post) => {
            const format = getCalendarPostFormat(post)
            const status = getCalendarPostStatus(post)
            const scheduled = parseScheduledDate(post.scheduled_date)

            return (
              <article
                key={post.id}
                className={`overflow-hidden rounded-2xl border-2 border-gray-200 border-l-[6px] bg-white shadow-sm ${getCalendarStatusBorderClass(status)}`}
              >
                <div className="border-b border-gray-100 px-6 py-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <CalendarStatusBadge status={status} />
                    <CalendarFormatBadge format={format} />
                    <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-semibold uppercase tracking-wide text-gray-700">
                      {post.platform}
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-bold leading-snug text-gray-900">
                    {post.hook}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-gray-600">
                    {post.content}
                  </p>

                  <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700">
                    <CalendarClock className="h-4 w-4 text-gray-500" />
                    {scheduled
                      ? scheduled.toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : `AI suggested: ${getBestPostingTime(post.platform)}`}
                  </div>
                </div>

                {status !== "published" ? (
                  <div className="space-y-4 border-t border-gray-100 px-6 py-5">
                    <PostOptimizationFlow
                      postId={post.id}
                      sourceTable="content_posts"
                      originalTitle={post.hook}
                      originalCaption={post.content}
                      platform={post.platform}
                      demoMode={demoMode}
                      disabled={schedulingId === post.id || publishingId === post.id || approvingId === post.id}
                      variant="calendar"
                      onApplied={(applied) => onOptimizedApplied(post.id, applied)}
                      onError={onOptimizationError}
                    />

                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    {shouldShowApprove(post) ? (
                      <button
                        type="button"
                        onClick={() => onApprovePost(post.id)}
                        disabled={approvingId === post.id}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-base font-semibold text-blue-900 shadow-sm transition hover:border-blue-300 hover:bg-blue-100 disabled:opacity-50"
                      >
                        {approvingId === post.id ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Approving…
                          </>
                        ) : (
                          "Approve"
                        )}
                      </button>
                    ) : null}

                    {shouldShowSchedule(post) ? (
                      <>
                    <input
                      type="datetime-local"
                      value={
                        scheduleInputs[post.id] ??
                        (post.scheduled_date
                          ? new Date(post.scheduled_date)
                              .toISOString()
                              .slice(0, 16)
                          : "")
                      }
                      onChange={(event) =>
                        onScheduleInputChange(post.id, event.target.value)
                      }
                      className={`${premiumInputClass} min-w-0 flex-1 text-base`}
                    />
                    <button
                      type="button"
                      onClick={() => onSchedulePost(post.id)}
                      disabled={schedulingId === post.id}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:opacity-50"
                    >
                      {schedulingId === post.id ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Scheduling…
                        </>
                      ) : (
                        "Schedule"
                      )}
                    </button>
                      </>
                    ) : null}

                    {shouldShowInstagramPublish(post) ? (
                      <button
                        type="button"
                        onClick={() => onPublishInstagram(post.id)}
                        disabled={publishingId === post.id}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-50"
                      >
                        {publishingId === post.id ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Publishing…
                          </>
                        ) : (
                          <>
                            <Send className="h-5 w-5" />
                            Publish
                          </>
                        )}
                      </button>
                    ) : null}

                    {shouldShowTikTokPublishingComingSoon(post.platform) ? (
                      <TikTokPublishingComingSoon />
                    ) : null}
                    </div>
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
