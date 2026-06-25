"use client"

import { type FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import ProtectedShell from "@/app/components/ProtectedShell"
import Toast, { type ToastPayload } from "@/app/components/Toast"
import { successToast } from "@/lib/copy/success-toasts"
import SaasEmptyState from "@/components/ui/saas-empty-state"
import VideoGeneratorProgressPanel from "@/components/marketing/VideoGeneratorProgressPanel"
import { useMarketingGenerationStages } from "@/app/hooks/useMarketingGenerationStages"
import { useVideoSceneProgress } from "@/app/hooks/useVideoSceneProgress"
import {
  VIDEO_RENDER_SUB_STAGES,
  VIDEO_SCRIPT_GENERATION_STAGES,
  VIDEO_VISUALS_STAGES,
} from "@/lib/marketing/generation-stages"
import GeneratedVideoFlowBanner from "@/components/marketing/GeneratedVideoFlowBanner"
import StoryStructurePanel from "@/components/marketing/StoryStructurePanel"
import VideoScriptPreview from "@/components/marketing/VideoScriptPreview"
import type { GeneratedVideoFlowState } from "@/lib/marketing/generated-video-record"
import { addVideoToCalendar } from "@/lib/marketing/add-video-to-calendar-client"
import { scheduleMarketingVideo } from "@/lib/marketing/schedule-marketing-video-client"
import type { MarketingVideo, VideoScript } from "@/lib/marketing/video-script-types"
import {
  buildVideoCalendarWorkflowUrl,
} from "@/lib/marketing/schedule-marketing-video"
import {
  FITCORE_COACH_MASCOT,
  getMascotDescription,
  getMascotStyle,
} from "@/lib/marketing/brand-mascot"
import {
  premiumInputClass,
  premiumSelectClass,
  premiumTextareaClass,
} from "@/lib/ui/premium-input"
import {
  buildFitcorePlatformShowcasePrompt,
  FITCORE_PLATFORM_SHOWCASE_CAMPAIGN,
  PLATFORM_SHOWCASE_BEATS,
} from "@/lib/video/platform-showcase"
import {
  GENERATOR_VIDEO_STYLES,
  GENERATOR_VIDEO_STYLE_LABELS,
  VIDEO_STYLE_DESCRIPTIONS,
  type GeneratorVideoStyle,
} from "@/lib/marketing/video-styles"
import { MOBILE_PAGE_ROOT, MOBILE_SAFE_BOTTOM } from "@/lib/ui/mobile-layout"
import {
  isStoryStructureCompatibleStyle,
  isStoryStructureScript,
  STORY_STRUCTURE_SCENES,
} from "@/lib/marketing/story-structure"

const LAUNCH_CAMPAIGN_STYLES = new Set<GeneratorVideoStyle>([
  "app_showcase",
  "saas_demo",
])

type StylePreference = GeneratorVideoStyle | "auto"

type GenerateVideoResponse = {
  success?: boolean
  generatedVideoId?: string
  generatedVideo?: { id: string; status?: string; video_url?: string | null }
  videoProject?: MarketingVideo
  contentPost?: { id: string; status?: string } | null
  calendarUrl?: string | null
  script?: VideoScript
  videoUrl?: string
  mascotImageUrl?: string | null
  thumbnailUrl?: string | null
  workflow_type?: string | null
  workflow_summary?: string | null
  workflowIntelligence?: {
    workflow_type?: string
    workflow_summary?: string
  }
  error?: string
}

const PIPELINE_STEPS = [
  { id: "mascot", label: "Mascot" },
  { id: "scenes", label: "Script & image prompts" },
  { id: "images", label: "AI images" },
  { id: "video", label: "Remotion video" },
] as const

function PipelineProgress({
  hasScript,
  hasImages,
  hasVideo,
}: {
  hasScript: boolean
  hasImages: boolean
  hasVideo: boolean
}) {
  const stepDone = [true, hasScript, hasImages, hasVideo]

  return (
    <div className="rounded-xl border bg-gray-50 p-4">
      <p className="mb-3 text-sm font-medium text-gray-700">Pipeline</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-0">
        {PIPELINE_STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center gap-2 sm:flex-1">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                stepDone[index]
                  ? "bg-black text-white"
                  : "border border-gray-300 bg-white text-gray-400"
              }`}
            >
              {index + 1}
            </div>
            <span
              className={`text-sm ${
                stepDone[index] ? "font-medium text-gray-900" : "text-gray-500"
              }`}
            >
              {step.label}
            </span>
            {index < PIPELINE_STEPS.length - 1 ? (
              <span className="hidden px-2 text-gray-300 sm:inline">↓</span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function VideoGeneratorPage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState<string>(buildFitcorePlatformShowcasePrompt())
  const [brandName, setBrandName] = useState<string>(
    FITCORE_PLATFORM_SHOWCASE_CAMPAIGN.brandName,
  )
  const [mascotName, setMascotName] = useState(FITCORE_COACH_MASCOT.name)
  const [mascotDescription, setMascotDescription] = useState(getMascotDescription())
  const [mascotStyle, setMascotStyle] = useState(getMascotStyle())
  const [mascotVoiceTone, setMascotVoiceTone] = useState(
    FITCORE_COACH_MASCOT.voiceTone.join(", "),
  )
  const [stylePreference, setStylePreference] = useState<StylePreference>("auto")
  const [useStoryStructure, setUseStoryStructure] = useState(true)
  const [targetAudience, setTargetAudience] = useState<string>(
    FITCORE_PLATFORM_SHOWCASE_CAMPAIGN.targetAudience,
  )
  const [goal, setGoal] = useState<string>(FITCORE_PLATFORM_SHOWCASE_CAMPAIGN.goal)
  const [loading, setLoading] = useState(false)
  const [generatingImages, setGeneratingImages] = useState(false)
  const [generatingVoiceover, setGeneratingVoiceover] = useState(false)
  const [renderingVideo, setRenderingVideo] = useState(false)
  const [renderingFinalVideo, setRenderingFinalVideo] = useState(false)
  const [generatedVideoId, setGeneratedVideoId] = useState<string | null>(null)
  const [flowState, setFlowState] = useState<GeneratedVideoFlowState>("idle")
  const [addingToCalendar, setAddingToCalendar] = useState(false)
  const [schedulingVideo, setSchedulingVideo] = useState(false)
  const [scheduleAt, setScheduleAt] = useState("")
  const [calendarToast, setCalendarToast] = useState<ToastPayload | null>(null)
  const [imagesToast, setImagesToast] = useState<ToastPayload | null>(null)
  const [voiceoverToast, setVoiceoverToast] = useState<ToastPayload | null>(null)
  const [result, setResult] = useState<GenerateVideoResponse | null>(null)
  const [error, setError] = useState("")

  const storyStructureActive =
    useStoryStructure &&
    isStoryStructureCompatibleStyle(
      stylePreference === "auto" ? undefined : stylePreference,
    )

  const {
    activeStep: generationStep,
    start: startScriptProgress,
    stop: stopScriptProgress,
  } = useMarketingGenerationStages(VIDEO_SCRIPT_GENERATION_STAGES.length)

  const sceneCount = result?.script?.scenes.length ?? 0

  const {
    activeSceneIndex,
    start: startSceneProgress,
    stop: stopSceneProgress,
  } = useVideoSceneProgress(sceneCount)

  const {
    activeStep: visualsStep,
    start: startVisualsProgress,
    stop: stopVisualsProgress,
  } = useMarketingGenerationStages(VIDEO_VISUALS_STAGES.length)

  const {
    activeStep: renderStep,
    start: startRenderProgress,
    stop: stopRenderProgress,
  } = useMarketingGenerationStages(VIDEO_RENDER_SUB_STAGES.length, 1600)

  const isPipelineBusy =
    loading || generatingImages || renderingVideo || renderingFinalVideo

  const progressPhase = loading
    ? ("script" as const)
    : generatingImages
      ? ("visuals" as const)
      : renderingVideo || renderingFinalVideo
        ? ("render" as const)
        : null

  const progressStages =
    progressPhase === "script"
      ? VIDEO_SCRIPT_GENERATION_STAGES
      : progressPhase === "visuals"
        ? VIDEO_VISUALS_STAGES
        : VIDEO_RENDER_SUB_STAGES

  const progressActiveStep =
    progressPhase === "script"
      ? generationStep
      : progressPhase === "visuals"
        ? visualsStep
        : renderStep

  const pipelineActiveStep =
    progressPhase === "script"
      ? 0
      : progressPhase === "visuals"
        ? 2
        : progressPhase === "render"
          ? 3
          : 0

  useEffect(() => {
    void fetch("/api/marketing/brand", { credentials: "include" })
      .then((res) => res.json())
      .then((data: {
        profile?: {
          name?: string
          target_audience?: string
          goals?: string
          mascot_name?: string
          mascot_description?: string
          mascot_style?: string
          mascot_voice_tone?: string
        }
      }) => {
        const profile = data.profile
        if (!profile) return

        if (profile.name?.trim()) {
          setBrandName(profile.name.trim())
        }
        if (profile.target_audience?.trim()) {
          setTargetAudience(profile.target_audience.trim())
        }
        if (profile.goals?.trim()) {
          setGoal(profile.goals.trim())
        }
        if (profile.mascot_name?.trim()) {
          setMascotName(profile.mascot_name.trim())
        }
        if (profile.mascot_description?.trim()) {
          setMascotDescription(profile.mascot_description.trim())
        }
        if (profile.mascot_style?.trim()) {
          setMascotStyle(profile.mascot_style.trim())
        }
        if (profile.mascot_voice_tone?.trim()) {
          setMascotVoiceTone(profile.mascot_voice_tone.trim())
        }
      })
      .catch(() => {
        // Keep FitCore defaults when brand profile is unavailable.
      })
  }, [])

  async function refreshVideoProject(videoProjectId: string) {
    const refreshRes = await fetch(`/api/video/${videoProjectId}`, {
      credentials: "include",
    })
    const refreshData = (await refreshRes.json()) as GenerateVideoResponse

    if (!refreshRes.ok) {
      return false
    }

    setResult((prev) => ({
      ...prev,
      videoProject: refreshData.videoProject ?? prev?.videoProject,
      script: refreshData.script ?? prev?.script,
      mascotImageUrl: refreshData.mascotImageUrl ?? prev?.mascotImageUrl,
      thumbnailUrl: refreshData.thumbnailUrl ?? prev?.thumbnailUrl,
      workflow_type:
        refreshData.workflow_type ??
        refreshData.script?.workflow_type ??
        prev?.workflow_type,
      workflow_summary:
        refreshData.workflow_summary ??
        refreshData.script?.workflow_summary ??
        prev?.workflow_summary,
    }))

    return true
  }

  function scrollToVideoGeneratorForm() {
    document
      .getElementById("video-generator-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  function handleGenerateFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void generateVideoScript()
  }

  async function generateVideoScript() {
    console.log("Generate clicked")

    if (loading || !prompt.trim() || !brandName.trim()) {
      return
    }

    setLoading(true)
    setError("")
    setResult(null)
    setFlowState("creating")
    setGeneratedVideoId(null)
    startScriptProgress()

    try {
      console.log("Sending request")

      const res = await fetch("/api/video/generate", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          brandName,
          platform: "instagram",
          targetAudience: targetAudience || undefined,
          goal: goal || undefined,
          ...(stylePreference !== "auto" ? { style: stylePreference } : {}),
          ...(storyStructureActive ? { storyStructure: true } : {}),
          mascotName,
          mascotDescription,
          mascotStyle,
          mascotVoiceTone,
        }),
      })

      const data = (await res.json()) as GenerateVideoResponse

      console.log("Response received", { ok: res.ok, status: res.status, data })

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong")
      }

      if (!data.generatedVideoId) {
        throw new Error("Generate did not return a generated_videos id")
      }

      setGeneratedVideoId(data.generatedVideoId)
      setFlowState("created")

      setResult({
        ...data,
        videoProject: data.videoProject
          ? {
              ...data.videoProject,
              content_post_id:
                data.contentPost?.id ??
                data.videoProject.content_post_id ??
                null,
            }
          : data.videoProject,
        script: data.script
          ? {
              ...data.script,
              workflow_type:
                data.script.workflow_type ??
                data.workflow_type ??
                data.workflowIntelligence?.workflow_type,
              workflow_summary:
                data.script.workflow_summary ??
                data.workflow_summary ??
                data.workflowIntelligence?.workflow_summary,
            }
          : data.script,
      })
    } catch (err) {
      console.log("Error", err)
      setFlowState("failed")
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      stopScriptProgress()
      setLoading(false)
    }
  }

  async function generateSceneImages() {
    if (!result?.videoProject?.id) return

    setGeneratingImages(true)
    setError("")
    setImagesToast(null)
    startSceneProgress()
    startVisualsProgress()

    try {
      const res = await fetch("/api/video/generate-images", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoProjectId: result.videoProject.id,
        }),
      })

      const data = (await res.json()) as {
        error?: string
        generated?: number
      }

      if (!res.ok) {
        throw new Error(data.error ?? "Image generation failed")
      }

      const generatedCount = data.generated ?? 0

      if (result.videoProject?.id) {
        await refreshVideoProject(result.videoProject.id)
      }

      setImagesToast(
        successToast("videoImagesGenerated", {
          description:
            generatedCount > 0
              ? `Generated ${generatedCount} scene image${generatedCount === 1 ? "" : "s"}.`
              : "Scene images are up to date.",
        }),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image generation failed")
    } finally {
      stopSceneProgress()
      stopVisualsProgress()
      setGeneratingImages(false)
    }
  }

  async function generateVoiceover() {
    if (!result?.videoProject?.id) return

    setGeneratingVoiceover(true)
    setError("")
    setVoiceoverToast(null)

    try {
      const res = await fetch("/api/video/generate-voiceover", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoProjectId: result.videoProject.id,
        }),
      })

      const data = (await res.json()) as {
        error?: string
        voiceoverUrl?: string
        voiceoverScript?: string
      }

      if (!res.ok) {
        throw new Error(data.error ?? "Voiceover generation failed")
      }

      await refreshVideoProject(result.videoProject.id)

      setVoiceoverToast(successToast("videoVoiceoverGenerated"))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Voiceover generation failed")
    } finally {
      setGeneratingVoiceover(false)
    }
  }

  async function handleScheduleVideo() {
    if (!result?.videoProject?.id) return

    if (!scheduleAt.trim()) {
      setError("Choose a date and time before scheduling.")
      return
    }

    setSchedulingVideo(true)
    setError("")
    setCalendarToast(null)

    try {
      const data = await scheduleMarketingVideo(
        result.videoProject.id,
        new Date(scheduleAt).toISOString(),
      )

      setResult((prev) =>
        prev?.videoProject
          ? {
              ...prev,
              videoProject: {
                ...prev.videoProject,
                status:
                  (data.video?.status as MarketingVideo["status"] | undefined) ??
                  prev.videoProject.status,
                content_post_id:
                  data.content_post?.id ??
                  data.video?.content_post_id ??
                  prev.videoProject.content_post_id,
              },
            }
          : prev,
      )

      const contentPostId =
        data.content_post?.id ?? data.video?.content_post_id ?? null
      const calendarUrl =
        data.calendar_url ??
        (contentPostId
          ? buildVideoCalendarWorkflowUrl(contentPostId, { added: true })
          : null)

      setCalendarToast(
        successToast("videoScheduled", {
          description:
            data.message ?? "It will publish automatically when due.",
        }),
      )

      if (calendarUrl) {
        window.setTimeout(() => {
          router.push(`${calendarUrl}&status=scheduled`)
        }, 900)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not schedule video.")
    } finally {
      setSchedulingVideo(false)
    }
  }

  async function handleAddVideoToCalendar() {
    if (!result?.videoProject?.id) return

    if (result.videoProject.content_post_id) {
      router.push(
        buildVideoCalendarWorkflowUrl(result.videoProject.content_post_id),
      )
      return
    }

    setAddingToCalendar(true)
    setError("")
    setCalendarToast(null)

    try {
      const data = await addVideoToCalendar(result.videoProject.id)

      setResult((prev) =>
        prev?.videoProject
          ? {
              ...prev,
              videoProject: {
                ...prev.videoProject,
                content_post_id:
                  data.video?.content_post_id ??
                  data.content_post?.id ??
                  prev.videoProject.content_post_id,
              },
            }
          : prev,
      )

      const contentPostId =
        data.content_post?.id ?? data.video?.content_post_id ?? null
      const calendarUrl =
        data.calendar_url ??
        (contentPostId
          ? buildVideoCalendarWorkflowUrl(contentPostId, {
              added: !data.already_exists,
            })
          : null)

      setCalendarToast(
        successToast("videoAddedToCalendar", {
          description:
            data.message ??
            (data.already_exists
              ? "This video is already on your calendar."
              : "Review the draft in Scheduled before publishing."),
        }),
      )

      if (calendarUrl) {
        window.setTimeout(() => {
          router.push(calendarUrl)
        }, 900)
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not add video to calendar.",
      )
    } finally {
      setAddingToCalendar(false)
    }
  }

  async function renderVideo() {
    if (!result?.videoProject?.id) return

    setRenderingVideo(true)
    setFlowState("rendering")
    setError("")
    startRenderProgress()
    setResult((prev) =>
      prev?.videoProject
        ? {
            ...prev,
            videoProject: {
              ...prev.videoProject,
              status: "processing",
              render_status: "processing",
              render_error: null,
            },
          }
        : prev,
    )

    try {
      const videoProjectId = result.videoProject.id
      console.log("[VIDEO_RENDER client] selected video_project_id:", videoProjectId)
      console.log("[VIDEO_RENDER client] generated_video_id:", generatedVideoId ?? "none")
      console.log("[VIDEO_RENDER client] script hook:", result.script?.hook)
      console.log(
        "[VIDEO_RENDER client] script scenes:",
        result.script?.scenes?.map((scene) => scene.text),
      )

      const res = await fetch("/api/video/render", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video_project_id: videoProjectId,
          ...(generatedVideoId ? { generatedVideoId } : {}),
          _debug: {
            brandName: result.videoProject.brand_name,
            hook: result.script?.hook,
            sceneTexts: result.script?.scenes?.map((scene) => scene.text),
          },
        }),
      })

      const data = (await res.json()) as {
        error?: string
        videoUrl?: string
        generatedVideoId?: string
        debug?: {
          videoProjectId?: string
          renderProps?: {
            title?: string
            videoProjectId?: string
            scenes?: { text: string; duration: number }[]
          }
        }
      }

      if (!res.ok) {
        throw new Error(data.error || "Render failed")
      }

      if (data.debug?.renderProps) {
        console.log("[VIDEO_RENDER client] server render props:", data.debug.renderProps)
      }

      if (data.generatedVideoId) {
        setGeneratedVideoId(data.generatedVideoId)
      }

      await refreshVideoProject(result.videoProject.id)

      const renderedUrl = data.videoUrl
      if (renderedUrl) {
        setFlowState("completed")
        setResult((prev) =>
          prev
            ? {
                ...prev,
                videoUrl: renderedUrl,
                videoProject: prev.videoProject
                  ? {
                      ...prev.videoProject,
                      status: "completed",
                      render_status: "completed",
                      video_url: renderedUrl,
                      render_error: null,
                    }
                  : prev.videoProject,
              }
            : prev,
        )
      }
    } catch (err) {
      setFlowState("failed")
      setError(err instanceof Error ? err.message : "Render failed")
      if (result.videoProject?.id) {
        await refreshVideoProject(result.videoProject.id)
      }
    } finally {
      stopRenderProgress()
      setRenderingVideo(false)
    }
  }

  async function renderFinalVideo() {
    if (!result?.videoProject?.id) return

    const hasScenes = Boolean(result?.script?.scenes?.length)
    const hasAnimatedPreview = Boolean(result?.script)

    if (!hasScenes || !hasAnimatedPreview) {
      return
    }

    setRenderingFinalVideo(true)
    setFlowState("rendering")
    setError("")
    startRenderProgress()
    setResult((prev) =>
      prev?.videoProject
        ? {
            ...prev,
            videoProject: {
              ...prev.videoProject,
              final_render_status: "processing",
              final_render_error: null,
              status: "processing",
            } as MarketingVideo,
          }
        : prev,
    )

    try {
      const res = await fetch("/api/video/render-final", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video_project_id: result.videoProject.id,
          ...(generatedVideoId ? { generatedVideoId } : {}),
        }),
      })

      const data = (await res.json()) as {
        success?: boolean
        videoUrl?: string
        error?: string
        generatedVideoId?: string
      }

      if (!res.ok) {
        throw new Error(data.error ?? "Final render failed")
      }

      if (data.generatedVideoId) {
        setGeneratedVideoId(data.generatedVideoId)
      }

      await refreshVideoProject(result.videoProject.id)

      const finalUrl = data.videoUrl
      if (finalUrl) {
        setFlowState("completed")
        setResult((prev) =>
          prev
            ? {
                ...prev,
                videoUrl: finalUrl,
                videoProject: prev.videoProject
                  ? {
                      ...prev.videoProject,
                      final_render_status: "ready",
                      final_render_url: finalUrl,
                      video_url: finalUrl,
                      status: "completed",
                      final_render_error: null,
                    }
                  : prev.videoProject,
              }
            : prev,
        )
      }
    } catch (err) {
      setFlowState("failed")
      setError(err instanceof Error ? err.message : "Final render failed")
      if (result.videoProject?.id) {
        await refreshVideoProject(result.videoProject.id)
      }
    } finally {
      stopRenderProgress()
      setRenderingFinalVideo(false)
    }
  }

  return (
    <ProtectedShell allowed={["admin", "coach"]}>
      <div className={`mx-auto max-w-5xl space-y-6 overflow-x-hidden p-4 pb-32 sm:p-6 sm:pb-6 ${MOBILE_PAGE_ROOT}`}>
        <div data-tour="video-generator">
          <h1 className="text-3xl font-bold">AI Video Generator</h1>
          <p className="text-gray-500">
            Describe your goal — AI picks the best format, then builds hook,
            scenes with Visual Engine image prompts, visuals, CTA, caption, and hashtags.
          </p>
        </div>

        <GeneratedVideoFlowBanner
          flowState={flowState}
          generatedVideoId={generatedVideoId}
          error={error}
        />

        <PipelineProgress
          hasScript={Boolean(result?.script)}
          hasImages={Boolean(result?.script?.scenes.some((scene) => scene.imageUrl))}
          hasVideo={Boolean(
            result?.videoUrl &&
              (result.videoProject?.render_status === "completed" ||
                result.videoProject?.render_status === "ready"),
          )}
        />

        <form
          id="video-generator-form"
          className="space-y-4 rounded-xl border p-5"
          onSubmit={handleGenerateFormSubmit}
          noValidate
        >
          <input
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Brand name"
            className={premiumInputClass}
          />

          <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Video style
            </label>
            <select
              value={stylePreference}
              onChange={(e) =>
                setStylePreference(e.target.value as StylePreference)
              }
              className={premiumSelectClass}
            >
              <option value="auto">Auto — pick best style from goal</option>
              {GENERATOR_VIDEO_STYLES.map((option) => (
                <option key={option} value={option}>
                  {GENERATOR_VIDEO_STYLE_LABELS[option]}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-500">
              {stylePreference === "auto"
                ? "AI chooses from viral caption, problem/solution, premium ad, SaaS demo, app showcase, or mascot story."
                : VIDEO_STYLE_DESCRIPTIONS[stylePreference]}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {GENERATOR_VIDEO_STYLES.map((option) => (
                <span
                  key={option}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                    stylePreference === option ||
                    (stylePreference === "auto" &&
                      result?.script?.style === option)
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-white text-gray-600"
                  }`}
                >
                  {GENERATOR_VIDEO_STYLE_LABELS[option]}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={storyStructureActive}
                disabled={
                  !isStoryStructureCompatibleStyle(
                    stylePreference === "auto" ? undefined : stylePreference,
                  )
                }
                onChange={(event) => setUseStoryStructure(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>
                <span className="block text-sm font-medium text-gray-900">
                  Story Structure Engine
                </span>
                <span className="mt-1 block text-xs text-gray-600">
                  7-scene narrative:{" "}
                  {STORY_STRUCTURE_SCENES.map((scene) => scene.label).join(" → ")}
                </span>
                {!isStoryStructureCompatibleStyle(
                  stylePreference === "auto" ? undefined : stylePreference,
                ) ? (
                  <span className="mt-1 block text-xs text-amber-700">
                    Disabled for app showcase and SaaS demo — those styles use
                    their own fixed scene paths.
                  </span>
                ) : null}
              </span>
            </label>
          </div>

          {(stylePreference === "app_showcase" ||
            stylePreference === "saas_demo" ||
            (stylePreference === "auto" &&
              result?.script?.style &&
              LAUNCH_CAMPAIGN_STYLES.has(
                result.script.style as GeneratorVideoStyle,
              ))) ? (
            <div className="grid gap-4 rounded-2xl border border-cyan-200 bg-cyan-50/60 p-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Target audience
                </label>
                <input
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder={FITCORE_PLATFORM_SHOWCASE_CAMPAIGN.targetAudience}
                  className={premiumInputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Goal
                </label>
                <input
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder={FITCORE_PLATFORM_SHOWCASE_CAMPAIGN.goal}
                  className={premiumInputClass}
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <p className="text-xs font-medium text-cyan-950">
                  {FITCORE_PLATFORM_SHOWCASE_CAMPAIGN.label} — fixed 30-second path
                </p>
                <p className="text-xs text-cyan-900">
                  {PLATFORM_SHOWCASE_BEATS.map((beat) => beat.module).join(" → ")}{" "}
                  → CTA
                </p>
                <ul className="grid gap-1 text-xs text-cyan-900 sm:grid-cols-2">
                  {PLATFORM_SHOWCASE_BEATS.map((beat, index) => (
                    <li key={beat.id}>
                      {index + 1}. {beat.text}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-cyan-800">
                  Full-platform SaaS tour with dynamic module transitions — Marketing
                  AI is one section, not the whole story.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Target audience
                </label>
                <input
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Optional — defaults from brand profile"
                  className={premiumInputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Goal
                </label>
                <input
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Optional — defaults from brand profile"
                  className={premiumInputClass}
                />
              </div>
            </div>
          )}

          <details className="rounded-2xl border border-gray-200 bg-white p-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-700">
              Mascot settings (App Showcase & Mascot Story)
            </summary>
            <div className="mt-4 grid gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Mascot Name
              </label>
              <input
                value={mascotName}
                onChange={(e) => setMascotName(e.target.value)}
                placeholder="FitCore AI"
                className={premiumInputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Mascot Description
              </label>
              <textarea
                value={mascotDescription}
                onChange={(e) => setMascotDescription(e.target.value)}
                placeholder="Athletic male coach in black premium sportswear..."
                className={`${premiumTextareaClass} min-h-[96px]`}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Mascot Style
              </label>
              <input
                value={mascotStyle}
                onChange={(e) => setMascotStyle(e.target.value)}
                placeholder="Clean modern look. Colors: Black, White, Electric Blue"
                className={premiumInputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Mascot Voice Tone
              </label>
              <input
                value={mascotVoiceTone}
                onChange={(e) => setMascotVoiceTone(e.target.value)}
                placeholder="Confident, Motivational, Professional"
                className={premiumInputClass}
              />
            </div>
            </div>
          </details>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              stylePreference === "app_showcase"
                ? "Example: 30-second tour — problem, platform overview, members, workouts, nutrition, progress, marketing AI, analytics, CTA."
                : "Example: Show fitness coaches how FitCore AI replaces CRM, programming, nutrition, scheduling, and marketing tools in one platform."
            }
            className={`${premiumTextareaClass} min-h-[140px]`}
          />

          <button
            type="submit"
            disabled={loading || !prompt.trim() || !brandName.trim()}
            aria-busy={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-white transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Generating video…
              </>
            ) : (
              "Generate Video"
            )}
          </button>

          {error ? (
            <div className="rounded-lg bg-red-50 p-3 text-red-600">{error}</div>
          ) : null}
        </form>

        {result?.script ? (
          <>
            {isPipelineBusy && progressPhase ? (
              <VideoGeneratorProgressPanel
                phase={progressPhase}
                stages={progressStages}
                activeStep={progressActiveStep}
                pipelineActiveStep={pipelineActiveStep}
                scenes={result.script.scenes}
                activeSceneIndex={activeSceneIndex}
              />
            ) : null}

            <div
              className={
                isPipelineBusy && progressPhase && progressPhase !== "script"
                  ? "pointer-events-none opacity-40 transition-opacity duration-300"
                  : undefined
              }
            >
            <div className="rounded-xl border bg-white p-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Schedule publish time
              </label>
              <input
                type="datetime-local"
                value={scheduleAt}
                onChange={(e) => setScheduleAt(e.target.value)}
                className={`${premiumInputClass} w-full max-w-full sm:max-w-sm`}
              />
              <p className="mt-2 text-xs text-gray-500">
                Drafts are created automatically. Use Save as Draft to review, or
                Add to Schedule when you are ready to publish.
              </p>
            </div>

            {result.script &&
            (storyStructureActive ||
              isStoryStructureScript(result.script.scenes)) ? (
              <div className="mb-4 rounded-xl border border-indigo-100 bg-white p-4">
                <StoryStructurePanel
                  scenes={result.script.scenes.map((scene, index) => ({
                    order: index + 1,
                    story_beat:
                      scene.story_beat ??
                      STORY_STRUCTURE_SCENES[index]?.label ??
                      `Scene ${index + 1}`,
                    role:
                      STORY_STRUCTURE_SCENES[index]?.id ?? "hook",
                    text: scene.text,
                    narrative_purpose:
                      scene.professional_purpose ??
                      STORY_STRUCTURE_SCENES[index]?.purpose ??
                      "",
                  }))}
                  hook={result.script.hook}
                  cta={result.script.cta}
                  compact
                  showReference={false}
                />
              </div>
            ) : null}

            <VideoScriptPreview
              script={result.script}
              videoProject={result.videoProject}
              mascotImageUrl={result.mascotImageUrl}
              thumbnailUrl={result.thumbnailUrl}
              videoUrl={result.videoUrl ?? result.videoProject?.video_url ?? null}
              workflowType={
                result.workflow_type ??
                result.script.workflow_type ??
                result.workflowIntelligence?.workflow_type
              }
              workflowSummary={
                result.workflow_summary ??
                result.script.workflow_summary ??
                result.workflowIntelligence?.workflow_summary
              }
              loading={loading}
              renderingVideo={renderingVideo}
              generatingImages={generatingImages}
              generatingVoiceover={generatingVoiceover}
              addingToCalendar={addingToCalendar}
              renderingFinalVideo={renderingFinalVideo}
              onGenerateImages={() => void generateSceneImages()}
              onGenerateVoiceover={() => void generateVoiceover()}
              onRenderVideo={() => void renderVideo()}
              onRenderFinalVideo={() => void renderFinalVideo()}
              onAddToCalendar={() => void handleAddVideoToCalendar()}
              onSchedule={() => void handleScheduleVideo()}
              scheduling={schedulingVideo}
            />
            </div>
          </>
        ) : loading && progressPhase ? (
          <VideoGeneratorProgressPanel
            phase={progressPhase}
            stages={progressStages}
            activeStep={progressActiveStep}
            pipelineActiveStep={pipelineActiveStep}
          />
        ) : (
          <SaasEmptyState
            preset="videoGenerator"
            variant="light"
            action={
              <button
                type="button"
                onClick={scrollToVideoGeneratorForm}
                className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Start generating
              </button>
            }
          />
        )}
      </div>

      {result?.script ? (
        <div
          className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 p-4 sm:hidden ${MOBILE_SAFE_BOTTOM}`}
        >
          <div className="pointer-events-auto mx-auto flex max-w-5xl flex-col gap-2 rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] backdrop-blur-md">
            <input
              type="datetime-local"
              value={scheduleAt}
              onChange={(e) => setScheduleAt(e.target.value)}
              className={`${premiumInputClass} w-full`}
              aria-label="Schedule publish time"
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => void handleAddVideoToCalendar()}
                disabled={addingToCalendar || loading}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-800"
              >
                {addingToCalendar ? "Saving…" : "Save draft"}
              </button>
              <button
                type="button"
                onClick={() => void handleScheduleVideo()}
                disabled={schedulingVideo || loading || !scheduleAt.trim()}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-black px-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {schedulingVideo ? "Scheduling…" : "Schedule"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {calendarToast ? (
        <Toast
          title={calendarToast.title}
          description={calendarToast.description}
          variant={calendarToast.variant ?? "success"}
          onDismiss={() => setCalendarToast(null)}
          durationMs={3000}
        />
      ) : null}

      {imagesToast ? (
        <Toast
          title={imagesToast.title}
          description={imagesToast.description}
          variant={imagesToast.variant ?? "success"}
          onDismiss={() => setImagesToast(null)}
          durationMs={3000}
        />
      ) : null}

      {voiceoverToast ? (
        <Toast
          title={voiceoverToast.title}
          description={voiceoverToast.description}
          variant={voiceoverToast.variant ?? "success"}
          onDismiss={() => setVoiceoverToast(null)}
          durationMs={3000}
        />
      ) : null}
    </ProtectedShell>
  )
}
