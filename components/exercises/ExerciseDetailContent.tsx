"use client"

import Image from "next/image"
import {
  exerciseMetaFromRow,
  formatExerciseMeta,
  formatExercisePrescription,
  sanitizeDisplayText,
} from "@/lib/exercise-display"
import {
  type CoachTip,
  type CommonMistake,
  exerciseDetailFields,
  type FormStep,
} from "@/lib/exercise-metadata"
import { truncateText, type Exercise } from "@/lib/exercise-library"
import ExerciseBadges from "@/components/exercises/ExerciseBadges"
import ExerciseMediaThumbnail from "@/components/exercises/ExerciseMediaThumbnail"

type ExerciseDetailContentProps = {
  name: string
  primaryMuscle: string
  equipment: string
  difficulty: string
  instructions: string
  coachNote?: string | null
  formSteps?: FormStep[]
  commonMistakes?: CommonMistake[]
  coachTips?: CoachTip[]
  imageUrls?: string[]
  isCustom?: boolean
  showMedia?: boolean
  sets?: number
  reps?: string
  restSeconds?: number
  index?: number
  compact?: boolean
  truncateInstructions?: number
  variant?: "light" | "dark"
}

export default function ExerciseDetailContent({
  name,
  primaryMuscle,
  equipment,
  difficulty,
  instructions,
  coachNote,
  formSteps = [],
  commonMistakes = [],
  coachTips = [],
  imageUrls = [],
  isCustom = false,
  showMedia = true,
  sets,
  reps,
  restSeconds,
  index,
  compact = false,
  truncateInstructions,
  variant = "light",
}: ExerciseDetailContentProps) {
  const isDark = variant === "dark"
  const titleClass = isDark ? "text-white" : "text-black"
  const metaClass = isDark ? "text-slate-400" : "text-gray-500"
  const labelClass = isDark ? "text-slate-200" : "text-gray-900"
  const bodyClass = isDark ? "text-slate-300" : "text-gray-600"
  const panelClass = isDark
    ? "rounded-xl border border-white/10 bg-white/[0.04] p-4"
    : "rounded-xl border border-gray-200 bg-gray-50 p-4"
  const tipsPanelClass = isDark
    ? "rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4"
    : "rounded-xl border border-emerald-200 bg-emerald-50 p-4"

  const displayName = sanitizeDisplayText(name) || "Exercise"
  const meta = formatExerciseMeta(primaryMuscle, equipment, difficulty)
  const prescription =
    sets != null && reps != null && restSeconds != null
      ? formatExercisePrescription(sets, reps, restSeconds)
      : null

  const instructionText = sanitizeDisplayText(
    truncateInstructions != null
      ? truncateText(instructions, truncateInstructions)
      : instructions,
  )

  const visibleFormSteps = compact ? formSteps.slice(0, 2) : formSteps
  const visibleMistakes = compact ? commonMistakes.slice(0, 1) : commonMistakes
  const visibleTips = compact ? coachTips.slice(0, 1) : coachTips
  const sanitizedCoachNote = sanitizeDisplayText(coachNote)

  return (
    <div className="space-y-4">
      {!compact ? (
        <>
          <div>
            <h3 className={`text-base font-semibold ${titleClass}`}>
              {index != null ? `${index}. ` : null}
              {displayName}
            </h3>
            {meta ? <p className={`mt-1 text-sm ${metaClass}`}>{meta}</p> : null}
            {prescription ? (
              <p
                className={`mt-1 text-sm font-medium ${isDark ? "text-indigo-200/90" : "text-gray-800"}`}
              >
                {prescription}
              </p>
            ) : null}
          </div>

          <ExerciseBadges
            exercise={{
              is_custom: isCustom,
              primary_muscle: primaryMuscle,
              equipment,
              difficulty,
            }}
            showStandard={!isCustom}
          />
        </>
      ) : null}

      {!compact && showMedia ? (
        imageUrls.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {imageUrls.map((url, imageIndex) => (
              <div
                key={`${url}-${imageIndex}`}
                className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]"
              >
                <Image
                  src={url}
                  alt={`${displayName} demonstration ${imageIndex + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 200px"
                  unoptimized
                />
              </div>
            ))}
          </div>
        ) : (
          <ExerciseMediaThumbnail
            exercise={{
              name: displayName,
              primary_muscle: primaryMuscle,
              equipment,
              image_url: null,
              image_urls: [],
            }}
            variant="detail"
          />
        )
      ) : null}

      {!compact ? (
        <>
          {instructionText ? (
            <div className={panelClass}>
              <p className={`text-sm font-semibold ${labelClass}`}>Instructions</p>
              <p className={`mt-2 text-sm leading-relaxed ${bodyClass}`}>
                {instructionText}
              </p>
            </div>
          ) : null}

          {visibleFormSteps.length > 0 ? (
            <div className={panelClass}>
              <p className={`text-sm font-semibold ${labelClass}`}>Form steps</p>
              <ol className={`mt-3 space-y-2.5 text-sm leading-relaxed ${bodyClass}`}>
                {visibleFormSteps.map((step) => (
                  <li key={step.step} className="flex gap-2">
                    <span
                      className={`shrink-0 font-medium ${isDark ? "text-indigo-300" : "text-indigo-600"}`}
                    >
                      {step.step}.
                    </span>
                    <span>{step.instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {visibleMistakes.length > 0 ? (
            <div>
              <p className={`text-sm font-semibold ${labelClass}`}>Common mistakes</p>
              <ul className={`mt-2 space-y-3 text-sm ${bodyClass}`}>
                {visibleMistakes.map((mistake, mistakeIndex) => (
                  <li
                    key={`${mistake.title}-${mistakeIndex}`}
                    className="rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2"
                  >
                    <p
                      className={`font-medium ${isDark ? "text-rose-200" : "text-rose-700"}`}
                    >
                      {mistake.title}
                    </p>
                    {mistake.description ? (
                      <p className="mt-1 leading-relaxed">{mistake.description}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {visibleTips.length > 0 ? (
            <div className={tipsPanelClass}>
              <p
                className={`text-sm font-semibold ${isDark ? "text-emerald-200" : "text-emerald-800"}`}
              >
                Coach tips
              </p>
              <ul className={`mt-3 space-y-2 text-sm leading-relaxed ${bodyClass}`}>
                {visibleTips.map((tip, tipIndex) => (
                  <li key={`${tip.tip}-${tipIndex}`} className="flex gap-2">
                    <span className={isDark ? "text-emerald-300" : "text-emerald-600"}>
                      •
                    </span>
                    <span>{tip.tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {sanitizedCoachNote && visibleTips.length === 0 ? (
            <div className={tipsPanelClass}>
              <p
                className={`text-sm font-semibold ${isDark ? "text-emerald-200" : "text-emerald-800"}`}
              >
                Coach note
              </p>
              <p className={`mt-2 text-sm leading-relaxed ${bodyClass}`}>
                {sanitizedCoachNote}
              </p>
            </div>
          ) : null}
        </>
      ) : instructionText ? (
        <p className={`text-sm leading-relaxed ${bodyClass}`}>{instructionText}</p>
      ) : null}
    </div>
  )
}

export function ExerciseDetailFromCatalog({
  exercise,
  ...props
}: Omit<
  ExerciseDetailContentProps,
  | "name"
  | "primaryMuscle"
  | "equipment"
  | "difficulty"
  | "instructions"
  | "coachNote"
  | "formSteps"
  | "commonMistakes"
  | "coachTips"
  | "imageUrls"
  | "isCustom"
> & {
  exercise: Exercise
}) {
  const fields = exerciseDetailFields(exercise)

  return (
    <ExerciseDetailContent
      name={exercise.name}
      primaryMuscle={exercise.primary_muscle}
      equipment={exercise.equipment}
      difficulty={exercise.difficulty}
      instructions={exercise.instructions}
      coachNote={fields.legacyCoachNote}
      formSteps={fields.formSteps}
      commonMistakes={fields.commonMistakes}
      coachTips={fields.coachTips}
      imageUrls={fields.imageUrls}
      isCustom={exercise.is_custom}
      {...props}
    />
  )
}

export { exerciseMetaFromRow, formatExercisePrescription }
