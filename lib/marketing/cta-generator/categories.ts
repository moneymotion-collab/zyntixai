import type { CtaCategory } from "@/lib/marketing/cta-generator/types"

export type CtaCategoryMeta = {
  description: string
  examples: string[]
  pattern: string
}

export const CTA_CATEGORY_META: Record<CtaCategory, CtaCategoryMeta> = {
  "Business Launch": {
    description: "Invite coaches to start or grow their business with AI.",
    examples: ["Start Your Coaching Business With AI"],
    pattern: "Start / Build / Launch + coaching business + AI benefit",
  },
  "Early Access": {
    description: "Create exclusivity — beta, waitlist, or founding member access.",
    examples: ["Join The FitCore AI Beta"],
    pattern: "Join / Get early access + product name + exclusivity",
  },
  "Platform Value": {
    description: "Highlight the all-in-one platform promise.",
    examples: ["Run Your Entire Coaching Business In One Platform"],
    pattern: "Run / Manage / Control + entire business + one platform",
  },
  "Free Trial": {
    description: "Low-friction entry — free trial, demo, or no-commitment start.",
    examples: ["Start Your Free Trial Today"],
    pattern: "Start / Try + free + trial or demo",
  },
  "Direct Action": {
    description: "Clear immediate action — book, DM, sign up, or get started.",
    examples: ["Book Your Demo Now"],
    pattern: "Verb-first command + specific next step",
  },
}

export function getCtaCategoryMeta(category: CtaCategory): CtaCategoryMeta {
  return CTA_CATEGORY_META[category]
}
