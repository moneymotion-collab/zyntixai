import type { HookCategory } from "@/lib/marketing/hook-library/types"

export type HookCategoryMeta = {
  description: string
  examples: string[]
  pattern: string
}

export const HOOK_CATEGORY_META: Record<HookCategory, HookCategoryMeta> = {
  "Pain Point": {
    description: "Surface a frustration your audience feels right now.",
    examples: ["Still managing clients manually?"],
    pattern: "Question or statement that names a daily struggle",
  },
  Curiosity: {
    description: "Open a loop the viewer needs to close.",
    examples: ["What if AI handled your content?"],
    pattern: "What if / Have you ever / Nobody talks about",
  },
  Mistake: {
    description: "Call out a common error before offering the fix.",
    examples: ["Most coaches waste 10+ hours per week."],
    pattern: "Most people / The #1 mistake / You're probably",
  },
  Opportunity: {
    description: "Frame an untapped win or moment to act.",
    examples: ["Gyms that post daily get 3x more DMs."],
    pattern: "The coaches who / Right now is the best time / Here's the gap",
  },
  Contrarian: {
    description: "Challenge conventional wisdom to stop the scroll.",
    examples: ["Stop posting workout clips every day."],
    pattern: "Stop doing X / Unpopular opinion / Everyone says X but",
  },
  Results: {
    description: "Lead with proof, outcomes, or transformation.",
    examples: ["How we booked 47 consults in 30 days."],
    pattern: "How we / She went from X to Y / Real numbers",
  },
}

export function getHookCategoryMeta(category: HookCategory): HookCategoryMeta {
  return HOOK_CATEGORY_META[category]
}
