import type { HookLibraryItem } from "@/lib/marketing/hook-library/types"

export const MOCK_HOOK_LIBRARY: HookLibraryItem[] = [
  { text: "Still managing clients manually?", category: "Pain Point" },
  { text: "Drowning in DMs and spreadsheets?", category: "Pain Point" },
  { text: "What if AI handled your content?", category: "Curiosity" },
  { text: "What happens when you stop guessing your posts?", category: "Curiosity" },
  { text: "Most coaches waste 10+ hours per week.", category: "Mistake" },
  { text: "You're posting workouts — not selling outcomes.", category: "Mistake" },
  { text: "Gyms that batch content book more consults.", category: "Opportunity" },
  { text: "Your competitors are still posting randomly.", category: "Opportunity" },
  { text: "Stop posting workout clips every day.", category: "Contrarian" },
  { text: "More content isn't the answer.", category: "Contrarian" },
]

export function buildMockHookLibrary(
  campaignName: string,
  targetAudience: string,
): HookLibraryItem[] {
  const audience = targetAudience.trim() || "coaches and gym owners"

  return MOCK_HOOK_LIBRARY.map((hook) => ({
    ...hook,
    text: personalizeMockHook(hook.text, campaignName, audience),
  }))
}

function personalizeMockHook(
  text: string,
  campaignName: string,
  audience: string,
): string {
  if (!campaignName.trim()) return text

  const replacements: Record<string, string> = {
    "Still managing clients manually?": `Still managing ${audience} manually?`,
    "Most coaches waste 10+ hours per week.": `Most ${audience} waste 10+ hours per week.`,
    "What if AI handled your content?": `What if AI powered "${campaignName}"?`,
  }

  return replacements[text] ?? text
}
