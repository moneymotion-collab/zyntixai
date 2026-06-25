"use client"

import { useState } from "react"
import Image from "next/image"
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  ListOrdered,
  Plus,
  Sparkles,
  X,
} from "lucide-react"
import Badge from "@/components/ui/badge"
import ExerciseBadges from "@/components/exercises/ExerciseBadges"
import ExerciseMediaThumbnail from "@/components/exercises/ExerciseMediaThumbnail"
import {
  getExerciseVideoEmbed,
  sanitizeDisplayText,
} from "@/lib/exercise-display"
import {
  exerciseDetailFields,
  getInstructionSteps,
} from "@/lib/exercise-metadata"
import type { Exercise } from "@/lib/exercise-library"
import { MOBILE_TAP_TARGET } from "@/lib/ui/mobile-layout"
import AnimatedModal, { useMountAnimatedModal } from "@/components/ui/animated-modal"

type ExerciseDetailModalProps = {
  exercise: Exercise | null
  canAddToWorkout: boolean
  onClose: () => void
  onAddToWorkout: (exercise: Exercise) => void
}

function SectionHeading({
  icon: Icon,
  title,
}: {
  icon: typeof ListOrdered
  title: string
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10">
        <Icon className="h-4 w-4 text-indigo-300" aria-hidden />
      </div>
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
        {title}
      </h3>
    </div>
  )
}

function ImageGallery({
  imageUrls,
  exerciseName,
}: {
  imageUrls: string[]
  exerciseName: string
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const hasMultiple = imageUrls.length > 1

  const goToPrevious = () => {
    setActiveIndex((current) =>
      current === 0 ? imageUrls.length - 1 : current - 1,
    )
  }

  const goToNext = () => {
    setActiveIndex((current) =>
      current === imageUrls.length - 1 ? 0 : current + 1,
    )
  }

  return (
    <div className="space-y-3">
      <div className="group relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <Image
          key={imageUrls[activeIndex]}
          src={imageUrls[activeIndex]}
          alt={`${exerciseName} demonstration ${activeIndex + 1}`}
          fill
          className="object-cover transition duration-500"
          sizes="(max-width: 768px) 100vw, 640px"
          unoptimized
        />

        {hasMultiple ? (
          <>
            <button
              type="button"
              onClick={goToPrevious}
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white opacity-0 backdrop-blur-sm transition duration-300 hover:bg-black/60 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white opacity-0 backdrop-blur-sm transition duration-300 hover:bg-black/60 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {imageUrls.map((url, index) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === activeIndex
                      ? "w-6 bg-indigo-400"
                      : "w-1.5 bg-white/35 hover:bg-white/55"
                  }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      {hasMultiple ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {imageUrls.map((url, index) => (
            <button
              key={`${url}-thumb-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-video overflow-hidden rounded-xl border transition duration-300 ${
                index === activeIndex
                  ? "border-indigo-400/50 ring-2 ring-indigo-400/25"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              <Image
                src={url}
                alt={`${exerciseName} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
                unoptimized
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default function ExerciseDetailModal({
  exercise,
  canAddToWorkout,
  onClose,
  onAddToWorkout,
}: ExerciseDetailModalProps) {
  const { open, requestClose, onExitComplete } = useMountAnimatedModal(onClose)

  if (!exercise) return null

  const fields = exerciseDetailFields(exercise)
  const instructionSteps = getInstructionSteps(exercise, fields.formSteps)
  const videoEmbed = getExerciseVideoEmbed(exercise.video_url)

  const displayName = sanitizeDisplayText(exercise.name) || "Exercise"
  const category = sanitizeDisplayText(exercise.category)

  const coachTips =
    fields.coachTips.length > 0
      ? fields.coachTips
      : fields.legacyCoachNote
        ? [{ tip: fields.legacyCoachNote }]
        : []

  const hasImages = fields.imageUrls.length > 0
  const hasVideo = videoEmbed != null

  return (
    <AnimatedModal
      open={open}
      onClose={requestClose}
      onExitComplete={onExitComplete}
      ariaLabelledBy="exercise-detail-title"
      className="flex items-end justify-center sm:items-center sm:p-6"
      panelClassName="glass-panel flex max-h-[min(92dvh,calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-1rem))] w-full max-w-3xl flex-col overflow-hidden shadow-glow sm:rounded-3xl"
      backdropClassName="bg-black/75 backdrop-blur-md"
    >
        <div className="premium-mesh pointer-events-none absolute inset-0 opacity-60" />

        <div className="relative border-b border-white/10 px-6 pb-6 pt-7 sm:px-8 sm:pt-8">
          <button
            type="button"
            onClick={requestClose}
            className={`absolute right-5 top-5 ${MOBILE_TAP_TARGET} rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition duration-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white sm:right-7 sm:top-7`}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="pr-12">
            <ExerciseBadges exercise={exercise} className="mb-3" />

            <h2
              id="exercise-detail-title"
              className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
            >
              {displayName}
            </h2>

            {category ? (
              <div className="mt-4">
                <Badge variant="category">{category}</Badge>
              </div>
            ) : null}
          </div>
        </div>

        <div className="relative flex-1 overflow-y-auto px-6 py-8 sm:px-8">
          <div className="space-y-10">
            <section>
              <SectionHeading icon={Sparkles} title="Media" />
              <div className="space-y-5">
                {hasImages ? (
                  <ImageGallery
                    key={exercise.id}
                    imageUrls={fields.imageUrls}
                    exerciseName={displayName}
                  />
                ) : hasVideo ? null : (
                  <ExerciseMediaThumbnail
                    exercise={exercise}
                    variant="detail"
                    videoUrl={exercise.video_url}
                  />
                )}

                {hasVideo ? (
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    {videoEmbed!.type === "iframe" ? (
                      <div className="relative aspect-video">
                        <iframe
                          src={videoEmbed!.src}
                          title={`${displayName} demonstration video`}
                          className="absolute inset-0 h-full w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <video
                        src={videoEmbed!.src}
                        controls
                        className="aspect-video w-full"
                        preload="metadata"
                      >
                        Your browser does not support embedded video.
                      </video>
                    )}
                  </div>
                ) : null}
              </div>
            </section>

            {instructionSteps.length > 0 ? (
              <section>
                <SectionHeading icon={ListOrdered} title="Instructions" />
                <ol className="space-y-3">
                  {instructionSteps.map((step) => (
                    <li
                      key={step.step}
                      className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition duration-300 hover:border-white/15 hover:bg-white/[0.05]"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 text-sm font-bold text-indigo-200 ring-1 ring-indigo-400/20">
                        {step.step}
                      </span>
                      <p className="pt-1 text-sm leading-relaxed text-slate-300 sm:text-base">
                        {step.instruction}
                      </p>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            {coachTips.length > 0 ? (
              <section>
                <SectionHeading icon={Lightbulb} title="Coach Tips" />
                <div className="grid gap-3 sm:grid-cols-2">
                  {coachTips.map((tip, index) => (
                    <div
                      key={`${tip.tip}-${index}`}
                      className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.08] to-teal-500/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-emerald-300" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300/90">
                          Tip {index + 1}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-emerald-50/90">
                        {tip.tip}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {fields.commonMistakes.length > 0 ? (
              <section>
                <SectionHeading icon={AlertTriangle} title="Common Mistakes" />
                <div className="space-y-3">
                  {fields.commonMistakes.map((mistake, index) => (
                    <div
                      key={`${mistake.title}-${index}`}
                      className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.08] to-orange-500/[0.04] p-5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-500/15">
                          <AlertTriangle className="h-4 w-4 text-amber-300" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-amber-100">
                            {mistake.title}
                          </p>
                          {mistake.description ? (
                            <p className="mt-1.5 text-sm leading-relaxed text-amber-50/75">
                              {mistake.description}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>

        <div className="relative border-t border-white/10 bg-[#06080f]/80 px-6 py-5 backdrop-blur-xl sm:px-8">
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={requestClose}
              className="btn-ghost flex-1 py-3"
            >
              Close
            </button>
            {canAddToWorkout ? (
              <button
                type="button"
                onClick={() => onAddToWorkout(exercise)}
                className="btn-gradient flex-1 py-3"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add to workout
              </button>
            ) : null}
          </div>
        </div>
    </AnimatedModal>
  )
}
