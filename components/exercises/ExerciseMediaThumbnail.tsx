import type { ReactNode } from "react"
import { Dumbbell, Play } from "lucide-react"
import Image from "next/image"
import {
  getExerciseVideoEmbed,
  getExerciseVideoThumbnail,
  sanitizeDisplayText,
} from "@/lib/exercise-display"
import { getExerciseImageUrls } from "@/lib/exercise-metadata"
import type { Exercise } from "@/lib/exercise-library"

type ExerciseMediaThumbnailProps = {
  exercise: Pick<
    Exercise,
    "name" | "primary_muscle" | "equipment" | "image_url" | "image_urls"
  >
  variant?: "card" | "detail"
  className?: string
  videoUrl?: string | null
}

function mediaFrameClass(variant: "card" | "detail", className: string) {
  const isDetail = variant === "detail"
  return `relative w-full overflow-hidden ${
    isDetail ? "aspect-[2/1] rounded-xl border border-white/10" : "aspect-[16/9]"
  } ${className}`
}

function VideoBadge() {
  return (
    <span className="absolute right-2 top-2 z-10 rounded-full border border-white/20 bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
      Video
    </span>
  )
}

function PremiumFallbackShell({
  variant,
  className,
  children,
}: {
  variant: "card" | "detail"
  className?: string
  children: ReactNode
}) {
  return (
    <div className={mediaFrameClass(variant, className ?? "")} aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-violet-950 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(129,140,248,0.35),_transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(167,139,250,0.2),_transparent_50%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:24px_24px]" />
      {children}
    </div>
  )
}

function MediaPlaceholder({
  exercise,
  variant,
}: {
  exercise: Pick<Exercise, "primary_muscle" | "equipment">
  variant: "card" | "detail"
}) {
  const isDetail = variant === "detail"
  const primaryMuscle = sanitizeDisplayText(exercise.primary_muscle)
  const equipment = sanitizeDisplayText(exercise.equipment)

  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center text-center ${
        isDetail ? "gap-3 p-6" : "gap-2 p-4"
      }`}
    >
      <span className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-200">
        Form guide available
      </span>

      <div
        className={`flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] shadow-lg ring-1 ring-white/10 backdrop-blur-sm ${
          isDetail ? "h-16 w-16" : "h-12 w-12"
        }`}
      >
        <Dumbbell
          className={`text-indigo-200 ${isDetail ? "h-8 w-8" : "h-6 w-6"}`}
          strokeWidth={1.75}
          aria-hidden
        />
      </div>

      <div className="space-y-1">
        {primaryMuscle ? (
          <p
            className={`font-semibold uppercase tracking-[0.18em] text-indigo-200/90 ${
              isDetail ? "text-xs" : "text-[10px]"
            }`}
          >
            {primaryMuscle}
          </p>
        ) : null}
        {equipment ? (
          <p className={`text-slate-400 ${isDetail ? "text-sm" : "text-xs"}`}>
            {equipment}
          </p>
        ) : null}
      </div>

      <p className={`text-slate-500 ${isDetail ? "text-sm" : "text-xs"}`}>
        Media coming soon
      </p>
    </div>
  )
}

export default function ExerciseMediaThumbnail({
  exercise,
  variant = "card",
  className = "",
  videoUrl = null,
}: ExerciseMediaThumbnailProps) {
  const imageThumbnail = getExerciseImageUrls(exercise)[0]
  const videoThumbnail = imageThumbnail ? null : getExerciseVideoThumbnail(videoUrl)
  const videoEmbed = imageThumbnail ? null : getExerciseVideoEmbed(videoUrl)
  const displayThumbnail = imageThumbnail ?? videoThumbnail
  const hasMultipleImages = getExerciseImageUrls(exercise).length > 1

  if (displayThumbnail) {
    return (
      <div
        className={`${mediaFrameClass(variant, className)} border-b border-white/5 bg-white/[0.03]`}
      >
        <Image
          src={displayThumbnail}
          alt={exercise.name}
          fill
          className="object-cover"
          sizes={
            variant === "detail"
              ? "(max-width: 768px) 100vw, 512px"
              : "(max-width: 640px) 100vw, (max-width: 1536px) 33vw, 400px"
          }
          unoptimized
        />
        {hasMultipleImages ? (
          <span className="absolute left-2 top-2 z-10 rounded-full border border-white/20 bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
            Gallery
          </span>
        ) : null}
        {videoThumbnail && !imageThumbnail ? (
          <>
            <div className="absolute inset-0 flex items-center justify-center bg-black/35">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white shadow-lg backdrop-blur-sm">
                <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden />
              </div>
            </div>
            <VideoBadge />
          </>
        ) : null}
      </div>
    )
  }

  if (videoEmbed) {
    return (
      <PremiumFallbackShell variant={variant} className={className}>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white shadow-lg backdrop-blur-sm">
            <Play className="ml-0.5 h-6 w-6 fill-current" aria-hidden />
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-indigo-200/90">
            Video available
          </p>
          {sanitizeDisplayText(exercise.equipment) ? (
            <p className="text-xs text-slate-400">{exercise.equipment}</p>
          ) : null}
        </div>
        <VideoBadge />
      </PremiumFallbackShell>
    )
  }

  return (
    <PremiumFallbackShell variant={variant} className={className}>
      <MediaPlaceholder exercise={exercise} variant={variant} />
    </PremiumFallbackShell>
  )
}
