import type { MarketingPost } from "@/lib/marketing/get-mock-marketing-data"

export const PIPELINE_STAGES = [
  "draft",
  "approved",
  "scheduled",
  "published",
] as const

export type PipelineStage = (typeof PIPELINE_STAGES)[number]

export const PIPELINE_STAGE_LABELS: Record<PipelineStage, string> = {
  draft: "Draft",
  approved: "Approved",
  scheduled: "Scheduled",
  published: "Published",
}

export const PIPELINE_STAGE_DESCRIPTIONS: Record<PipelineStage, string> = {
  draft: "Content created — review and approve",
  approved: "Ready to pick a publish time",
  scheduled: "Queued — publishes when due",
  published: "Live on your channel",
}

export const PIPELINE_STAGE_COLORS: Record<
  PipelineStage,
  {
    active: string
    complete: string
    idle: string
    track: string
    text: string
    ring: string
  }
> = {
  draft: {
    active: "border-slate-600 bg-slate-700 text-white",
    complete: "border-slate-400 bg-slate-500 text-white",
    idle: "border-slate-200 bg-white text-slate-300",
    track: "bg-slate-500",
    text: "text-slate-700",
    ring: "ring-slate-200",
  },
  approved: {
    active: "border-blue-600 bg-blue-600 text-white",
    complete: "border-blue-500 bg-blue-500 text-white",
    idle: "border-blue-100 bg-white text-blue-200",
    track: "bg-blue-500",
    text: "text-blue-700",
    ring: "ring-blue-200",
  },
  scheduled: {
    active: "border-amber-500 bg-amber-500 text-white",
    complete: "border-amber-400 bg-amber-400 text-white",
    idle: "border-amber-100 bg-white text-amber-200",
    track: "bg-amber-500",
    text: "text-amber-700",
    ring: "ring-amber-200",
  },
  published: {
    active: "border-emerald-600 bg-emerald-600 text-white",
    complete: "border-emerald-500 bg-emerald-500 text-white",
    idle: "border-emerald-100 bg-white text-emerald-200",
    track: "bg-emerald-500",
    text: "text-emerald-700",
    ring: "ring-emerald-200",
  },
}

export function getPipelineProgressPercent(stage: PipelineStage): number {
  const index = getPipelineStageIndex(stage)
  if (PIPELINE_STAGES.length <= 1) return 0
  return Math.round((index / (PIPELINE_STAGES.length - 1)) * 100)
}

export const APPROVED_VIRAL_STATUSES = ["approved", "approve"] as const

export function isApprovedViralStatus(viralStatus: string | null | undefined): boolean {
  const value = viralStatus?.trim().toLowerCase() ?? ""
  return (APPROVED_VIRAL_STATUSES as readonly string[]).includes(value)
}

export function getPipelineStage(post: MarketingPost): PipelineStage {
  const status = (post.status ?? "").trim().toLowerCase()

  if (status === "published") return "published"
  if (status === "scheduled") return "scheduled"
  if (isApprovedViralStatus(post.viral_status)) return "approved"

  return "draft"
}

export function getPipelineStageIndex(stage: PipelineStage): number {
  return PIPELINE_STAGES.indexOf(stage)
}

export function getPlatformBadgeClass(platform: string): string {
  const value = platform.trim().toLowerCase()

  if (value.includes("instagram")) {
    return "border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50 text-pink-800"
  }
  if (value.includes("tiktok")) {
    return "border-gray-300 bg-gray-900 text-white"
  }
  if (value.includes("facebook")) {
    return "border-blue-200 bg-blue-50 text-blue-800"
  }

  return "border-gray-200 bg-gray-100 text-gray-700"
}

export function getPostCardAccent(stage: PipelineStage): {
  border: string
  header: string
  ring: string
} {
  switch (stage) {
    case "published":
      return {
        border: "border-emerald-200",
        header: "from-emerald-500 to-teal-500",
        ring: "ring-emerald-100",
      }
    case "scheduled":
      return {
        border: "border-amber-200",
        header: "from-amber-400 to-orange-500",
        ring: "ring-amber-100",
      }
    case "approved":
      return {
        border: "border-blue-200",
        header: "from-blue-500 to-cyan-500",
        ring: "ring-blue-100",
      }
    default:
      return {
        border: "border-gray-200",
        header: "from-gray-500 to-gray-700",
        ring: "ring-gray-100",
      }
  }
}
