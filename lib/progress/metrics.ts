export const METRIC_LOG_OPTIONS = [
  { value: "weight", label: "Weight", storedLabel: "Body Weight (kg)" },
  { value: "body_fat", label: "Body fat", storedLabel: "Body Fat (%)" },
  { value: "strength", label: "Strength", storedLabel: "Strength" },
  { value: "endurance", label: "Endurance", storedLabel: "Endurance" },
  { value: "custom", label: "Custom", storedLabel: "Custom" },
] as const

export type MetricLogCategory = (typeof METRIC_LOG_OPTIONS)[number]["value"]

export function resolveStoredMetricLabel(
  category: MetricLogCategory,
  customName?: string,
): string {
  if (category === "custom") {
    const trimmed = customName?.trim()
    return trimmed || "Custom"
  }

  return (
    METRIC_LOG_OPTIONS.find((option) => option.value === category)?.storedLabel ??
    category
  )
}

/** Canonical metric key stored in progress_logs (e.g. "weight", not "Body Weight (kg)"). */
export function resolveCanonicalMetricKey(
  category: MetricLogCategory,
  customName?: string,
): string {
  if (category === "custom") {
    const trimmed = customName?.trim()
    return trimmed || "custom"
  }

  return category
}

export const METRIC_FILTER_OPTIONS = [
  { value: "all", label: "All metrics" },
  { value: "weight", label: "Weight" },
  { value: "body_fat", label: "Body fat" },
  { value: "strength", label: "Strength" },
  { value: "endurance", label: "Endurance" },
  { value: "custom", label: "Custom" },
] as const

export type MetricFilter = (typeof METRIC_FILTER_OPTIONS)[number]["value"]
export type MetricCategory = Exclude<MetricFilter, "all">

export function classifyMetric(metric: string | null | undefined): MetricCategory {
  const m = (metric ?? "").toLowerCase().trim()

  if (
    m === "weight" ||
    m === "body weight (kg)" ||
    m === "body weight" ||
    m.includes("gewicht") ||
    (m.includes("weight") && !m.includes("body fat") && !m.includes("bodyfat"))
  ) {
    return "weight"
  }

  if (
    m === "body_fat" ||
    m === "body fat (%)" ||
    m.includes("body fat") ||
    m.includes("bodyfat") ||
    m.includes("bf%")
  ) {
    return "body_fat"
  }

  if (
    m.includes("1rm") ||
    m.includes("squat") ||
    m.includes("bench") ||
    m.includes("deadlift") ||
    m.includes("strength") ||
    (m.includes("press") && !m.includes("hr"))
  ) {
    return "strength"
  }

  if (
    m.includes("hr") ||
    m.includes("heart") ||
    m.includes("endurance") ||
    m.includes("vo2") ||
    m.includes("run") ||
    m.includes("cardio") ||
    m.includes("bpm")
  ) {
    return "endurance"
  }

  return "custom"
}

export function matchesMetricFilter(
  metric: string | null | undefined,
  filter: MetricFilter,
): boolean {
  if (filter === "all") return true
  return classifyMetric(metric) === filter
}

/** Positive score means progress toward typical fitness goals. */
export function improvementScore(
  metric: string | null | undefined,
  changeValue: number | null | undefined,
): number | null {
  if (changeValue == null || Number.isNaN(Number(changeValue))) return null

  const category = classifyMetric(metric)
  const change = Number(changeValue)

  if (category === "strength") return change
  if (category === "weight" || category === "body_fat" || category === "endurance") {
    return -change
  }

  return change
}

export function formatMetricLabel(category: MetricCategory): string {
  return METRIC_FILTER_OPTIONS.find((o) => o.value === category)?.label ?? "Custom"
}

export function formatCategoryDisplay(category: MetricCategory): string {
  const option = METRIC_LOG_OPTIONS.find((item) => item.value === category)
  if (option) return option.storedLabel
  return formatMetricLabel(category)
}

/** Display label for any stored progress_logs.metric value. */
export function formatMetricDisplay(metric: string | null | undefined): string {
  if (!metric?.trim()) return "—"
  return formatCategoryDisplay(classifyMetric(metric))
}
