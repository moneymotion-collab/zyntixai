"use client"

import { useState } from "react"
import {
  ArrowRight,
  Check,
  Copy,
  Loader2,
  Sparkles,
  TrendingUp,
  Wand2,
  X,
} from "lucide-react"
import {
  applyOptimizedPost,
  requestMarketingOptimizePost,
  type AppliedOptimizedPost,
  type MarketingOptimizeResult,
  type MarketingOptimizeSourceTable,
} from "@/lib/marketing/marketing-optimize-client"
import { optimizeSocialPostDemo } from "@/lib/marketing/optimize-social-post"
import { scorePostContent } from "@/lib/marketing/score-post-content"

type PostOptimizationFlowProps = {
  postId: string
  sourceTable: MarketingOptimizeSourceTable
  originalTitle: string
  originalCaption: string
  originalHashtags?: string
  platform?: string
  demoMode?: boolean
  disabled?: boolean
  variant?: "default" | "compact" | "calendar"
  onApplied?: (applied: AppliedOptimizedPost) => void
  onError?: (message: string) => void
}

function buildDemoOptimization(input: {
  title: string
  caption: string
  hashtags: string
  platform?: string
}): MarketingOptimizeResult {
  const scored = scorePostContent({
    title: input.title,
    content: input.caption,
    hashtags: input.hashtags,
    platform: input.platform,
  })

  const demo = optimizeSocialPostDemo({
    title: input.title,
    caption: input.caption,
    hashtags: input.hashtags,
    platform: input.platform,
    viral_score: scored.score,
  })

  return {
    original_score: scored.score,
    optimized_score: demo.predicted_score,
    optimized_title: demo.optimized_title,
    optimized_content: demo.optimized_content,
    optimized_caption: demo.optimized_content,
    optimized_hashtags: demo.optimized_hashtags,
    optimization_reason: demo.changes[0] ?? "Optimized for stronger engagement and clarity.",
    improvements: demo.changes,
    warning: "Demo mode — showing sample optimization.",
  }
}

function ScorePill({
  label,
  score,
  highlight,
}: {
  label: string
  score: number
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 ${
        highlight
          ? "border-emerald-200 bg-emerald-50"
          : "border-gray-200 bg-gray-50"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p
        className={`mt-1 text-3xl font-bold ${
          highlight ? "text-emerald-700" : "text-gray-900"
        }`}
      >
        {score}
        <span className="text-base font-semibold text-gray-400">/100</span>
      </p>
    </div>
  )
}

export default function PostOptimizationFlow({
  postId,
  sourceTable,
  originalTitle,
  originalCaption,
  originalHashtags = "",
  platform,
  demoMode = false,
  disabled = false,
  variant = "default",
  onApplied,
  onError,
}: PostOptimizationFlowProps) {
  const [loading, setLoading] = useState(false)
  const [applying, setApplying] = useState(false)
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle")
  const [result, setResult] = useState<MarketingOptimizeResult | null>(null)
  const [panelError, setPanelError] = useState<string | null>(null)

  const buttonClass =
    variant === "calendar"
      ? "inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-5 py-3 text-base font-semibold text-violet-900 transition hover:border-violet-300 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
      : variant === "compact"
        ? "inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        : "inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-900 transition hover:border-violet-300 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"

  async function handleOptimize() {
    if (loading || disabled) return

    setLoading(true)
    setPanelError(null)
    setResult(null)
    setCopyState("idle")

    try {
      if (demoMode) {
        const demoResult = buildDemoOptimization({
          title: originalTitle,
          caption: originalCaption,
          hashtags: originalHashtags,
          platform,
        })
        setResult(demoResult)
        return
      }

      const optimization = await requestMarketingOptimizePost(postId, sourceTable)
      setResult(optimization)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not optimize post."
      setPanelError(message)
      onError?.(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleApply() {
    if (!result || applying) return

    setApplying(true)
    setPanelError(null)

    try {
      const applied = demoMode
        ? {
            title: result.optimized_title,
            caption: result.optimized_caption,
            hashtags: result.optimized_hashtags,
          }
        : await applyOptimizedPost(postId, sourceTable)

      onApplied?.(applied)
      setResult(null)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not apply optimized version."
      setPanelError(message)
      onError?.(message)
    } finally {
      setApplying(false)
    }
  }

  async function handleCopy() {
    if (!result) return

    const text = [result.optimized_caption, result.optimized_hashtags]
      .filter(Boolean)
      .join("\n\n")

    try {
      await navigator.clipboard.writeText(text)
      setCopyState("copied")
      window.setTimeout(() => setCopyState("idle"), 2000)
    } catch {
      setPanelError("Could not copy to clipboard.")
    }
  }

  const scoreDelta =
    result != null ? result.optimized_score - result.original_score : 0

  return (
    <div className="space-y-4">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => void handleOptimize()}
        className={buttonClass}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Optimizing...
          </>
        ) : (
          <>
            <Wand2 className="h-4 w-4" />
            Optimize Post
          </>
        )}
      </button>

      {panelError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {panelError}
        </p>
      ) : null}

      {result ? (
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-gradient-to-r from-slate-50 via-white to-violet-50/60 px-5 py-4 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-violet-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Optimization Results
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Compare the original post with the AI-optimized version.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setResult(null)}
                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close optimization panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <ScorePill label="Original Score" score={result.original_score} />
              <div className="hidden justify-center sm:flex">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
              <ScorePill
                label="Optimized Score"
                score={result.optimized_score}
                highlight
              />
            </div>

            {scoreDelta > 0 ? (
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800">
                <TrendingUp className="h-4 w-4" />
                +{scoreDelta} point improvement
              </p>
            ) : null}

            {result.warning ? (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {result.warning}
              </p>
            ) : null}

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Original Caption
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                  {originalCaption || "No caption provided."}
                </p>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">
                  Optimized Caption
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                  {result.optimized_caption}
                </p>
              </div>
            </div>

            {result.optimized_hashtags ? (
              <div className="rounded-xl border border-cyan-200 bg-cyan-50/50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-cyan-800">
                  Improved Hashtags
                </p>
                <p className="mt-2 text-sm font-medium text-cyan-900">
                  {result.optimized_hashtags}
                </p>
              </div>
            ) : null}

            <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-violet-800">
                Why this is better
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-800">
                {result.optimization_reason}
              </p>
            </div>

            {result.improvements.length > 0 ? (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Improvements
                </p>
                <ul className="mt-3 space-y-2">
                  {result.improvements.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex flex-col gap-2 border-t border-gray-100 pt-5 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                disabled={applying}
                onClick={() => void handleApply()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
              >
                {applying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  "Apply optimized version"
                )}
              </button>

              <button
                type="button"
                onClick={() => setResult(null)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
              >
                Keep original
              </button>

              <button
                type="button"
                onClick={() => void handleCopy()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
              >
                {copyState === "copied" ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy optimized caption
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}
