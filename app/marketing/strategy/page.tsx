"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { Calendar, Loader2, Sparkles } from "lucide-react"
import ProtectedShell from "@/app/components/ProtectedShell"
import Toast, { type ToastPayload } from "@/app/components/Toast"
import { successToast } from "@/lib/copy/success-toasts"
import StrategyView, {
  type StrategyPlanPost,
} from "@/components/marketing/StrategyView"
import MarketingGenerationStagePanel from "@/components/marketing/MarketingGenerationStagePanel"
import { useMarketingGenerationStages } from "@/app/hooks/useMarketingGenerationStages"
import { STRATEGY_GENERATION_STAGES } from "@/lib/marketing/generation-stages"
import { MARKETING_SELECTABLE_PLATFORMS_LOWERCASE } from "@/lib/marketing/marketing-settings"
import { resolvePlatformFromBrandFocus } from "@/lib/marketing/platform-availability"
import type { MarketingStrategy } from "@/lib/marketing/marketing-strategy-types"

const STRATEGY_GOALS = [
  "growth",
  "engagement",
  "leads",
  "awareness",
  "retention",
] as const

const DURATION_OPTIONS = [7, 14, 30] as const

type StrategyGoal = (typeof STRATEGY_GOALS)[number]
type DurationDays = (typeof DURATION_OPTIONS)[number]

type StrategyResponse = {
  id?: string
  strategy?: MarketingStrategy
  brand?: string
  posts?: StrategyPlanPost[]
  warning?: string
  error?: { message?: string } | string
}

function ChipSelector<T extends string | number>({
  options,
  selected,
  onSelect,
  disabled,
  formatLabel,
}: {
  options: readonly T[]
  selected: T
  onSelect: (value: T) => void
  disabled?: boolean
  formatLabel?: (value: T) => string
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected === option
        const label = formatLabel ? formatLabel(option) : String(option)

        return (
          <button
            key={String(option)}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(option)}
            className={`rounded-full border px-4 py-2 text-sm font-medium capitalize transition disabled:opacity-50 ${
              active
                ? "border-black bg-black text-white"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

export default function StrategyPage() {
  const [loading, setLoading] = useState(false)
  const [loadingBrand, setLoadingBrand] = useState(true)
  const [brandId, setBrandId] = useState<string | null>(null)
  const [brandName, setBrandName] = useState<string | null>(null)
  const [strategy, setStrategy] = useState<MarketingStrategy | null>(null)
  const [planPosts, setPlanPosts] = useState<StrategyPlanPost[]>([])
  const [contentPlanId, setContentPlanId] = useState<string | null>(null)
  const [goal, setGoal] = useState<StrategyGoal>("growth")
  const [platform, setPlatform] = useState("instagram")
  const [durationDays, setDurationDays] = useState<DurationDays>(7)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastPayload | null>(null)

  const {
    activeStep: generationStep,
    start: startProgressAnimation,
    stop: stopProgressAnimation,
  } = useMarketingGenerationStages(STRATEGY_GENERATION_STAGES.length)

  const loadBrand = useCallback(async () => {
    setLoadingBrand(true)
    setErrorMessage(null)

    try {
      const res = await fetch("/api/marketing/brand", { credentials: "include" })
      const data = (await res.json()) as {
        error?: string
        profile?: { id: string | null; name: string; platform_focus: string }
      }

      if (!res.ok) {
        setErrorMessage(data.error ?? "Could not load brand profile.")
        return
      }

      const profile = data.profile
      if (!profile?.id) {
        setErrorMessage(
          "Set up your brand profile first so the strategist knows your voice and audience.",
        )
        return
      }

      setBrandId(profile.id)
      setBrandName(profile.name || null)

      const focus = profile.platform_focus.trim().toLowerCase()
      setPlatform(resolvePlatformFromBrandFocus(focus))
    } catch {
      setErrorMessage("Could not load brand profile.")
    } finally {
      setLoadingBrand(false)
    }
  }, [])

  useEffect(() => {
    void loadBrand()
  }, [loadBrand])

  async function generateStrategy() {
    if (!brandId) return

    setLoading(true)
    setErrorMessage(null)
    setToast(null)
    setStrategy(null)
    setPlanPosts([])
    setContentPlanId(null)
    startProgressAnimation()

    try {
      const res = await fetch("/api/marketing-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          brand_id: brandId,
          goal,
          platform,
          duration_days: durationDays,
        }),
      })

      const data = (await res.json()) as StrategyResponse

      if (!res.ok) {
        const message =
          typeof data.error === "string"
            ? data.error
            : data.error?.message ?? "Could not generate strategy."
        setErrorMessage(message)
        return
      }

      if (!data.strategy) {
        setErrorMessage("No strategy returned.")
        return
      }

      setStrategy(data.strategy)
      setPlanPosts(data.posts ?? [])
      setContentPlanId(data.id ?? null)
      setToast(
        successToast("contentIdeasGenerated", {
          description:
            data.warning ??
            "Strategy generated. Draft posts are ready on your calendar.",
        }),
      )
      if (data.brand) {
        setBrandName(data.brand)
      }
    } catch {
      setErrorMessage("Could not generate strategy.")
    } finally {
      stopProgressAnimation()
      setLoading(false)
    }
  }

  return (
    <ProtectedShell allowed={["admin", "coach"]}>
      <div className="p-6">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.3em] text-cyan-600">
              Marketing AI
            </p>
            <h1 className="text-4xl font-bold text-black">
              Marketing AI Strategist
            </h1>
            <p className="mt-2 max-w-2xl text-gray-500">
              Generate a multi-day content plan tailored to your brand, then
              send drafts straight to your calendar.
            </p>
          </div>

          <Link
            href="/marketing/calendar"
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition hover:border-black"
          >
            <Calendar className="h-4 w-4" />
            Calendar
          </Link>
        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          {loadingBrand ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading brand profile…
            </div>
          ) : (
            <div className="space-y-6">
              {brandName ? (
                <p className="text-sm text-gray-600">
                  Brand: <span className="font-medium text-black">{brandName}</span>
                </p>
              ) : null}

              <div>
                <p className="mb-3 text-sm font-medium text-gray-700">Goal</p>
                <ChipSelector
                  options={STRATEGY_GOALS}
                  selected={goal}
                  onSelect={setGoal}
                  disabled={loading || !brandId}
                />
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-gray-700">Platform</p>
                <ChipSelector
                  options={MARKETING_SELECTABLE_PLATFORMS_LOWERCASE}
                  selected={platform}
                  onSelect={setPlatform}
                  disabled={loading || !brandId}
                />
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-gray-700">Duration</p>
                <ChipSelector
                  options={DURATION_OPTIONS}
                  selected={durationDays}
                  onSelect={setDurationDays}
                  disabled={loading || !brandId}
                  formatLabel={(days) => `${days} days`}
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 border-t border-gray-100 pt-6">
                <button
                  type="button"
                  disabled={loading || !brandId}
                  onClick={() => void generateStrategy()}
                  className="inline-flex items-center gap-2 rounded-2xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Generate Strategy
                    </>
                  )}
                </button>

                {!brandId ? (
                  <Link
                    href="/dashboard/marketing/brand"
                    className="text-sm font-medium text-cyan-700 hover:underline"
                  >
                    Set up brand profile →
                  </Link>
                ) : null}
              </div>
            </div>
          )}

          {loading && !strategy ? (
            <MarketingGenerationStagePanel
              stages={STRATEGY_GENERATION_STAGES}
              activeStep={generationStep}
              title="Building your marketing strategy"
              subtitle="Mapping pillars, calendar, and post drafts for your brand."
            />
          ) : null}

          {strategy && brandId ? (
            <StrategyView
              strategy={strategy}
              posts={planPosts}
              platform={platform}
              brandId={brandId}
              contentPlanId={contentPlanId}
              onScheduledAll={(posts) => {
                setPlanPosts((current) => {
                  const byId = new Map(current.map((post) => [post.id, post]))
                  for (const post of posts) {
                    byId.set(post.id, post)
                  }
                  return Array.from(byId.values())
                })
                setToast(successToast("campaignPublished"))
              }}
            />
          ) : null}

          {errorMessage ? (
            <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </p>
          ) : null}
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
