/** Pure goal progress helpers (no database access). */

export function isGoalTargetReached(
  startValue: number,
  currentValue: number,
  targetValue: number,
): boolean {
  if (targetValue > startValue) return currentValue >= targetValue
  if (targetValue < startValue) return currentValue <= targetValue
  return currentValue === targetValue
}

export function computeGoalProgressPercent(
  startValue: number,
  currentValue: number,
  targetValue: number,
): number {
  const range = targetValue - startValue
  if (range === 0) {
    return isGoalTargetReached(startValue, currentValue, targetValue) ? 100 : 0
  }

  const raw = ((currentValue - startValue) / range) * 100
  return Math.min(100, Math.max(0, Math.round(raw)))
}
