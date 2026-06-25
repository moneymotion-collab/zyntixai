"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { BookOpen, Loader2, Sparkles } from "lucide-react"
import ProtectedShell from "@/app/components/ProtectedShell"
import StoryStructurePanel from "@/components/marketing/StoryStructurePanel"
import MarketingGenerationStagePanel from "@/components/marketing/MarketingGenerationStagePanel"
import SaasEmptyState from "@/components/ui/saas-empty-state"
import Toast, { type ToastPayload } from "@/app/components/Toast"
import Input from "@/components/ui/input"
import { useMarketingGenerationStages } from "@/app/hooks/useMarketingGenerationStages"
import { successToast } from "@/lib/copy/success-toasts"
import { DEFAULT_CAMPAIGN_TARGET_AUDIENCE } from "@/lib/marketing/campaign-content-types"
import { STORY_STRUCTURE_GENERATION_STAGES } from "@/lib/marketing/generation-stages"
import type { StoryStructureSceneOutput } from "@/lib/marketing/story-structure"
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

export default function StoryStructurePage() {
  const [campaignName, setCampaignName] = useState("")
  const [topic, setTopic] = useState("")
  const [targetAudience, setTargetAudience] = useState<string>(
    DEFAULT_CAMPAIGN_TARGET_AUDIENCE,
  )
  const [platform, setPlatform] = useState("instagram")
  const [goal, setGoal] = useState("Drive sign-ups and book more consults")
  const [hook, setHook] = useState("")
  const [cta, setCta] = useState("")
  const [scenes, setScenes] = useState<StoryStructureSceneOutput[]>([])
  const [generating, setGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastPayload | null>(null)

  const {
    activeStep: generationStep,
    start: startProgressAnimation,
    stop: stopProgressAnimation,
  } = useMarketingGenerationStages(STORY_STRUCTURE_GENERATION_STAGES.length)

  const loadBrand = useCallback(async () => {
    try {
      const res = await fetch("/api/marketing/brand", { credentials: "include" })
      const data = (await res.json()) as {
        profile?: {
          name?: string
          target_audience?: string
          goals?: string
          platform_focus?: string
        }
      }

      if (!res.ok || !data.profile) return

      if (data.profile.name?.trim()) setCampaignName(data.profile.name.trim())
      if (data.profile.target_audience?.trim()) {
        setTargetAudience(data.profile.target_audience.trim())
      }
      if (data.profile.goals?.trim()) setGoal(data.profile.goals.trim())

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
    goal.trim().length > 0

  async function generateStructure() {
    if (!formValid || generating) return

    setGenerating(true)
    setErrorMessage(null)
    setToast(null)
    setScenes([])
    setHook("")
    setCta("")
    startProgressAnimation()

    try {
      const res = await fetch("/api/marketing/story-structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          campaign_name: campaignName.trim(),
          target_audience: targetAudience,
          platform,
          goal,
          topic: topic.trim() || campaignName.trim(),
        }),
      })

      const data = (await res.json()) as {
        scenes?: StoryStructureSceneOutput[]
        hook?: string
        cta?: string
        warning?: string
        error?: { message?: string }
      }

      if (!res.ok || data.error || !data.scenes?.length) {
        setErrorMessage(data.error?.message ?? "Could not generate story structure.")
        return
      }

      setScenes(data.scenes)
      setHook(data.hook ?? "")
      setCta(data.cta ?? "")
      setToast(
        successToast("storyStructureGenerated", {
          description:
            data.warning ??
            "7-scene narrative arc is ready — use it in the Video Generator.",
        }),
      )
    } catch {
      setErrorMessage("Could not generate story structure.")
    } finally {
      stopProgressAnimation()
      setGenerating(false)
    }
  }

  return (
    <ProtectedShell allowed={["admin", "coach"]}>
      <div className={`p-4 sm:p-6 lg:p-8 ${fitcoreSurfaceClass}`}>
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Marketing AI
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Story Structure Engine
          </h1>
          <p className="mt-2 max-w-2xl text-gray-500">
            Build a 7-scene narrative arc — Hook, Problem, Why it happens,
            Solution, Features, Results, CTA — where every scene flows into the
            next.
          </p>
        </header>

        <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <section className="h-fit space-y-5">
            <div className={`${fitcoreCardClass} p-5 sm:p-6`}>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">Story brief</h2>
                  <p className={`text-sm ${fitcoreMutedClass}`}>
                    AI writes each scene to connect narratively.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={fitcoreLabelClass} htmlFor="story-campaign-name">
                    Campaign / brand name
                  </label>
                  <Input
                    id="story-campaign-name"
                    value={campaignName}
                    onChange={(event) => setCampaignName(event.target.value)}
                    placeholder="FitCore Coach"
                    disabled={generating}
                  />
                </div>

                <div>
                  <label className={fitcoreLabelClass} htmlFor="story-topic">
                    Topic (optional)
                  </label>
                  <Input
                    id="story-topic"
                    value={topic}
                    onChange={(event) => setTopic(event.target.value)}
                    placeholder="Why coaches lose clients after month one"
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
                  <label className={fitcoreLabelClass} htmlFor="story-goal">
                    Goal
                  </label>
                  <Input
                    id="story-goal"
                    value={goal}
                    onChange={(event) => setGoal(event.target.value)}
                    disabled={generating}
                  />
                </div>

                <button
                  type="button"
                  disabled={!formValid || generating}
                  onClick={() => void generateStructure()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Building story arc…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate 7-Scene Structure
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
              Ready to render?{" "}
              <Link
                href="/marketing/video-generator"
                className="font-medium text-indigo-700 hover:underline"
              >
                Open Video Generator
              </Link>{" "}
              with Story Structure Engine enabled.
            </p>
          </section>

          <section className="min-w-0 space-y-5">
            {generating ? (
              <MarketingGenerationStagePanel
                stages={STORY_STRUCTURE_GENERATION_STAGES}
                activeStep={generationStep}
                title="Building your story arc"
                subtitle="Writing 7 connected scenes from hook to CTA."
              />
            ) : null}

            {scenes.length > 0 ? (
              <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">
                <StoryStructurePanel
                  scenes={scenes}
                  hook={hook}
                  cta={cta}
                />
              </div>
            ) : (
              <StoryStructurePanel showReference />
            )}

            {!scenes.length && !generating ? (
              <SaasEmptyState
                preset="marketingStory"
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
