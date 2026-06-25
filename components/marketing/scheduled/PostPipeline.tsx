import { Check } from "lucide-react"
import {
  getPipelineProgressPercent,
  getPipelineStage,
  getPipelineStageIndex,
  PIPELINE_STAGE_COLORS,
  PIPELINE_STAGE_DESCRIPTIONS,
  PIPELINE_STAGE_LABELS,
  PIPELINE_STAGES,
  type PipelineStage,
} from "@/lib/marketing/post-pipeline"
import type { MarketingPost } from "@/lib/marketing/get-mock-marketing-data"
import {
  VIDEO_BODY,
  VIDEO_SECTION_LABEL,
  VIDEO_SECTION_TITLE,
} from "@/components/marketing/scheduled/scheduled-video-styles"

function getNodeStyles(
  stage: PipelineStage,
  active: boolean,
  complete: boolean,
) {
  const colors = PIPELINE_STAGE_COLORS[stage]

  if (active) {
    return {
      node: `${colors.active} ring-4 ring-offset-2 ${colors.ring} scale-110`,
      label: "font-bold text-gray-900",
      description: "text-gray-600",
    }
  }

  if (complete) {
    return {
      node: colors.complete,
      label: `${colors.text} font-semibold`,
      description: "text-gray-500",
    }
  }

  return {
    node: colors.idle,
    label: "font-medium text-gray-400",
    description: "text-gray-400",
  }
}

function PipelineTrack({ currentStage }: { currentStage: PipelineStage }) {
  const progress = getPipelineProgressPercent(currentStage)
  const trackColor = PIPELINE_STAGE_COLORS[currentStage].track

  return (
    <div className="relative mt-8 mb-4 h-3 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${trackColor}`}
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Publishing progress: ${progress}%`}
      />
    </div>
  )
}

function PipelineNodes({
  currentStage,
  currentIndex,
}: {
  currentStage: PipelineStage
  currentIndex: number
}) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
      {PIPELINE_STAGES.map((stage, index) => {
        const active = stage === currentStage
        const complete = index < currentIndex
        const styles = getNodeStyles(stage, active, complete)

        return (
          <div
            key={stage}
            className={`relative flex flex-col items-center text-center ${
              active ? "z-10" : ""
            }`}
          >
            <span
              className={`flex h-14 w-14 items-center justify-center rounded-full border-[3px] text-base font-bold transition-all duration-300 sm:h-16 sm:w-16 sm:text-lg ${styles.node}`}
              aria-current={active ? "step" : undefined}
            >
              {complete ? (
                <Check className="h-6 w-6" strokeWidth={2.5} aria-hidden />
              ) : (
                <span aria-hidden>{index + 1}</span>
              )}
            </span>

            <span
              className={`mt-4 text-base font-semibold uppercase tracking-wide sm:text-lg ${styles.label}`}
            >
              {PIPELINE_STAGE_LABELS[stage]}
            </span>

            <span
              className={`mt-2 max-w-[11rem] text-sm leading-snug sm:text-base ${styles.description}`}
            >
              {PIPELINE_STAGE_DESCRIPTIONS[stage]}
            </span>

            {active ? (
              <span className="mt-3 inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-sm font-bold uppercase tracking-wide text-violet-800">
                Current
              </span>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export function PublishingWorkflowLegend() {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-[0_8px_40px_rgba(15,23,42,0.06)]">
      <div className="border-b border-gray-100 bg-gradient-to-r from-slate-50 via-white to-violet-50/40 px-8 py-7 sm:px-10 sm:py-8">
        <p className={`${VIDEO_SECTION_LABEL} text-violet-600`}>
          Publishing workflow
        </p>
        <h2 className={`mt-3 ${VIDEO_SECTION_TITLE}`}>
          Every post moves through four stages
        </h2>
        <p className={`mt-4 max-w-3xl ${VIDEO_BODY} text-gray-500`}>
          Draft content is reviewed and approved, scheduled for a publish time,
          then goes live on your channels.
        </p>
      </div>

      <div className="grid gap-4 px-8 py-8 sm:grid-cols-2 sm:px-10 lg:grid-cols-4">
        {PIPELINE_STAGES.map((stage, index) => (
          <div
            key={stage}
            className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-gray-50/80 p-5 sm:p-6"
          >
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 text-base font-bold sm:h-14 sm:w-14 sm:text-lg ${PIPELINE_STAGE_COLORS[stage].active}`}
            >
              {index + 1}
            </span>
            <div className="min-w-0 text-left">
              <p
                className={`text-lg font-bold sm:text-xl ${PIPELINE_STAGE_COLORS[stage].text}`}
              >
                {PIPELINE_STAGE_LABELS[stage]}
              </p>
              <p className="mt-1 text-base leading-relaxed text-gray-500 sm:text-lg">
                {PIPELINE_STAGE_DESCRIPTIONS[stage]}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PostPipeline({ post }: { post: MarketingPost }) {
  const currentStage = getPipelineStage(post)
  const currentIndex = getPipelineStageIndex(currentStage)
  const stepNumber = currentIndex + 1
  const progress = getPipelineProgressPercent(currentStage)

  return (
    <section aria-label="Publishing workflow progress">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className={VIDEO_SECTION_LABEL}>Publishing workflow</p>
          <p className="mt-2 text-xl font-bold text-gray-950 sm:text-2xl">
            Step {stepNumber} of {PIPELINE_STAGES.length} ·{" "}
            <span className={PIPELINE_STAGE_COLORS[currentStage].text}>
              {PIPELINE_STAGE_LABELS[currentStage]}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3 self-start rounded-full border border-gray-200 bg-white px-5 py-2.5 text-base font-bold text-gray-800 shadow-sm sm:text-lg">
          <span
            className={`h-3.5 w-3.5 rounded-full ${PIPELINE_STAGE_COLORS[currentStage].track}`}
            aria-hidden
          />
          {progress}% complete
        </div>
      </div>

      <PipelineTrack currentStage={currentStage} />

      <div className="mt-6">
        <PipelineNodes currentStage={currentStage} currentIndex={currentIndex} />
      </div>

      <p className="mt-8 rounded-2xl border border-violet-100 bg-violet-50/70 px-6 py-4 text-base font-medium text-violet-950 sm:text-lg">
        <span className="font-bold">You are here: </span>
        {PIPELINE_STAGE_DESCRIPTIONS[currentStage]}
      </p>
    </section>
  )
}
