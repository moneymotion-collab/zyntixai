"use client"

import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, Zap } from "lucide-react"
import ProtectedShell from "@/app/components/ProtectedShell"
import ConfirmDialog from "@/app/components/ConfirmDialog"
import SaasEmptyState from "@/components/ui/saas-empty-state"
import Toast, { type ToastPayload } from "@/app/components/Toast"
import { successToast } from "@/lib/copy/success-toasts"
import type { PostAction } from "@/components/marketing/PostActions"
import ScheduledPostCard from "@/components/marketing/scheduled/ScheduledPostCard"
import PublishingSummary from "@/components/marketing/scheduled/PublishingSummary"
import PublishingTimeline from "@/components/marketing/scheduled/PublishingTimeline"
import { PublishingWorkflowLegend } from "@/components/marketing/scheduled/PostPipeline"
import {
  CONTENT_POST_STATUSES,
  CONTENT_POST_STATUS_LABELS,
  type ContentPostStatus,
} from "@/lib/marketing/content-post-status"
import { syncAnalytics } from "@/lib/content/sync-analytics"
import { isMarketingDemoMode } from "@/lib/marketing/demo-mode"
import { generateSimilarPostDemo } from "@/lib/marketing/generate-similar-post"
import {
  type MarketingPost,
} from "@/lib/marketing/get-mock-marketing-data"
import {
  buildMockScheduledPosts,
  resolveScheduledPostsForDisplay,
} from "@/lib/marketing/mock-scheduled-content-posts"
import {
  generateSimilarPost as generateSimilarPostRequest,
  publishPost,
  scorePost,
} from "@/lib/marketing/post-actions-client"
import { isInstagramPlatform } from "@/lib/marketing/platform-utils"
import { buildPublishingSummary } from "@/lib/marketing/publishing-summary"
import { getPublishingTimelinePosts } from "@/lib/marketing/publishing-timeline"
import {
  getPipelineStage,
  isApprovedViralStatus,
} from "@/lib/marketing/post-pipeline"
import { shouldShowTikTokPublishingComingSoon } from "@/lib/marketing/post-eligibility"

function StatusTabs({
  selected,
  onSelect,
  counts,
}: {
  selected: ContentPostStatus | "all"
  onSelect: (status: ContentPostStatus | "all") => void
  counts: Record<ContentPostStatus | "all", number>
}) {
  const tabs: Array<{ value: ContentPostStatus | "all"; label: string }> = [
    { value: "all", label: "All" },
    ...CONTENT_POST_STATUSES.map((status) => ({
      value: status,
      label: CONTENT_POST_STATUS_LABELS[status],
    })),
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const active = selected === tab.value
        const count = counts[tab.value]

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onSelect(tab.value)}
            className={`inline-flex items-center gap-2.5 rounded-full border px-5 py-3 text-base font-semibold transition sm:px-6 sm:py-3.5 sm:text-lg ${
              active
                ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-2.5 py-1 text-sm font-bold sm:px-3 sm:py-1.5 sm:text-base ${
                active
                  ? "bg-white/15 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function ScheduledPostsPageContent() {
  const searchParams = useSearchParams()
  const highlightPostId = searchParams.get("post")
  const initialStatus = searchParams.get("status")
  const justAdded = searchParams.get("added") === "1"
  const highlightedPostRef = useRef<string | null>(null)
  const demoMode = isMarketingDemoMode()

  const [posts, setPosts] = useState<MarketingPost[]>([])
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)
  const [confirmClearOpen, setConfirmClearOpen] = useState(false)
  const [hasInstagramConnection, setHasInstagramConnection] = useState(false)
  const [busyByPost, setBusyByPost] = useState<{
    id: string
    action: PostAction
  } | null>(null)
  const [toast, setToast] = useState<ToastPayload | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<ContentPostStatus | "all">(
    initialStatus === "draft" ||
      initialStatus === "scheduled" ||
      initialStatus === "published" ||
      initialStatus === "failed"
      ? initialStatus
      : "all",
  )

  const useDemoContent = demoMode

  const visiblePosts = useMemo(
    () => resolveScheduledPostsForDisplay(posts, statusFilter, useDemoContent),
    [posts, statusFilter, useDemoContent],
  )

  const statusCounts = useMemo(() => {
    const source = useDemoContent ? buildMockScheduledPosts() : posts
    const counts: Record<ContentPostStatus | "all", number> = {
      all: source.length,
      draft: 0,
      scheduled: 0,
      published: 0,
      failed: 0,
    }

    for (const post of source) {
      if (post.status === "draft") counts.draft += 1
      if (post.status === "scheduled") counts.scheduled += 1
      if (post.status === "published") counts.published += 1
      if (post.status === "failed") counts.failed += 1
    }

    return counts
  }, [posts, useDemoContent])

  const publishingSummary = useMemo(() => {
    const source = useDemoContent ? buildMockScheduledPosts() : posts
    return buildPublishingSummary(source)
  }, [posts, useDemoContent])

  const timelineEntries = useMemo(() => {
    const source = useDemoContent ? buildMockScheduledPosts() : posts
    return getPublishingTimelinePosts(posts, useDemoContent, () => source)
  }, [posts, useDemoContent])

  useEffect(() => {
    if (!highlightPostId || highlightedPostRef.current === highlightPostId) {
      return
    }

    highlightedPostRef.current = highlightPostId

    if (justAdded) {
      setToast(successToast("videoAddedToCalendar"))
    }

    requestAnimationFrame(() => {
      document
        .getElementById(`post-${highlightPostId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" })
    })
  }, [highlightPostId, justAdded, posts])

  async function loadPosts() {
    setLoading(true)
    setErrorMessage(null)

    if (demoMode) {
      setPosts(buildMockScheduledPosts())
      setLoading(false)
      return
    }

    try {
      const params =
        statusFilter === "all" ? "" : `?status=${encodeURIComponent(statusFilter)}`
      const res = await fetch(`/api/content/posts${params}`, {
        credentials: "include",
      })
      const data = (await res.json()) as {
        posts?: MarketingPost[]
        error?: string
      }

      if (!res.ok) {
        setErrorMessage(data.error ?? "Could not load posts.")
        setPosts([])
        return
      }

      setPosts(data.posts ?? [])
    } catch {
      setErrorMessage("Could not load posts.")
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadPosts()
  }, [statusFilter, demoMode])

  async function clearAllPosts() {
    if (demoMode || clearing || busyByPost) return

    setClearing(true)
    setErrorMessage(null)
    setToast(null)
    setConfirmClearOpen(false)

    try {
      const res = await fetch("/api/marketing/posts", {
        method: "DELETE",
        credentials: "include",
      })
      const data = (await res.json()) as {
        deleted?: number
        error?: string
      }

      if (!res.ok) {
        setErrorMessage(data.error ?? "Kon posts niet verwijderen.")
        return
      }

      setPosts([])
      setToast(
        successToast("postsCleared", {
          description: data.deleted
            ? `${data.deleted} post${data.deleted === 1 ? "" : "s"} removed from the pipeline.`
            : "No posts were available to remove.",
        }),
      )
    } catch {
      setErrorMessage("Kon posts niet verwijderen.")
    } finally {
      setClearing(false)
    }
  }

  useEffect(() => {
    async function loadInstagramConnection() {
      try {
        const res = await fetch("/api/instagram/connection", {
          credentials: "include",
        })
        const data = (await res.json()) as { connection?: unknown | null }
        setHasInstagramConnection(Boolean(res.ok && data.connection))
      } catch {
        setHasInstagramConnection(false)
      }
    }

    void loadInstagramConnection()
  }, [])

  function setPostBusy(postId: string, action: PostAction) {
    setBusyByPost({ id: postId, action })
  }

  function clearPostBusy() {
    setBusyByPost(null)
  }

  function busyActionFor(postId: string): PostAction | null {
    return busyByPost?.id === postId ? busyByPost.action : null
  }

  async function generateSimilar(post: MarketingPost) {
    if (busyByPost) return

    setPostBusy(post.id, "generate")
    setErrorMessage(null)
    setToast(null)

    if (demoMode) {
      const similar = generateSimilarPostDemo(post)
      const now = new Date().toISOString()
      const newPost: MarketingPost = {
        ...post,
        id: `demo-similar-${Date.now()}`,
        ...similar,
        status: "draft",
        viral_status: "",
        scheduled_at: null,
        published_at: null,
        created_at: now,
        updated_at: now,
      }

      setPosts((current) => [newPost, ...current])
      setToast(successToast("similarPostGenerated"))
      clearPostBusy()
      return
    }

    try {
      const { post: created, warning } = await generateSimilarPostRequest(
        post.id,
      )
      setPosts((current) => [created, ...current])
      setToast(
        successToast("similarPostGenerated", {
          description: warning ?? "Review the draft in your publishing pipeline.",
        }),
      )
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not generate similar post.",
      )
    } finally {
      clearPostBusy()
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
              title: applied.title,
              caption: applied.caption,
              hashtags: applied.hashtags,
              updated_at: new Date().toISOString(),
            }
          : item,
      ),
    )
    setToast(successToast("postOptimized"))
  }

  async function scorePostAction(post: MarketingPost) {
    if (busyByPost) return

    setPostBusy(post.id, "score")
    setErrorMessage(null)
    setToast(null)

    if (demoMode) {
      const score = post.viral_score ?? 68
      setPosts((current) =>
        current.map((item) =>
          item.id === post.id
            ? {
                ...item,
                viral_score: Math.min(100, score + 5),
                viral_reason: "Strong hook potential with room to sharpen the CTA.",
                viral_feedback: JSON.stringify([
                  "Strong hook potential",
                  "Add a clearer CTA",
                  "Test posting at peak hours",
                ]),
                viral_status: score + 5 >= 75 ? "approve" : "optimize",
                updated_at: new Date().toISOString(),
              }
            : item,
        ),
      )
      setToast(successToast("postScored"))
      clearPostBusy()
      return
    }

    try {
      const { result, warning } = await scorePost(post.id)

      setPosts((current) =>
        current.map((item) =>
          item.id === post.id
            ? {
                ...item,
                viral_score: result.viral_score,
                viral_reason: result.viral_reason,
                viral_feedback: JSON.stringify(result.feedback ?? []),
                viral_status: result.viral_score >= 75 ? "approve" : "optimize",
                updated_at: new Date().toISOString(),
              }
            : item,
        ),
      )
      setToast(
        successToast("postScored", {
          description: warning ?? "Viral score and engagement insights are ready.",
        }),
      )
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not score post.",
      )
    } finally {
      clearPostBusy()
    }
  }

  async function approvePostAction(post: MarketingPost) {
    if (busyByPost) return
    if (!shouldShowApprove(post)) return

    setPostBusy(post.id, "approve")
    setErrorMessage(null)
    setToast(null)

    if (demoMode) {
      setPosts((current) =>
        current.map((item) =>
          item.id === post.id
            ? {
                ...item,
                viral_status: "approved",
                updated_at: new Date().toISOString(),
              }
            : item,
        ),
      )
      setToast(successToast("postApproved"))
      clearPostBusy()
      return
    }

    try {
      const res = await fetch("/api/content/update", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: post.id,
          viral_status: "approved",
        }),
      })

      const payload = (await res.json()) as {
        data?: MarketingPost | null
        error?: { message?: string } | null
      }

      if (!res.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "Could not approve post.")
      }

      setPosts((current) =>
        current.map((item) => (item.id === post.id ? payload.data! : item)),
      )
      setToast(successToast("postApproved"))
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not approve post.",
      )
    } finally {
      clearPostBusy()
    }
  }

  async function schedulePostAction(post: MarketingPost) {
    if (busyByPost || !shouldShowSchedule(post)) return

    const defaultDate = new Date()
    defaultDate.setDate(defaultDate.getDate() + 1)
    defaultDate.setHours(10, 0, 0, 0)
    const defaultValue = defaultDate.toISOString().slice(0, 16)
    const input = window.prompt(
      "Choose when this post should publish (local time):",
      defaultValue,
    )

    if (!input?.trim()) return

    const scheduledAt = new Date(input).toISOString()
    if (Number.isNaN(Date.parse(scheduledAt))) {
      setErrorMessage("Invalid schedule date.")
      return
    }

    setPostBusy(post.id, "schedule")
    setErrorMessage(null)
    setToast(null)

    if (demoMode) {
      const updated: MarketingPost = {
        ...post,
        status: "scheduled",
        scheduled_at: scheduledAt,
        updated_at: new Date().toISOString(),
      }

      setPosts((current) =>
        statusFilter === "all" || statusFilter === "scheduled"
          ? current.map((item) => (item.id === post.id ? updated : item))
          : current.filter((item) => item.id !== post.id),
      )
      setToast(successToast("postScheduled"))
      clearPostBusy()
      return
    }

    try {
      const res = await fetch("/api/content/update", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: post.id,
          status: "scheduled",
          scheduled_at: scheduledAt,
        }),
      })

      const payload = (await res.json()) as {
        data?: MarketingPost | null
        error?: { message?: string } | null
      }

      if (!res.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "Could not schedule post.")
      }

      setPosts((current) =>
        statusFilter === "all" || statusFilter === "scheduled"
          ? current.map((item) =>
              item.id === post.id ? payload.data! : item,
            )
          : current.filter((item) => item.id !== post.id),
      )
      setToast(successToast("postScheduled"))
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not schedule post.",
      )
    } finally {
      clearPostBusy()
    }
  }

  async function publishPostAction(post: MarketingPost) {
    if (busyByPost || post.status === "published") return
    if (!shouldShowPublish(post)) return

    setPostBusy(post.id, "publish")
    setErrorMessage(null)
    setToast(null)

    if (demoMode) {
      const now = new Date().toISOString()
      const updated: MarketingPost = {
        ...post,
        status: "published",
        published_at: now,
        updated_at: now,
      }

      setPosts((current) =>
        statusFilter === "all" || statusFilter === "published"
          ? current.map((item) => (item.id === post.id ? updated : item))
          : current.filter((item) => item.id !== post.id),
      )
      setToast(successToast("postPublished"))
      clearPostBusy()
      return
    }

    try {
      const updated = await publishPost(post.id)

      setPosts((current) =>
        statusFilter === "all" || statusFilter === "published"
          ? current.map((item) => (item.id === post.id ? updated : item))
          : current.filter((item) => item.id !== post.id),
      )
      setToast(successToast("postPublished"))
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not publish post.",
      )
    } finally {
      clearPostBusy()
    }
  }

  function shouldShowInstagramPublish(post: MarketingPost) {
    if (!hasInstagramConnection) return false
    const status = (post.status ?? "").toString().trim().toLowerCase()
    if (status === "failed" || status === "published") return false
    return Boolean(
      isInstagramPlatform(post.platform) &&
        (status === "scheduled" || status === "draft"),
    )
  }

  function shouldShowRetryInstagram(post: MarketingPost) {
    if (!hasInstagramConnection) return false
    const status = (post.status ?? "").toString().trim().toLowerCase()
    return Boolean(isInstagramPlatform(post.platform) && status === "failed")
  }

  function shouldShowPublish(post: MarketingPost) {
    const status = (post.status ?? "").toString().trim().toLowerCase()
    if (status !== "scheduled") return false
    return !isInstagramPlatform(post.platform)
  }

  function shouldShowSchedule(post: MarketingPost) {
    const stage = getPipelineStage(post)
    return stage === "draft" || stage === "approved"
  }

  function shouldShowApprove(post: MarketingPost) {
    const stage = getPipelineStage(post)
    return stage === "draft" && !isApprovedViralStatus(post.viral_status)
  }

  function shouldShowSyncAnalytics(post: MarketingPost) {
    const status = (post.status ?? "").toString().trim().toLowerCase()
    return status === "published" && Boolean(post.external_post_id?.trim())
  }

  async function syncPostAnalytics(post: MarketingPost) {
    if (busyByPost) return
    if (!shouldShowSyncAnalytics(post)) return

    setPostBusy(post.id, "sync_analytics")
    setErrorMessage(null)
    setToast(null)

    if (demoMode) {
      setToast(successToast("analyticsSynced"))
      clearPostBusy()
      return
    }

    try {
      await syncAnalytics(post.id)
      setToast(successToast("analyticsSynced"))
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Analytics sync failed.",
      )
    } finally {
      clearPostBusy()
    }
  }

  async function publishToInstagram(post: MarketingPost) {
    if (busyByPost) return
    if (!shouldShowInstagramPublish(post)) return

    setPostBusy(post.id, "publish_instagram")
    setErrorMessage(null)
    setToast(null)

    if (demoMode) {
      setToast(successToast("instagramPublished"))
      clearPostBusy()
      return
    }

    try {
      const res = await fetch("/api/instagram/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ contentPostId: post.id }),
      })

      const payload = (await res.json()) as {
        data?: MarketingPost | null
        error?: { message?: string } | null
      }

      if (!res.ok) {
        const message =
          payload.error?.message ?? "Could not publish to Instagram."
        setPosts((current) =>
          current.map((item) =>
            item.id === post.id
              ? {
                  ...item,
                  status: "failed",
                  publish_error: message,
                  updated_at: new Date().toISOString(),
                }
              : item,
          ),
        )
        throw new Error(message)
      }

      if (payload.data) {
        setPosts((current) =>
          current.map((item) => (item.id === post.id ? payload.data! : item)),
        )
      }

      setToast(successToast("instagramPublished"))
      await loadPosts()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not publish to Instagram.",
      )
    } finally {
      clearPostBusy()
    }
  }

  return (
    <ProtectedShell allowed={["admin", "coach"]}>
      <div className="min-h-full overflow-x-hidden bg-gradient-to-b from-slate-50 via-white to-violet-50/30">
        <div className="mx-auto max-w-6xl p-4 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
          <header className="mb-12">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-600">
                  Marketing AI
                </p>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
                  Scheduled Posts
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-relaxed text-gray-500 sm:text-xl lg:text-2xl lg:leading-relaxed">
                  Move content through draft, approval, scheduling, and
                  publishing with viral scores at every step.
                </p>
              </div>

              <div className="flex flex-col items-start gap-3 self-start">
                {demoMode ? (
                  <div className="inline-flex items-center gap-3 rounded-full border border-violet-200 bg-white px-6 py-3 text-base font-semibold text-violet-800 shadow-sm sm:text-lg">
                    <Zap className="h-5 w-5" />
                    Demo mode
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmClearOpen(true)}
                    disabled={clearing || loading || Boolean(busyByPost)}
                    className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50 disabled:opacity-50"
                  >
                    {clearing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Bezig met wissen…
                      </>
                    ) : (
                      "Alles wissen"
                    )}
                  </button>
                )}
              </div>
            </div>
          </header>

          <div className="space-y-10">
            {!loading ? <PublishingSummary summary={publishingSummary} /> : null}

            {!loading ? <PublishingTimeline entries={timelineEntries} /> : null}

            <PublishingWorkflowLegend />

            <section className="rounded-[2rem] border-2 border-gray-200/80 bg-white p-8 shadow-[0_12px_48px_rgba(15,23,42,0.06)] sm:p-10">
              <div className="flex flex-col gap-6 border-b border-gray-100 pb-8 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-950 sm:text-3xl">
                    Content queue
                  </h2>
                  <p className="mt-2 text-lg font-medium text-gray-500 sm:text-xl">
                    {loading
                      ? "Loading posts…"
                      : `${visiblePosts.length} post${visiblePosts.length === 1 ? "" : "s"} shown`}
                  </p>
                </div>
                <StatusTabs
                  selected={statusFilter}
                  onSelect={setStatusFilter}
                  counts={statusCounts}
                />
              </div>

              {loading ? (
                <div className="flex justify-center py-24">
                  <Loader2 className="h-9 w-9 animate-spin text-violet-500" />
                </div>
              ) : visiblePosts.length === 0 && !useDemoContent ? (
                <SaasEmptyState preset="marketingPipeline" variant="light" />
              ) : (
                <div className="mt-10 space-y-12">
                  {visiblePosts.map((post) => (
                    <ScheduledPostCard
                      key={post.id}
                      post={post}
                      highlighted={highlightPostId === post.id}
                      busyAction={busyActionFor(post.id)}
                      demoMode={demoMode}
                      onGenerateSimilar={(item) => void generateSimilar(item)}
                      onScore={(item) => void scorePostAction(item)}
                      onApprove={(item) => void approvePostAction(item)}
                      showApprove={shouldShowApprove}
                      onPublish={(item) => void publishPostAction(item)}
                      onSchedule={(item) => void schedulePostAction(item)}
                      showSchedule={shouldShowSchedule}
                      showPublish={shouldShowPublish}
                      onPublishInstagram={(item) => void publishToInstagram(item)}
                      showPublishInstagram={shouldShowInstagramPublish}
                      showRetryInstagram={shouldShowRetryInstagram}
                      onSyncAnalytics={(item) => void syncPostAnalytics(item)}
                      showSyncAnalytics={shouldShowSyncAnalytics}
                      showTikTokComingSoon={(post) =>
                        shouldShowTikTokPublishingComingSoon(post.platform)
                      }
                      onOptimizedApplied={handleOptimizedApplied}
                      onOptimizationError={setErrorMessage}
                    />
                  ))}
                </div>
              )}

              {errorMessage ? (
                <p className="mt-10 rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-base font-semibold text-red-700 sm:text-lg">
                  {errorMessage}
                </p>
              ) : null}
            </section>
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

      <ConfirmDialog
        open={confirmClearOpen}
        title="Clear all posts?"
        message="Alle concept-, geplande en gepubliceerde posts verwijderen? Dit kan niet ongedaan worden gemaakt."
        confirmLabel="Clear all"
        loading={clearing}
        onConfirm={() => void clearAllPosts()}
        onCancel={() => setConfirmClearOpen(false)}
      />
    </ProtectedShell>
  )
}

export default function ScheduledPostsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      }
    >
      <ScheduledPostsPageContent />
    </Suspense>
  )
}
