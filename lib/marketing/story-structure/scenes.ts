import type { StoryStructureScenePlan } from "@/lib/marketing/story-structure/types"

export const STORY_STRUCTURE_SCENES: StoryStructureScenePlan[] = [
  {
    id: "hook",
    order: 1,
    label: "Hook",
    narrativeRole: "Pattern interrupt",
    purpose: "Stop the scroll in the first 2 seconds with a bold claim or question.",
    flowHint: "Opens the story — viewer must feel this is about them.",
  },
  {
    id: "problem",
    order: 2,
    label: "Problem",
    narrativeRole: "Pain amplification",
    purpose: "Name the frustration your audience lives with every day.",
    flowHint: "Directly answers why the hook matters — make the pain concrete.",
  },
  {
    id: "why_it_happens",
    order: 3,
    label: "Why it happens",
    narrativeRole: "Root cause",
    purpose: "Explain why the problem persists — build empathy and tension.",
    flowHint: "Bridge from pain to insight — the viewer should nod along.",
  },
  {
    id: "solution",
    order: 4,
    label: "Solution",
    narrativeRole: "Turning point",
    purpose: "Introduce your product, method, or approach as the fix.",
    flowHint: "Must directly address the root cause from scene 3.",
  },
  {
    id: "features",
    order: 5,
    label: "Features",
    narrativeRole: "Proof of mechanism",
    purpose: "Show 1–2 key capabilities that deliver the solution.",
    flowHint: "Demonstrate how the solution works — not a feature dump.",
  },
  {
    id: "results",
    order: 6,
    label: "Results",
    narrativeRole: "Social proof",
    purpose: "Prove outcomes — metrics, transformations, or client wins.",
    flowHint: "Validate that the features from scene 5 produce real results.",
  },
  {
    id: "cta",
    order: 7,
    label: "CTA",
    narrativeRole: "Close the loop",
    purpose: "One clear action — book, DM, start trial, or follow.",
    flowHint: "Callback to the hook promise — tell them exactly what to do next.",
  },
]

export function getStoryStructureScene(
  id: StoryStructureScenePlan["id"],
): StoryStructureScenePlan {
  const scene = STORY_STRUCTURE_SCENES.find((item) => item.id === id)
  if (!scene) {
    throw new Error(`Unknown story structure scene: ${id}`)
  }
  return scene
}

export function getStoryStructureLabel(order: number): string {
  return STORY_STRUCTURE_SCENES[order - 1]?.label ?? `Scene ${order}`
}
