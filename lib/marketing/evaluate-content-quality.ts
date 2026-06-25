export type ContentQualityStatus =
  | "approved"
  | "needs_optimization"
  | "rejected"

export type ContentQualityAction =
  | "auto_publish"
  | "schedule"
  | "optimize"
  | "discard"

export type ContentQualityEvaluation = {
  status: ContentQualityStatus
  action: ContentQualityAction
  reason: string
}

export function evaluateContentQuality(
  score: number,
): ContentQualityEvaluation {
  if (score >= 90) {
    return {
      status: "approved",
      action: "auto_publish",
      reason: "Excellent viral potential",
    }
  }

  if (score >= 80) {
    return {
      status: "approved",
      action: "schedule",
      reason: "Good quality content",
    }
  }

  if (score >= 60) {
    return {
      status: "needs_optimization",
      action: "optimize",
      reason: "Needs improvement for engagement",
    }
  }

  return {
    status: "rejected",
    action: "discard",
    reason: "Too low engagement potential",
  }
}
