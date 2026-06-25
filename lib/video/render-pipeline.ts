export const RENDER_PIPELINE_STATUS = {
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const

export type RenderPipelineStatus =
  (typeof RENDER_PIPELINE_STATUS)[keyof typeof RENDER_PIPELINE_STATUS]

export type RenderType = "preview" | "final"

export function isValidVideoUrl(url: string | null | undefined): boolean {
  if (typeof url !== "string") return false
  const trimmed = url.trim()
  if (!trimmed) return false

  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

export function normalizeRenderStatus(
  status: string | null | undefined,
): RenderPipelineStatus | "ready" | "rendering" | "queued" | "draft" | string {
  return (status ?? "").trim().toLowerCase()
}

export function isRenderCompleted(
  status: string | null | undefined,
  videoUrl: string | null | undefined,
): boolean {
  const normalized = normalizeRenderStatus(status)
  return (
    (normalized === RENDER_PIPELINE_STATUS.COMPLETED || normalized === "ready") &&
    isValidVideoUrl(videoUrl)
  )
}

export function isRenderProcessing(status: string | null | undefined): boolean {
  const normalized = normalizeRenderStatus(status)
  return (
    normalized === RENDER_PIPELINE_STATUS.PROCESSING ||
    normalized === "rendering" ||
    normalized === "generating" ||
    normalized === "queued"
  )
}

export function isRenderFailed(status: string | null | undefined): boolean {
  return normalizeRenderStatus(status) === RENDER_PIPELINE_STATUS.FAILED
}

export function logRenderStep(
  videoId: string,
  step: string,
  detail?: string,
): void {
  const suffix = detail ? `: ${detail}` : ""
  console.log(`[VIDEO_RENDER ${videoId}] ${step}${suffix}`)
}
