"use client"

import {
  AlertTriangle,
  Database,
  Dumbbell,
  FileText,
  Gauge,
  Lightbulb,
  Tag,
  type LucideIcon,
} from "lucide-react"
import {
  computeExerciseLibraryHealth,
  type ExerciseLibraryHealthStats,
} from "@/lib/exercise-health"
import type { Exercise } from "@/lib/exercise-library"

type HealthCardConfig = {
  label: string
  value: number
  hint: string
  icon: LucideIcon
  variant: "neutral" | "warning"
}

function formatShare(count: number, total: number): string {
  if (total === 0) return "No exercises in library"
  if (count === 0) return "All complete"
  const percent = Math.round((count / total) * 1000) / 10
  return `${count} of ${total} (${percent}%)`
}

function buildHealthCards(stats: ExerciseLibraryHealthStats): HealthCardConfig[] {
  return [
    {
      label: "Total exercises",
      value: stats.total,
      hint: "Exercises in library",
      icon: Database,
      variant: "neutral",
    },
    {
      label: "Missing instructions",
      value: stats.missingInstructions,
      hint: formatShare(stats.missingInstructions, stats.total),
      icon: FileText,
      variant: stats.missingInstructions > 0 ? "warning" : "neutral",
    },
    {
      label: "Missing tips",
      value: stats.missingTips,
      hint: formatShare(stats.missingTips, stats.total),
      icon: Lightbulb,
      variant: stats.missingTips > 0 ? "warning" : "neutral",
    },
    {
      label: "Missing categories",
      value: stats.missingCategories,
      hint: formatShare(stats.missingCategories, stats.total),
      icon: Tag,
      variant: stats.missingCategories > 0 ? "warning" : "neutral",
    },
    {
      label: "Missing difficulty",
      value: stats.missingDifficulty,
      hint: formatShare(stats.missingDifficulty, stats.total),
      icon: Gauge,
      variant: stats.missingDifficulty > 0 ? "warning" : "neutral",
    },
    {
      label: "Missing equipment",
      value: stats.missingEquipment,
      hint: formatShare(stats.missingEquipment, stats.total),
      icon: Dumbbell,
      variant: stats.missingEquipment > 0 ? "warning" : "neutral",
    },
  ]
}

function HealthStatCard({ card }: { card: HealthCardConfig }) {
  const Icon = card.icon
  const isWarning = card.variant === "warning"

  return (
    <article
      className={`glass-panel relative overflow-hidden p-5 ${
        isWarning ? "border-amber-500/25 bg-amber-500/[0.04]" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-400">{card.label}</p>
          <p
            className={`mt-2 text-3xl font-bold tabular-nums tracking-tight ${
              isWarning ? "text-amber-200" : "text-white"
            }`}
          >
            {card.value}
          </p>
          <p className="mt-1 text-xs text-slate-500">{card.hint}</p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            isWarning
              ? "bg-amber-500/15 text-amber-300"
              : "bg-indigo-500/15 text-indigo-300"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  )
}

type ExerciseLibraryHealthWidgetProps = {
  exercises: Exercise[]
}

export default function ExerciseLibraryHealthWidget({
  exercises,
}: ExerciseLibraryHealthWidgetProps) {
  const stats = computeExerciseLibraryHealth(exercises)
  const cards = buildHealthCards(stats)
  const issueCount =
    stats.missingInstructions +
    stats.missingTips +
    stats.missingCategories +
    stats.missingDifficulty +
    stats.missingEquipment

  return (
    <section aria-labelledby="exercise-health-heading" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            id="exercise-health-heading"
            className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300/80"
          >
            Data health
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Admin overview of catalog completeness.
          </p>
        </div>
        {issueCount > 0 ? (
          <div className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-200">
            <AlertTriangle className="h-3.5 w-3.5" />
            {issueCount} gaps detected
          </div>
        ) : stats.total > 0 ? (
          <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-200">
            Catalog looks complete
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {cards.map((card) => (
          <HealthStatCard key={card.label} card={card} />
        ))}
      </div>
    </section>
  )
}
