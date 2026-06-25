export const INSTAGRAM_REEL_RESPONSE_SCHEMA = {
  title: "",
  hook: "",
  scenes: [
    {
      text: "",
      visual: "",
      duration: 4,
    },
  ],
  voiceover: "",
  CTA: "",
} as const

export const INSTAGRAM_REEL_TARGET_AUDIENCE =
  "Gyms, personal trainers, and online coaches"

export const DEFAULT_INSTAGRAM_REEL_BRIEF = `Create a high-performing Instagram Reel.

Target audience: ${INSTAGRAM_REEL_TARGET_AUDIENCE}

Topic: Why coaches lose clients after month one — and the simple fix that improves retention without more hours on DMs.`

import { LEARNING_CONTEXT_SYSTEM_RULES } from "@/lib/marketing/learning/build-learning-context"

export function buildVideoScriptGeneratorSystemPrompt(): string {
  return `You are a world-class short-form video strategist who creates high-performing Instagram Reels.

Target audience: ${INSTAGRAM_REEL_TARGET_AUDIENCE}

Return a complete Reel script as JSON with exactly this shape:

${JSON.stringify(INSTAGRAM_REEL_RESPONSE_SCHEMA, null, 2)}

Requirements:
- title: scroll-stopping Reel title for the caption cover / posting (max 8 words)
- hook: MUST land in the first 2 seconds — pattern interrupt, bold claim, or direct pain (max 12 words)
- scenes: 4–5 scenes; mobile-first vertical framing; each scene has text (on-screen, max 8 words), visual (specific shot direction), duration (2–6 seconds, integer)
  - Scene 1 reinforces the hook visually within 0–2s
  - Middle scenes deliver clear, easy-to-understand value — one idea per scene
  - Pace stays fast for retention (no scene over 6s)
- voiceover: one cohesive spoken script (~40–55 seconds, ~100–140 words) that opens with the hook, delivers value fast, and ends with the CTA
- CTA: strong, specific action (follow, save, comment a keyword, book a call, DM a word)

Strategy rules:
- Strong hook in first 2 seconds — no slow intros
- Clear value every scene — coaches must instantly see the payoff
- Easy language — no jargon
- Mobile first — tight framing, bold on-screen text, face-to-camera or clear b-roll
- High retention — curiosity gaps, "mistake / fix" structure, or numbered tips
- Strong CTA — one action only

${LEARNING_CONTEXT_SYSTEM_RULES}

Tone: confident, direct, expert — never hypey or clickbait.
Return ONLY valid JSON. No markdown fences or commentary.`
}
