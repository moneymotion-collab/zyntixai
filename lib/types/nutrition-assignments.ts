export const NUTRITION_ASSIGNMENT_STATUS = {
  active: "active",
  completed: "completed",
  paused: "paused",
} as const

export type NutritionAssignmentStatus =
  (typeof NUTRITION_ASSIGNMENT_STATUS)[keyof typeof NUTRITION_ASSIGNMENT_STATUS]
