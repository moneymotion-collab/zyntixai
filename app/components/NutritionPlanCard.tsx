import { type ReactNode } from "react"
import Button from "@/components/ui/button"
import type { Database } from "@/lib/database.types"

type NutritionPlan = Database["public"]["Tables"]["nutrition_plans"]["Row"]

type NutritionPlanCardProps = {
  plan: NutritionPlan
  assignedCount?: number
  description?: string | null
  onEdit?: (plan: NutritionPlan) => void
  headerRight?: ReactNode
}

function MacroKpiBlock({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent: string
}) {
  return (
    <div className="rounded-2xl bg-black/30 p-4">
      <p className={`text-sm ${accent}`}>{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  )
}

export default function NutritionPlanCard({
  plan,
  assignedCount,
  description,
  onEdit,
  headerRight,
}: NutritionPlanCardProps) {
  const calories =
    plan.calories != null ? `${plan.calories} kcal` : "—"
  const protein = plan.protein != null ? `${plan.protein}g` : "—"
  const carbs = plan.carbs != null ? `${plan.carbs}g` : "—"
  const fats = plan.fats != null ? `${plan.fats}g` : "—"

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">
            Nutrition Plan
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">{plan.title}</h2>
          {plan.goal ? (
            <p className="mt-2 text-sm text-cyan-400">Goal: {plan.goal}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {assignedCount !== undefined ? (
            <span className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-sm font-medium text-cyan-300">
              {assignedCount > 0
                ? `${assignedCount} assigned ${assignedCount === 1 ? "member" : "members"}`
                : "Not assigned yet"}
            </span>
          ) : null}
          {headerRight}
          {onEdit ? (
            <Button variant="outline" size="sm" onClick={() => onEdit(plan)}>
              Edit
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MacroKpiBlock label="Calories" value={calories} accent="text-orange-400" />
        <MacroKpiBlock label="Protein" value={protein} accent="text-emerald-400" />
        <MacroKpiBlock label="Carbs" value={carbs} accent="text-amber-400" />
        <MacroKpiBlock label="Fats" value={fats} accent="text-violet-400" />
      </div>

      {description ? (
        <p className="mt-5 text-sm leading-relaxed text-gray-400">{description}</p>
      ) : null}
    </div>
  )
}
