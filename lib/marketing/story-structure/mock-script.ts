import type { StoryStructureSceneOutput } from "@/lib/marketing/story-structure/types"

export const MOCK_STORY_STRUCTURE_SCENES: StoryStructureSceneOutput[] = [
  {
    order: 1,
    story_beat: "Hook",
    role: "hook",
    text: "Still managing clients manually?",
    narrative_purpose:
      "Stop the scroll in the first 2 seconds with a bold claim or question.",
  },
  {
    order: 2,
    story_beat: "Problem",
    role: "problem",
    text: "Spreadsheets, DMs, and missed follow-ups eat your week.",
    narrative_purpose:
      "Name the frustration your audience lives with every day.",
  },
  {
    order: 3,
    story_beat: "Why it happens",
    role: "why_it_happens",
    text: "You built a coaching business — not an admin job.",
    narrative_purpose:
      "Explain why the problem persists — build empathy and tension.",
  },
  {
    order: 4,
    story_beat: "Solution",
    role: "solution",
    text: "One platform runs members, workouts, and marketing.",
    narrative_purpose:
      "Introduce your product, method, or approach as the fix.",
  },
  {
    order: 5,
    story_beat: "Features",
    role: "features",
    text: "CRM, program builder, and AI content — connected.",
    narrative_purpose:
      "Show 1–2 key capabilities that deliver the solution.",
  },
  {
    order: 6,
    story_beat: "Results",
    role: "results",
    text: "Coaches save 10+ hours and book more consults.",
    narrative_purpose:
      "Prove outcomes — metrics, transformations, or client wins.",
  },
  {
    order: 7,
    story_beat: "CTA",
    role: "cta",
    text: "Start your free trial — link in bio.",
    narrative_purpose: "One clear action — book, DM, start trial, or follow.",
  },
]

export function buildMockStoryStructure(
  campaignName: string,
  topic?: string,
): {
  hook: string
  cta: string
  scenes: StoryStructureSceneOutput[]
} {
  const subject = topic?.trim() || campaignName.trim() || "your coaching business"

  return {
    hook: `Still struggling with ${subject}?`,
    cta: "Start your free trial today.",
    scenes: MOCK_STORY_STRUCTURE_SCENES.map((scene, index) => {
      if (index === 0) {
        return {
          ...scene,
          text: `Still struggling with ${subject}?`,
        }
      }
      if (index === 3) {
        return {
          ...scene,
          text: `${campaignName || "ZyntixAI"} fixes that in one place.`,
        }
      }
      return scene
    }),
  }
}
