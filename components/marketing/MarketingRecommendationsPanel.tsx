"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Sparkles } from "lucide-react"
import RecommendationsReadinessBanner from "@/components/marketing/RecommendationsReadinessBanner"
import type { RecommendationView } from "@/lib/marketing/recommendations/format-recommendation"
import type { RecommendationRunSummary } from "@/lib/marketing/recommendations/generate-recommendations"
import type { RecommendationReadiness } from "@/lib/marketing/recommendations/recommendation-readiness"
import { useIsDemoWorkspace } from "@/app/hooks/useIsDemoWorkspace"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"

const DEMO_READINESS: RecommendationReadiness = {
  state: "ready",
  postCount: 12,
  minPosts: 5,
  totalViews: 24800,
  hasRecommendations: true,
  progressPercent: 100,
  message: "Sample recommendations from demo fitness analytics.",
}

const DEMO_RECOMMENDATIONS: RecommendationView[] = [
  {
    id: "demo-1",
    title: "Shift volume toward Instagram Reels",
    insight:
      "Your Reels generated 3.2x more views than feed posts (12,400 vs 3,875 total views) and 4.1 pts higher engagement.",
    whyItMatters:
      "Publishing where your audience already engages reduces wasted effort on underperforming formats.",
    action:
      "Prioritize short problem-solution Reels next week and reduce static post volume until your Reels cadence is consistent.",
    priority: 98,
    recommendation_type: "best_platform",
    confidence_score: 91,
    triggerPostId: null,
    triggerPostTitle: "Instagram Reels (6 posts)",
  },
  {
    id: "demo-2",
    title: "Reuse your highest-performing hook",
    insight:
      'Hooks like "You\'re doing this wrong" averaged 8.4% engagement across 2 posts, beating your next-best hook by 2.1 pts.',
    whyItMatters:
      "Opening lines drive scroll-stop rate. Reusing proven hooks compounds reach without guessing.",
    action:
      'Open your content calendar and schedule 2 posts this week that open with a hook in the same style as "You\'re doing this wrong".',
    priority: 96,
    recommendation_type: "best_hook",
    confidence_score: 88,
    triggerPostId: "demo-post-1",
    triggerPostTitle: "3 mistakes killing your gains",
  },
  {
    id: "demo-3",
    title: "Double down on educational content",
    insight:
      "Educational posts are your strongest format, delivering 1.8x higher engagement than your other formats across 4 tracked posts.",
    whyItMatters:
      "Doubling down on a winning format improves production efficiency and audience expectations.",
    action:
      "Plan 3 educational posts for next week and retire your lowest-performing format until educational makes up at least half of your calendar.",
    priority: 92,
    recommendation_type: "content_type",
    confidence_score: 84,
    triggerPostId: "demo-post-1",
    triggerPostTitle: "3 mistakes killing your gains",
  },
  {
    id: "demo-4",
    title: 'Fix what held back "Morning cardio myth"',
    insight:
      '"Morning cardio myth" on Instagram reached 980 views at 2.1% engagement — 6.3 pts below your top post "3 mistakes killing your gains".',
    whyItMatters:
      "Low performers reveal hook, format, or CTA gaps you can fix on the next publish instead of abandoning the topic.",
    action:
      'Republish the idea behind "Morning cardio myth" with the hook from "3 mistakes killing your gains" and a direct CTA in the final line.',
    priority: 88,
    recommendation_type: "improve_weak_post",
    confidence_score: 82,
    triggerPostId: "demo-post-2",
    triggerPostTitle: "Morning cardio myth",
  },
  {
    id: "demo-5",
    title: "Engagement is trending up",
    insight:
      "Your recent posts average 7.8% engagement vs 5.4% on earlier posts (+2.4 pts).",
    whyItMatters:
      "Rising engagement means your recent format and hook choices are resonating — keep the momentum.",
    action:
      'Repeat the hook and format from "3 mistakes killing your gains" on your next 2 posts while engagement is climbing.',
    priority: 87,
    recommendation_type: "engagement_trend",
    confidence_score: 79,
    triggerPostId: "demo-post-1",
    triggerPostTitle: "3 mistakes killing your gains",
  },
]

function priorityLabel(priority: number): string {
  if (priority >= 95) return "High"
  if (priority >= 85) return "Medium"
  return "Low"
}

function priorityClass(priority: number): string {
  if (priority >= 95) {
    return "border-red-200 bg-red-50 text-red-700"
  }
  if (priority >= 85) {
    return "border-amber-200 bg-amber-50 text-amber-700"
  }
  return "border-cyan-200 bg-cyan-50 text-cyan-700"
}

function confidenceClass(score: number): string {
  if (score >= 85) return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (score >= 70) return "border-cyan-200 bg-cyan-50 text-cyan-700"
  return "border-gray-200 bg-gray-100 text-gray-700"
}

function RecommendationCard({ item }: { item: RecommendationView }) {
  return (
    <li className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="font-semibold text-gray-900">{item.title}</p>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Why it matters
            </p>
            <p className="mt-1 text-sm text-gray-600">{item.whyItMatters}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Based on your data
            </p>
            <p className="mt-1 text-sm text-gray-600">{item.insight}</p>
          </div>
          {item.triggerPostTitle ? (
            <p className="text-xs text-gray-500">
              Triggered by:{" "}
              <span className="font-medium text-gray-700">
                {item.triggerPostTitle}
              </span>
            </p>
          ) : null}
          <div className="rounded-xl border border-cyan-100 bg-cyan-50/60 px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-800">
              Next action
            </p>
            <p className="mt-1 text-sm font-medium text-cyan-900">
              {item.action}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {item.confidence_score != null ? (
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${confidenceClass(item.confidence_score)}`}
            >
              {item.confidence_score}% confidence
            </span>
          ) : null}
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${priorityClass(item.priority)}`}
          >
            {priorityLabel(item.priority)} priority
          </span>
        </div>
      </div>
    </li>
  )
}

export default function MarketingRecommendationsPanel({
  onGenerated,
  forceDemoRecommendations = false,
}: {
  onGenerated?: (data: {
    summary?: RecommendationRunSummary
    recommendations: RecommendationView[]
  }) => void
  forceDemoRecommendations?: boolean
}) {
  const { isDemoWorkspace, loading: demoLoading } = useIsDemoWorkspace()
  const demoMode = isDemoWorkspace || forceDemoRecommendations
  const [brandId, setBrandId] = useState<string | null>(null)
  const [loadingBrand, setLoadingBrand] = useState(true)
  const [loadingRecommendations, setLoadingRecommendations] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [recommendations, setRecommendations] = useState<RecommendationView[]>(
    demoMode ? DEMO_RECOMMENDATIONS : [],
  )
  const [readiness, setReadiness] = useState<RecommendationReadiness | null>(
    demoMode ? DEMO_READINESS : null,
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const loadRecommendations = useCallback(async () => {
    if (demoMode) {
      setRecommendations(DEMO_RECOMMENDATIONS)
      setReadiness(DEMO_READINESS)
      return
    }

    setLoadingRecommendations(true)
    setErrorMessage(null)

    try {
      const res = await fetch("/api/marketing/recommendations", {
        credentials: "include",
      })
      const data = (await res.json()) as {
        error?: string
        recommendations?: RecommendationView[]
        readiness?: RecommendationReadiness
      }

      if (!res.ok) {
        setErrorMessage(data.error ?? "Could not load recommendations.")
        return
      }

      setRecommendations(data.recommendations ?? [])
      if (data.readiness) {
        setReadiness(data.readiness)
      }
    } catch {
      setErrorMessage("Could not load recommendations.")
    } finally {
      setLoadingRecommendations(false)
    }
  }, [demoMode])

  const loadBrand = useCallback(async () => {
    if (demoMode) {
      setBrandId("demo-brand")
      setLoadingBrand(false)
      return
    }

    setLoadingBrand(true)
    setErrorMessage(null)

    try {
      const res = await fetch("/api/marketing/brand", { credentials: "include" })
      const data = (await res.json()) as {
        error?: string
        profile?: { id: string | null }
      }

      if (!res.ok) {
        setErrorMessage(data.error ?? "Could not load brand profile.")
        setBrandId(null)
        return
      }

      setBrandId(data.profile?.id ?? null)
    } catch {
      setErrorMessage("Could not load brand profile.")
      setBrandId(null)
    } finally {
      setLoadingBrand(false)
    }
  }, [demoMode])

  useEffect(() => {
    if (demoLoading) return
    void loadBrand()
  }, [loadBrand, demoLoading])

  useEffect(() => {
    if (demoLoading || loadingBrand) return
    void loadRecommendations()
  }, [loadBrand, loadRecommendations, loadingBrand, demoLoading])

  const handleGenerate = async () => {
    setGenerating(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 800))
        setRecommendations(DEMO_RECOMMENDATIONS)
        setReadiness(DEMO_READINESS)
        setSuccessMessage("Generated 5 sample recommendations from demo analytics.")
        onGenerated?.({ recommendations: DEMO_RECOMMENDATIONS })
        return
      }

      const res = await fetch("/api/marketing/recommendations/generate", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brandId ? { brand_id: brandId } : {}),
      })

      const data = (await res.json()) as {
        error?: string
        success?: boolean
        summary?: RecommendationRunSummary
        recommendations?: RecommendationView[]
        readiness?: RecommendationReadiness
      }

      if (!res.ok) {
        setErrorMessage(data.error ?? "Could not generate recommendations.")
        return
      }

      setRecommendations(data.recommendations ?? [])
      if (data.readiness) {
        setReadiness(data.readiness)
      }
      onGenerated?.({
        summary: data.summary,
        recommendations: data.recommendations ?? [],
      })

      const count = data.recommendations?.length ?? 0
      if (count === 0) {
        setSuccessMessage(
          data.readiness?.message ??
            "Not enough performance data yet. Publish and sync more posts.",
        )
      } else {
        setSuccessMessage(
          count === 1
            ? "Generated 1 recommendation from your analytics."
            : `Generated ${count} recommendations from your analytics.`,
        )
      }
    } catch {
      setErrorMessage("Could not generate recommendations.")
    } finally {
      setGenerating(false)
    }
  }

  const isLoading = loadingBrand || loadingRecommendations
  const canGenerate = demoMode || readiness?.state === "ready"

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AI Recommendations</h2>
            <p className="text-sm text-gray-500">
              Actionable insights from your content performance
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={generating || loadingBrand || !canGenerate}
          className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Recommendations
            </>
          )}
        </button>
      </div>

      {readiness ? <RecommendationsReadinessBanner readiness={readiness} /> : null}

      {successMessage ? (
        <p className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {isLoading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading recommendations…
        </div>
      ) : recommendations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
            {SAAS_EMPTY.marketingRecommendations.eyebrow}
          </p>
          <p className="mt-2 font-semibold text-gray-900">
            {readiness?.state === "learning"
              ? "Still learning from your posts"
              : SAAS_EMPTY.marketingRecommendations.title}
          </p>
          <p className="mt-1">
            {readiness?.message ?? SAAS_EMPTY.marketingRecommendations.description}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {recommendations.map((item) => (
            <RecommendationCard key={item.id} item={item} />
          ))}
        </ul>
      )}
    </div>
  )
}
