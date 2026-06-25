"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import {
  Check,
  Loader2,
  Megaphone,
  Save,
  Sparkles,
  Users,
} from "lucide-react"
import ProtectedShell from "@/app/components/ProtectedShell"
import SaasEmptyState from "@/components/ui/saas-empty-state"
import Toast, { type ToastPayload } from "@/app/components/Toast"
import { successToast } from "@/lib/copy/success-toasts"
import CampaignResultView from "@/components/marketing/CampaignResultView"
import HookLibraryPanel from "@/components/marketing/HookLibraryPanel"
import MarketingGenerationStagePanel from "@/components/marketing/MarketingGenerationStagePanel"
import { useMarketingGenerationStages } from "@/app/hooks/useMarketingGenerationStages"
import { CAMPAIGN_GENERATION_STAGES } from "@/lib/marketing/generation-stages"
import type { CampaignContentItem } from "@/lib/marketing/campaign-content-types"
import type { HookLibraryItem } from "@/lib/marketing/hook-library"
import { DEFAULT_CAMPAIGN_TARGET_AUDIENCE } from "@/lib/marketing/campaign-content-types"
import {
  CAMPAIGN_DURATIONS,
  CAMPAIGN_GOALS,
  type CampaignDuration,
  type CampaignGoal,
} from "@/lib/marketing/marketing-campaign-types"
import {
  MARKETING_SELECTABLE_PLATFORMS_LOWERCASE,
  MARKETING_TARGET_AUDIENCES,
} from "@/lib/marketing/marketing-settings"
import { resolvePlatformFromBrandFocus } from "@/lib/marketing/platform-availability"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import Input from "@/components/ui/input"
import {
  fitcoreCardClass,
  fitcoreLabelClass,
  fitcoreMutedClass,
  fitcoreSurfaceClass,
} from "@/lib/ui/fitcore-form"

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
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
              active
                ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

type SavedCampaignSummary = {
  id: string
  name: string
  platform: string
  duration_days: number
  status: string
  created_at: string
}

export default function CampaignGeneratorPage() {
  const [campaignName, setCampaignName] = useState("")
  const [targetAudience, setTargetAudience] = useState<string>(
    DEFAULT_CAMPAIGN_TARGET_AUDIENCE,
  )
  const [platform, setPlatform] = useState("instagram")
  const [campaignGoal, setCampaignGoal] = useState<CampaignGoal>(
    CAMPAIGN_GOALS[0],
  )
  const [durationDays, setDurationDays] = useState<CampaignDuration>(14)
  const [brandId, setBrandId] = useState<string | null>(null)
  const [brandName, setBrandName] = useState<string | null>(null)

  const [generatedItems, setGeneratedItems] = useState<CampaignContentItem[]>([])
  const [generatedHooks, setGeneratedHooks] = useState<HookLibraryItem[]>([])
  const [savedCampaignId, setSavedCampaignId] = useState<string | null>(null)
  const [savedCampaigns, setSavedCampaigns] = useState<SavedCampaignSummary[]>(
    [],
  )

  const [loadingBrand, setLoadingBrand] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadingCampaigns, setLoadingCampaigns] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastPayload | null>(null)

  const {
    activeStep: generationStep,
    start: startProgressAnimation,
    stop: stopProgressAnimation,
  } = useMarketingGenerationStages(CAMPAIGN_GENERATION_STAGES.length)

  const loadBrand = useCallback(async () => {
    setLoadingBrand(true)

    try {
      const res = await fetch("/api/marketing/brand", { credentials: "include" })
      const data = (await res.json()) as {
        error?: string
        profile?: { id: string | null; name: string; platform_focus: string }
      }

      if (!res.ok || !data.profile?.id) return

      setBrandId(data.profile.id)
      setBrandName(data.profile.name || null)

      const focus = data.profile.platform_focus.trim().toLowerCase()
      setPlatform(resolvePlatformFromBrandFocus(focus))
    } catch {
      // Brand is optional for campaign generation
    } finally {
      setLoadingBrand(false)
    }
  }, [])

  const loadSavedCampaigns = useCallback(async () => {
    setLoadingCampaigns(true)

    try {
      const res = await fetch("/api/marketing/campaigns", {
        credentials: "include",
      })
      const data = (await res.json()) as {
        campaigns?: SavedCampaignSummary[]
        error?: { message?: string }
      }

      if (res.ok && data.campaigns) {
        setSavedCampaigns(data.campaigns)
      }
    } catch {
      // Non-blocking
    } finally {
      setLoadingCampaigns(false)
    }
  }, [])

  useEffect(() => {
    void loadBrand()
    void loadSavedCampaigns()
  }, [loadBrand, loadSavedCampaigns])

  const formValid =
    campaignName.trim().length > 0 &&
    targetAudience.trim().length > 0 &&
    platform.trim().length > 0 &&
    campaignGoal.trim().length > 0

  async function generateCampaign() {
    if (!formValid || generating) return

    setGenerating(true)
    setErrorMessage(null)
    setToast(null)
    setGeneratedItems([])
    setGeneratedHooks([])
    setSavedCampaignId(null)
    startProgressAnimation()

    try {
      const [campaignRes, hooksRes] = await Promise.all([
        fetch("/api/marketing/generate-campaign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            campaign_name: campaignName.trim(),
            target_audience: targetAudience,
            platform,
            campaign_goal: campaignGoal,
            duration_days: durationDays,
          }),
        }),
        fetch("/api/marketing/hook-library", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            campaign_name: campaignName.trim(),
            target_audience: targetAudience,
            platform,
            campaign_goal: campaignGoal,
          }),
        }),
      ])

      const data = (await campaignRes.json()) as {
        items?: CampaignContentItem[]
        warning?: string
        error?: { message?: string }
      }

      const hooksData = (await hooksRes.json()) as {
        hooks?: HookLibraryItem[]
      }

      if (!campaignRes.ok || data.error || !data.items?.length) {
        setErrorMessage(
          data.error?.message ?? "Could not generate campaign.",
        )
        return
      }

      setGeneratedItems(data.items)
      if (hooksData.hooks?.length) {
        setGeneratedHooks(hooksData.hooks)
      }
      setToast(
        successToast("campaignGenerated", {
          description:
            data.warning ??
            `${data.items.length} daily posts are ready. Review and save when ready.`,
        }),
      )
    } catch {
      setErrorMessage("Could not generate campaign.")
    } finally {
      stopProgressAnimation()
      setGenerating(false)
    }
  }

  async function saveCampaign() {
    if (!generatedItems.length || saving) return

    setSaving(true)
    setErrorMessage(null)
    setToast(null)

    try {
      const res = await fetch("/api/marketing/campaigns/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: savedCampaignId,
          name: campaignName.trim(),
          target_audience: targetAudience,
          platform,
          campaign_goal: campaignGoal,
          duration_days: durationDays,
          campaign: { items: generatedItems },
          brand_id: brandId,
        }),
      })

      const data = (await res.json()) as {
        campaign?: { id: string }
        error?: { message?: string }
      }

      if (!res.ok || data.error) {
        setErrorMessage(data.error?.message ?? "Could not save campaign.")
        return
      }

      if (data.campaign?.id) {
        setSavedCampaignId(data.campaign.id)
      }

      setToast(successToast("campaignSaved"))
      void loadSavedCampaigns()
    } catch {
      setErrorMessage("Could not save campaign.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <ProtectedShell allowed={["admin", "coach"]}>
      <div className={`p-4 sm:p-6 lg:p-8 ${fitcoreSurfaceClass}`}>
        <header className="mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                Marketing AI
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Campaign Generator
              </h1>
              <p className="mt-2 max-w-2xl text-gray-500">
                Plan multi-week marketing campaigns for FitCore AI with one
                AI-generated post per day — hooks, captions, hashtags, and CTAs.
              </p>
            </div>

            {brandName ? (
              <div className="inline-flex items-center gap-2 self-start rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 shadow-sm">
                <Users className="h-4 w-4 text-violet-500" />
                Brand: <span className="font-medium text-gray-900">{brandName}</span>
              </div>
            ) : null}
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <section id="campaign-form" className="h-fit space-y-5">
            <div className={`${fitcoreCardClass} p-5 sm:p-6`}>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 text-white shadow-sm">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">Campaign setup</h2>
                  <p className={`text-sm ${fitcoreMutedClass}`}>
                    Define your campaign parameters
                  </p>
                </div>
              </div>

              {loadingBrand ? (
                <div className={`mb-4 flex items-center gap-2 text-sm ${fitcoreMutedClass}`}>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading brand context…
                </div>
              ) : null}

              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="campaign-name"
                    className={fitcoreLabelClass}
                  >
                    Campaign Name
                  </label>
                  <Input
                    id="campaign-name"
                    type="text"
                    value={campaignName}
                    onChange={(event) => setCampaignName(event.target.value)}
                    disabled={generating || saving}
                    placeholder="e.g. Summer Membership Drive"
                  />
                </div>

                <div>
                  <p className={fitcoreLabelClass}>
                    Target Audience
                  </p>
                  <ChipSelector
                    options={[
                      DEFAULT_CAMPAIGN_TARGET_AUDIENCE,
                      ...MARKETING_TARGET_AUDIENCES,
                    ]}
                    selected={targetAudience}
                    onSelect={setTargetAudience}
                    disabled={generating || saving}
                  />
                </div>

                <div>
                  <p className={fitcoreLabelClass}>Platform</p>
                  <ChipSelector
                    options={MARKETING_SELECTABLE_PLATFORMS_LOWERCASE}
                    selected={platform}
                    onSelect={setPlatform}
                    disabled={generating || saving}
                    formatLabel={(value) =>
                      String(value).charAt(0).toUpperCase() +
                      String(value).slice(1)
                    }
                  />
                </div>

                <div>
                  <p className={fitcoreLabelClass}>
                    Campaign Goal
                  </p>
                  <ChipSelector
                    options={CAMPAIGN_GOALS}
                    selected={campaignGoal}
                    onSelect={setCampaignGoal}
                    disabled={generating || saving}
                  />
                </div>

                <div>
                  <p className={fitcoreLabelClass}>Duration</p>
                  <ChipSelector
                    options={CAMPAIGN_DURATIONS}
                    selected={durationDays}
                    onSelect={setDurationDays}
                    disabled={generating || saving}
                    formatLabel={(days) => `${days} days`}
                  />
                </div>

                <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row">
                  <button
                    type="button"
                    disabled={!formValid || generating || saving}
                    onClick={() => void generateCampaign()}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating…
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate Campaign
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={!generatedItems.length || saving || generating}
                    onClick={() => void saveCampaign()}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Campaign
                      </>
                    )}
                  </button>
                </div>
              </div>

              {errorMessage ? (
                <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </p>
              ) : null}

              {!brandId && !loadingBrand ? (
                <p className="mt-4 text-sm text-gray-500">
                  <Link
                    href="/dashboard/marketing/brand"
                    className="font-medium text-violet-700 hover:underline"
                  >
                    Set up your brand profile
                  </Link>{" "}
                  for more tailored campaigns.
                </p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Saved campaigns
              </h3>

              {loadingCampaigns ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading…
                </div>
              ) : savedCampaigns.length === 0 ? (
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-800">
                    {SAAS_EMPTY.marketingCampaigns.title}
                  </span>
                  {" — "}
                  {SAAS_EMPTY.marketingCampaigns.description}
                </p>
              ) : (
                <ul className="space-y-2">
                  {savedCampaigns.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.platform} · {item.duration_days} days ·{" "}
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="min-w-0 space-y-5">
            {generating ? (
              <MarketingGenerationStagePanel
                stages={CAMPAIGN_GENERATION_STAGES}
                activeStep={generationStep}
                title="Generating your campaign"
                subtitle="Building a multi-day content plan tailored to your audience and goals."
              />
            ) : null}

            {generatedItems.length > 0 ? (
              <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {campaignName || "Generated campaign"}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {durationDays}-day plan · {platform} · {campaignGoal}
                    </p>
                  </div>
                  {savedCampaignId ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                      <Check className="h-3.5 w-3.5" />
                      Saved
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                      Unsaved draft
                    </span>
                  )}
                </div>

                <CampaignResultView
                  items={generatedItems}
                  campaignName={campaignName || "Generated campaign"}
                  durationDays={durationDays}
                  platform={platform}
                  campaignGoal={campaignGoal}
                />

                {generatedHooks.length > 0 ? (
                  <div className="mt-8 border-t border-gray-100 pt-8">
                    <HookLibraryPanel
                      hooks={generatedHooks}
                      campaignName={campaignName || "Generated campaign"}
                      compact
                    />
                  </div>
                ) : null}
              </div>
            ) : null}

            {!generatedItems.length && !generating ? (
              <SaasEmptyState preset="marketingCampaigns" variant="light" />
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
