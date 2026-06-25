"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { Loader2, Megaphone, Sparkles } from "lucide-react"
import ProtectedShell from "@/app/components/ProtectedShell"
import Toast, { type ToastPayload } from "@/app/components/Toast"
import CtaGeneratorPanel from "@/components/marketing/CtaGeneratorPanel"
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
import { CTA_GENERATOR_STAGES } from "@/lib/marketing/generation-stages"
import type { CtaGeneratorItem } from "@/lib/marketing/cta-generator"
import {
  MARKETING_SELECTABLE_PLATFORMS_LOWERCASE,
  MARKETING_TARGET_AUDIENCES,
} from "@/lib/marketing/marketing-settings"
import { resolvePlatformFromBrandFocus } from "@/lib/marketing/platform-availability"
import { FITCORE_BRAND_NAME } from "@/lib/marketing/visual-identity"
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

export default function CtaGeneratorPage() {
  const [campaignName, setCampaignName] = useState("")
  const [brandName, setBrandName] = useState(FITCORE_BRAND_NAME)
  const [targetAudience, setTargetAudience] = useState<string>(
    DEFAULT_CAMPAIGN_TARGET_AUDIENCE,
  )
  const [platform, setPlatform] = useState("instagram")
  const [campaignGoal, setCampaignGoal] = useState<CampaignGoal>(CAMPAIGN_GOALS[0])
  const [ctas, setCtas] = useState<CtaGeneratorItem[]>([])
  const [generating, setGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastPayload | null>(null)

  const {
    activeStep: generationStep,
    start: startProgressAnimation,
    stop: stopProgressAnimation,
  } = useMarketingGenerationStages(CTA_GENERATOR_STAGES.length)

  const loadBrand = useCallback(async () => {
    try {
      const res = await fetch("/api/marketing/brand", { credentials: "include" })
      const data = (await res.json()) as {
        profile?: { name?: string; platform_focus?: string }
      }

      if (!res.ok || !data.profile) return

      if (data.profile.name?.trim()) {
        setBrandName(data.profile.name.trim())
        setCampaignName((current) => current.trim() || data.profile!.name!.trim())
      }

      const focus = data.profile.platform_focus?.trim().toLowerCase() ?? ""
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

  async function generateCtas() {
    if (!formValid || generating) return

    setGenerating(true)
    setErrorMessage(null)
    setToast(null)
    setCtas([])
    startProgressAnimation()

    try {
      const res = await fetch("/api/marketing/cta-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          campaign_name: campaignName.trim(),
          brand_name: brandName.trim(),
          target_audience: targetAudience,
          platform,
          campaign_goal: campaignGoal,
        }),
      })

      const data = (await res.json()) as {
        ctas?: CtaGeneratorItem[]
        warning?: string
        error?: { message?: string }
      }

      if (!res.ok || data.error || !data.ctas?.length) {
        setErrorMessage(data.error?.message ?? "Could not generate CTAs.")
        return
      }

      setCtas(data.ctas)
      setToast(
        successToast("ctaGeneratorGenerated", {
          description:
            data.warning ??
            `${data.ctas.length} CTA variations are ready to copy into your videos and posts.`,
        }),
      )
    } catch {
      setErrorMessage("Could not generate CTAs.")
    } finally {
      stopProgressAnimation()
      setGenerating(false)
    }
  }

  return (
    <ProtectedShell allowed={["admin", "coach"]}>
      <div className={`p-4 sm:p-6 lg:p-8 ${fitcoreSurfaceClass}`}>
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Marketing AI
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            CTA Generator
          </h1>
          <p className="mt-2 max-w-2xl text-gray-500">
            Generate 5 conversion-ready CTA variations — business launch, early
            access, platform value, free trial, and direct action.
          </p>
        </header>

        <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <section className="h-fit space-y-5">
            <div className={`${fitcoreCardClass} p-5 sm:p-6`}>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-sm">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">Campaign context</h2>
                  <p className={`text-sm ${fitcoreMutedClass}`}>
                    CTAs tailored to your audience and goal.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={fitcoreLabelClass} htmlFor="cta-campaign-name">
                    Campaign name
                  </label>
                  <Input
                    id="cta-campaign-name"
                    value={campaignName}
                    onChange={(event) => setCampaignName(event.target.value)}
                    placeholder="Spring member drive"
                    disabled={generating}
                  />
                </div>

                <div>
                  <label className={fitcoreLabelClass} htmlFor="cta-brand-name">
                    Brand name
                  </label>
                  <Input
                    id="cta-brand-name"
                    value={brandName}
                    onChange={(event) => setBrandName(event.target.value)}
                    placeholder={FITCORE_BRAND_NAME}
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
                  onClick={() => void generateCtas()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating CTAs…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate 5 CTAs
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
              Pair with hooks?{" "}
              <Link
                href="/marketing/hook-library"
                className="font-medium text-emerald-700 hover:underline"
              >
                Open Hook Library
              </Link>{" "}
              for scroll-stopping openers to match your CTAs.
            </p>
          </section>

          <section className="min-w-0 space-y-5">
            {generating ? (
              <MarketingGenerationStagePanel
                stages={CTA_GENERATOR_STAGES}
                activeStep={generationStep}
                title="Generating your CTAs"
                subtitle="Writing conversion-ready calls to action across five categories."
              />
            ) : null}

            {ctas.length > 0 ? (
              <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">
                <CtaGeneratorPanel
                  ctas={ctas}
                  campaignName={campaignName}
                  showReference={false}
                />
              </div>
            ) : (
              <CtaGeneratorPanel ctas={[]} showReference />
            )}

            {!ctas.length && !generating ? (
              <SaasEmptyState
                preset="marketingCta"
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
