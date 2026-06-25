"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { Fish, Loader2, Sparkles } from "lucide-react"
import ProtectedShell from "@/app/components/ProtectedShell"
import Toast, { type ToastPayload } from "@/app/components/Toast"
import HookLibraryPanel from "@/components/marketing/HookLibraryPanel"
import MarketingGenerationStagePanel from "@/components/marketing/MarketingGenerationStagePanel"
import SaasEmptyState from "@/components/ui/saas-empty-state"
import Input from "@/components/ui/input"
import { useMarketingGenerationStages } from "@/app/hooks/useMarketingGenerationStages"
import { successToast } from "@/lib/copy/success-toasts"
import { DEFAULT_CAMPAIGN_TARGET_AUDIENCE } from "@/lib/marketing/campaign-content-types"
import {
  CAMPAIGN_GOALS,
  type CampaignGoal,
} from "@/lib/marketing/marketing-campaign-types"
import { HOOK_LIBRARY_GENERATION_STAGES } from "@/lib/marketing/generation-stages"
import type { HookLibraryItem } from "@/lib/marketing/hook-library"
import {
  MARKETING_SELECTABLE_PLATFORMS_LOWERCASE,
  MARKETING_TARGET_AUDIENCES,
} from "@/lib/marketing/marketing-settings"
import { resolvePlatformFromBrandFocus } from "@/lib/marketing/platform-availability"
import {
  fitcoreCardClass,
  fitcoreLabelClass,
  fitcoreMutedClass,
  fitcoreSurfaceClass,
} from "@/lib/ui/fitcore-form"

function ChipSelector<T extends string>({
  options,
  selected,
  onSelect,
  disabled,
}: {
  options: readonly T[]
  selected: T
  onSelect: (value: T) => void
  disabled?: boolean
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected === option

        return (
          <button
            key={option}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(option)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
              active
                ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}

export default function HookLibraryPage() {
  const [campaignName, setCampaignName] = useState("")
  const [targetAudience, setTargetAudience] = useState<string>(
    DEFAULT_CAMPAIGN_TARGET_AUDIENCE,
  )
  const [platform, setPlatform] = useState("instagram")
  const [campaignGoal, setCampaignGoal] = useState<CampaignGoal>(CAMPAIGN_GOALS[0])
  const [hooks, setHooks] = useState<HookLibraryItem[]>([])
  const [generating, setGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastPayload | null>(null)

  const {
    activeStep: generationStep,
    start: startProgressAnimation,
    stop: stopProgressAnimation,
  } = useMarketingGenerationStages(HOOK_LIBRARY_GENERATION_STAGES.length)

  const loadBrand = useCallback(async () => {
    try {
      const res = await fetch("/api/marketing/brand", { credentials: "include" })
      const data = (await res.json()) as {
        profile?: { platform_focus: string }
      }

      if (!res.ok || !data.profile) return

      const focus = data.profile.platform_focus.trim().toLowerCase()
      setPlatform(resolvePlatformFromBrandFocus(focus))
    } catch {
      // Brand is optional
    }
  }, [])

  useEffect(() => {
    void loadBrand()
  }, [loadBrand])

  const formValid =
    campaignName.trim().length > 0 &&
    targetAudience.trim().length > 0 &&
    platform.trim().length > 0 &&
    campaignGoal.trim().length > 0

  async function generateHooks() {
    if (!formValid || generating) return

    setGenerating(true)
    setErrorMessage(null)
    setToast(null)
    setHooks([])
    startProgressAnimation()

    try {
      const res = await fetch("/api/marketing/hook-library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          campaign_name: campaignName.trim(),
          target_audience: targetAudience,
          platform,
          campaign_goal: campaignGoal,
        }),
      })

      const data = (await res.json()) as {
        hooks?: HookLibraryItem[]
        warning?: string
        error?: { message?: string }
      }

      if (!res.ok || data.error || !data.hooks?.length) {
        setErrorMessage(data.error?.message ?? "Could not generate hooks.")
        return
      }

      setHooks(data.hooks)
      setToast(
        successToast("hookLibraryGenerated", {
          description:
            data.warning ??
            `${data.hooks.length} campaign hooks are ready to copy into your content.`,
        }),
      )
    } catch {
      setErrorMessage("Could not generate hooks.")
    } finally {
      stopProgressAnimation()
      setGenerating(false)
    }
  }

  return (
    <ProtectedShell allowed={["admin", "coach"]}>
      <div className={`p-4 sm:p-6 lg:p-8 ${fitcoreSurfaceClass}`}>
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
            Marketing AI
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Hook Library
          </h1>
          <p className="mt-2 max-w-2xl text-gray-500">
            Generate 10 scroll-stopping hooks per campaign — pain points,
            curiosity loops, mistakes, opportunities, contrarian takes, and
            results.
          </p>
        </header>

        <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <section className="h-fit space-y-5">
            <div className={`${fitcoreCardClass} p-5 sm:p-6`}>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 text-white shadow-sm">
                  <Fish className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">Campaign context</h2>
                  <p className={`text-sm ${fitcoreMutedClass}`}>
                    Hooks are tailored to your audience and goal.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={fitcoreLabelClass} htmlFor="hook-campaign-name">
                    Campaign name
                  </label>
                  <Input
                    id="hook-campaign-name"
                    value={campaignName}
                    onChange={(event) => setCampaignName(event.target.value)}
                    placeholder="Spring member drive"
                    disabled={generating}
                  />
                </div>

                <div>
                  <label className={fitcoreLabelClass}>Target audience</label>
                  <ChipSelector
                    options={MARKETING_TARGET_AUDIENCES}
                    selected={targetAudience}
                    onSelect={setTargetAudience}
                    disabled={generating}
                  />
                </div>

                <div>
                  <label className={fitcoreLabelClass}>Platform</label>
                  <ChipSelector
                    options={MARKETING_SELECTABLE_PLATFORMS_LOWERCASE}
                    selected={platform}
                    onSelect={setPlatform}
                    disabled={generating}
                  />
                </div>

                <div>
                  <label className={fitcoreLabelClass}>Campaign goal</label>
                  <ChipSelector
                    options={CAMPAIGN_GOALS}
                    selected={campaignGoal}
                    onSelect={setCampaignGoal}
                    disabled={generating}
                  />
                </div>

                <button
                  type="button"
                  disabled={!formValid || generating}
                  onClick={() => void generateHooks()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating hooks…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate 10 Hooks
                    </>
                  )}
                </button>
              </div>

              {errorMessage ? (
                <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </p>
              ) : null}
            </div>

            <p className="text-sm text-gray-500">
              Part of a full campaign?{" "}
              <Link
                href="/marketing/campaign-generator"
                className="font-medium text-violet-700 hover:underline"
              >
                Open Campaign Generator
              </Link>{" "}
              — hooks are generated automatically with each campaign.
            </p>
          </section>

          <section className="min-w-0 space-y-5">
            {generating ? (
              <MarketingGenerationStagePanel
                stages={HOOK_LIBRARY_GENERATION_STAGES}
                activeStep={generationStep}
                title="Building your hook library"
                subtitle="Crafting scroll-stopping openers across six storytelling categories."
              />
            ) : null}

            {hooks.length > 0 ? (
              <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">
                <HookLibraryPanel
                  hooks={hooks}
                  campaignName={campaignName}
                />
              </div>
            ) : null}

            {!hooks.length && !generating ? (
              <SaasEmptyState
                preset="marketingCampaigns"
                title="No hooks yet"
                description="Enter campaign details and generate 10 hooks spread across pain point, curiosity, mistake, opportunity, contrarian, and results categories."
                variant="light"
                showAction={false}
              />
            ) : null}
          </section>
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
