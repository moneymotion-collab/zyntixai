export type WeightGoalStats = {
  currentWeight: number
  goalWeight: number
  remainingWeight: number
  progressPercentage: number
  isLossGoal: boolean
}

export function computeWeightGoalStats(
  weightKg: number | null | undefined,
  goalWeight: number | null | undefined,
): WeightGoalStats | null {
  if (weightKg == null || goalWeight == null) return null

  const currentWeight = Number(weightKg)
  const goalWeightValue = Number(goalWeight)

  if (
    Number.isNaN(currentWeight) ||
    Number.isNaN(goalWeightValue) ||
    currentWeight <= 0 ||
    goalWeightValue <= 0
  ) {
    return null
  }

  const remainingWeight = currentWeight - goalWeightValue
  const isLossGoal = goalWeightValue < currentWeight
  const startValue = isLossGoal
    ? Math.max(currentWeight, goalWeightValue)
    : Math.min(currentWeight, goalWeightValue)
  const progressPercentage = computeProgressPercent(
    startValue,
    currentWeight,
    goalWeightValue,
  )

  return {
    currentWeight,
    goalWeight: goalWeightValue,
    remainingWeight,
    progressPercentage,
    isLossGoal,
  }
}

function computeProgressPercent(
  startValue: number,
  currentValue: number,
  targetValue: number,
): number {
  const range = targetValue - startValue
  if (range === 0) {
    return currentValue === targetValue ? 100 : 0
  }

  const raw = ((currentValue - startValue) / range) * 100
  return Math.min(100, Math.max(0, Math.round(raw)))
}

export function formatWeightKg(value: number): string {
  return Number.isInteger(value) ? `${value} kg` : `${value.toFixed(1)} kg`
}

export function formatRemainingKg(value: number, isLossGoal: boolean): string {
  const abs = Math.abs(value)
  const formatted = Number.isInteger(abs) ? `${abs} kg` : `${abs.toFixed(1)} kg`

  if (value === 0) return "Goal reached"
  if (isLossGoal) return `${formatted} to lose`
  return `${formatted} to gain`
}
