"use client"

import Link from "next/link"
import { useState } from "react"
import { Check, Loader2, Plus } from "lucide-react"
import {
  buildScheduledAtForPlanDay,
} from "@/lib/marketing/posting-times"
import type {
  MarketingPlanItem,
  MarketingStrategy,
} from "@/lib/marketing/marketing-strategy-types"

export type StrategyPlanPost = {
  id: string
  plan_day: number | null
  status: string
  scheduled_at: string | null
}

function PlanDayCard({
  item,
  post,
  platform,
  onScheduled,
}: {
  item: MarketingPlanItem
  post?: StrategyPlanPost
  platform: string
  onScheduled: (postId: string, scheduledAt: string) => void
}) {
  const [scheduling, setScheduling] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const scheduled =
    post?.status === "scheduled" && Boolean(post.scheduled_at)

  async function sendToScheduler() {
    if (!post || scheduled || scheduling) return

    setScheduling(true)
    setErrorMessage(null)

    const scheduledAt = buildScheduledAtForPlanDay(platform, item.day)

    try {
      const res = await fetch(`/api/marketing/posts/${post.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "scheduled",
          scheduled_at: scheduledAt,
        }),
      })

      const data = (await res.json()) as {
        error?: string
        post?: { scheduled_at: string | null }
      }

      if (!res.ok) {
        setErrorMessage(data.error ?? "Could not schedule post.")
        return
      }

      onScheduled(post.id, data.post?.scheduled_at ?? scheduledAt)
    } catch {
      setErrorMessage("Could not schedule post.")
    } finally {
      setScheduling(false)
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <h3 className="text-base font-semibold capitalize text-gray-900">
        Day {item.day} – {item.type}
      </h3>

      <div className="mt-3 space-y-2 text-sm text-gray-700">
        <p>
          <strong>Hook:</strong> {item.hook}
        </p>
        <p>
          <strong>Caption:</strong> {item.caption}
        </p>
        <p>
          <strong>CTA:</strong> {item.cta}
        </p>
        <p className="capitalize">
          <strong>Goal:</strong> {item.goal}
        </p>
      </div>

      <div className="mt-4">
        {scheduled && post?.scheduled_at ? (
          <div className="space-y-1">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-green-700">
              <Check className="h-4 w-4" />
              Scheduled for{" "}
              {new Date(post.scheduled_at).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
            <Link
              href="/marketing/calendar"
              className="text-sm text-cyan-700 hover:underline"
            >
              View on calendar →
            </Link>
          </div>
        ) : (
          <button
            type="button"
            disabled={!post || scheduling}
            onClick={() => void sendToScheduler()}
            className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {scheduling ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scheduling…
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Send to Scheduler
              </>
            )}
          </button>
        )}

        {!post ? (
          <p className="mt-2 text-xs text-gray-500">
            Draft post not found for this day.
          </p>
        ) : null}

        {errorMessage ? (
          <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
        ) : null}
      </div>
    </div>
  )
}

export default function StrategyView({
  strategy,
  posts = [],
  platform,
  brandId,
  contentPlanId,
  onScheduledAll,
}: {
  strategy: MarketingStrategy
  posts?: StrategyPlanPost[]
  platform: string
  brandId: string
  contentPlanId?: string | null
  onScheduledAll?: (posts: StrategyPlanPost[]) => void
}) {
  const [schedulingAll, setSchedulingAll] = useState(false)
  const [bulkErrorMessage, setBulkErrorMessage] = useState<string | null>(null)
  const [scheduledPosts, setScheduledPosts] = useState<
    Record<string, StrategyPlanPost>
  >(() =>
    Object.fromEntries(
      posts
        .filter((post) => post.status === "scheduled")
        .map((post) => [post.id, post]),
    ),
  )

  const postsByDay = new Map(
    posts.map((post) => [post.plan_day ?? -1, post] as const),
  )

  function handleScheduled(postId: string, scheduledAt: string) {
    const existing = posts.find((post) => post.id === postId)
    if (!existing) return

    setScheduledPosts((current) => ({
      ...current,
      [postId]: {
        ...existing,
        status: "scheduled",
        scheduled_at: scheduledAt,
      },
    }))
  }

  function getPostForDay(day: number): StrategyPlanPost | undefined {
    const post = postsByDay.get(day)
    if (!post) return undefined
    return scheduledPosts[post.id] ?? post
  }

  const allScheduled = strategy.plan.every((item) => {
    const post = getPostForDay(item.day)
    return post?.status === "scheduled" && Boolean(post.scheduled_at)
  })

  async function sendToScheduler() {
    if (schedulingAll || allScheduled) return

    setSchedulingAll(true)
    setBulkErrorMessage(null)

    try {
      const res = await fetch("/api/strategy-to-posts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_id: brandId,
          platform,
          strategy,
          content_plan_id: contentPlanId ?? undefined,
        }),
      })

      const data = (await res.json()) as {
        error?: string
        posts?: StrategyPlanPost[]
      }

      if (!res.ok) {
        setBulkErrorMessage(data.error ?? "Could not send posts to scheduler.")
        return
      }

      const updatedPosts = data.posts ?? []

      setScheduledPosts((current) => ({
        ...current,
        ...Object.fromEntries(updatedPosts.map((post) => [post.id, post])),
      }))
      onScheduledAll?.(updatedPosts)
    } catch {
      setBulkErrorMessage("Could not send posts to scheduler.")
    } finally {
      setSchedulingAll(false)
    }
  }

  return (
    <div className="mt-8 border-t border-gray-100 pt-6">
      {strategy.goal ? (
        <p className="mb-4 text-sm text-gray-700">
          <strong>Strategy goal:</strong> {strategy.goal}
        </p>
      ) : null}

      {strategy.content_pillars?.length ? (
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-gray-700">
            Content pillars
          </p>
          <div className="flex flex-wrap gap-2">
            {strategy.content_pillars.map((pillar) => (
              <span
                key={pillar}
                className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700"
              >
                {pillar}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-black">
          {strategy.plan.length}-Day Content Plan
        </h2>

        <button
          type="button"
          disabled={schedulingAll || allScheduled}
          onClick={() => void sendToScheduler()}
          className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {schedulingAll ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending…
            </>
          ) : allScheduled ? (
            <>
              <Check className="h-4 w-4" />
              All scheduled
            </>
          ) : (
            <>🚀 Send Strategy to Scheduler</>
          )}
        </button>
      </div>

      {bulkErrorMessage ? (
        <p className="mt-3 text-sm text-red-600">{bulkErrorMessage}</p>
      ) : null}

      <div className="mt-4 grid gap-3">
        {strategy.plan.map((item) => (
          <PlanDayCard
            key={item.day}
            item={item}
            post={getPostForDay(item.day)}
            platform={platform}
            onScheduled={handleScheduled}
          />
        ))}
      </div>
    </div>
  )
}
