"use client"

import { useCallback, useEffect, useState } from "react"
import { Brain, Loader2, RefreshCw } from "lucide-react"
import { LEARNING_MIN_POSTS } from "@/lib/marketing/learning/types"
import {
  runLearningEngineClient,
  type LearningRunApiResponse,
} from "@/lib/marketing/learning/fetch-learning-run-client"
import { fetchMarketingAnalytics } from "@/lib/marketing/content-performance/fetch-marketing-analytics-client"
import LearningEngineDashboard from "@/components/marketing/learning/LearningEngineDashboard"
import LearningEmptyState from "@/components/marketing/learning/LearningEmptyState"
import LearningErrorState from "@/components/marketing/learning/LearningErrorState"
import LearningLoadingSkeleton from "@/components/marketing/learning/LearningLoadingSkeleton"
import LearningNotEnoughDataState from "@/components/marketing/learning/LearningNotEnoughDataState"

type PagePhase =
  | "loading"
  | "empty"
  | "learning"
  | "not_enough"
  | "ready"
  | "running"
  | "success"
  | "error"

export default function LearningEnginePageContent() {
  const [phase, setPhase] = useState<PagePhase>("loading")
  const [postCount, setPostCount] = useState(0)
  const [result, setResult] = useState<LearningRunApiResponse | null>(null)
  const [notEnoughMessage, setNotEnoughMessage] = useState<string | undefined>()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadPostCount = useCallback(async () => {
    const analytics = await fetchMarketingAnalytics()
    return analytics.totals.totalPostsTracked
  }, [])

  const initialize = useCallback(async () => {
    setPhase("loading")
    setErrorMessage(null)

    try {
      const count = await loadPostCount()
      setPostCount(count)

      if (count === 0) {
        setPhase("empty")
        return
      }

      if (count < LEARNING_MIN_POSTS) {
        setPhase(count > 0 ? "learning" : "not_enough")
        return
      }

      setPhase("ready")
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Could not load performance data.",
      )
      setPhase("error")
    }
  }, [loadPostCount])

  const runLearning = useCallback(async () => {
    setPhase("running")
    setErrorMessage(null)
    setNotEnoughMessage(undefined)

    try {
      const count = await loadPostCount()
      setPostCount(count)

      if (count === 0) {
        setPhase("empty")
        return
      }

      if (count < LEARNING_MIN_POSTS) {
        setPhase(count > 0 ? "learning" : "not_enough")
        return
      }

      const data = await runLearningEngineClient()

      if (data.message && !data.learning_profile) {
        setNotEnoughMessage(data.message)
        setPhase("not_enough")
        return
      }

      if (!data.learning_profile) {
        setErrorMessage("Learning completed but no profile was returned.")
        setPhase("error")
        return
      }

      setResult(data)
      setPhase("success")
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Could not run the learning engine.",
      )
      setPhase("error")
    }
  }, [loadPostCount])

  useEffect(() => {
    void initialize()
  }, [initialize])

  const showRunButton =
    phase !== "loading" && phase !== "empty" && phase !== "learning"
  const isRunning = phase === "running"

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
            Rule-based analysis
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {phase === "success"
              ? "Profile generated from your latest content performance data."
              : "Analyze hooks, CTAs, platforms, and posting times from your published content."}
          </p>
        </div>

        {showRunButton ? (
          <button
            type="button"
            onClick={() => void runLearning()}
            disabled={isRunning || phase === "not_enough"}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running analysis…
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                Run Learning
              </>
            )}
          </button>
        ) : null}
      </div>

      {phase === "loading" || phase === "running" ? <LearningLoadingSkeleton /> : null}

      {phase === "empty" ? <LearningEmptyState /> : null}

      {phase === "not_enough" ? (
        <LearningNotEnoughDataState
          postCount={postCount}
          message={notEnoughMessage}
          variant="not_enough"
        />
      ) : null}

      {phase === "learning" ? (
        <LearningNotEnoughDataState
          postCount={postCount}
          message={notEnoughMessage}
          variant="learning"
        />
      ) : null}

      {phase === "ready" ? (
        <div className="rounded-2xl border border-dashed border-indigo-200 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/50 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
            <Brain className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Ready to learn from your content
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">
            You have {postCount} tracked posts. Run the Learning Engine to detect
            your best hooks, CTAs, platforms, and posting windows.
          </p>
          <button
            type="button"
            onClick={() => void runLearning()}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            <Brain className="h-4 w-4" />
            Run Learning
          </button>
        </div>
      ) : null}

      {phase === "error" && errorMessage ? (
        <LearningErrorState
          message={errorMessage}
          onRetry={() => void (result ? runLearning() : initialize())}
        />
      ) : null}

      {phase === "success" && result ? (
        <>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => void runLearning()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            >
              <RefreshCw className="h-4 w-4" />
              Re-run analysis
            </button>
          </div>
          <LearningEngineDashboard data={result} />
        </>
      ) : null}
    </div>
  )
}
