import OpenAI from "openai"
import { isAiMockMode } from "@/lib/ai-coach/mock-mode"

/** ~150 words/minute spoken; 90 seconds ≈ 225 words. */
export const VOICEOVER_MAX_WORDS = 225

const SCENE_TRANSITIONS = [
  "Next,",
  "From here,",
  "Then,",
  "With that in place,",
  "That means",
  "So,",
] as const

const HYPEY_PHRASES = [
  /\bgame[- ]?changer\b/gi,
  /\bcrushing it\b/gi,
  /\bviral\b/gi,
  /\binsane\b/gi,
  /\bcrazy\b/gi,
  /\bsecret\b/gi,
  /\bhack\b/gi,
  /\bliterally\b/gi,
  /\bstop scrolling\b/gi,
  /\byou won't believe\b/gi,
  /\bmind[- ]?blowing\b/gi,
  /\bfire\b/gi,
  /\bno cap\b/gi,
  /\bslay\b/gi,
  /\bgo viral\b/gi,
]

export type VoiceoverSceneInput = {
  scene_index: number
  text: string
  narration?: string | null
  overlay_text?: string | null
  professional_purpose?: string | null
  workflow_step?: string | null
}

export type VoiceoverProjectContext = {
  brandName?: string | null
  workflowSummary?: string | null
  hook?: string | null
  cta?: string | null
}

function resolveSceneLine(scene: VoiceoverSceneInput): string {
  return (
    scene.narration?.trim() ||
    scene.professional_purpose?.trim() ||
    scene.text?.trim() ||
    scene.overlay_text?.trim() ||
    ""
  )
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function trimVoiceoverToMaxWords(
  script: string,
  maxWords = VOICEOVER_MAX_WORDS,
): string {
  const words = script.trim().split(/\s+/).filter(Boolean)
  if (words.length <= maxWords) {
    return script.trim()
  }

  const trimmed = words.slice(0, maxWords).join(" ")
  const lastSentenceEnd = Math.max(
    trimmed.lastIndexOf("."),
    trimmed.lastIndexOf("?"),
    trimmed.lastIndexOf("!"),
  )

  if (lastSentenceEnd > trimmed.length * 0.6) {
    return trimmed.slice(0, lastSentenceEnd + 1).trim()
  }

  return `${trimmed.replace(/[,;:\-–—\s]+$/, "")}.`
}

function stripHypeyLanguage(text: string): string {
  let result = text
  for (const pattern of HYPEY_PHRASES) {
    result = result.replace(pattern, "")
  }
  return result.replace(/\s{2,}/g, " ").replace(/\s+([,.])/g, "$1").trim()
}

function shortenSentence(sentence: string, maxWords = 18): string {
  const cleaned = stripHypeyLanguage(sentence.replace(/!+/g, "."))
  const words = cleaned.split(/\s+/).filter(Boolean)

  if (words.length <= maxWords) {
    return cleaned.endsWith(".") ? cleaned : `${cleaned}.`
  }

  const shortened = words.slice(0, maxWords).join(" ")
  return `${shortened.replace(/[,;:\-–—\s]+$/, "")}.`
}

function pickTransition(index: number): string {
  return SCENE_TRANSITIONS[index % SCENE_TRANSITIONS.length]
}

function buildSceneOutline(
  scenes: VoiceoverSceneInput[],
  context: VoiceoverProjectContext,
): string {
  const lines: string[] = []

  if (context.workflowSummary?.trim()) {
    lines.push(`Workflow: ${context.workflowSummary.trim()}`)
  }

  if (context.brandName?.trim()) {
    lines.push(`Product: ${context.brandName.trim()}`)
  }

  for (const scene of scenes) {
    const line = resolveSceneLine(scene)
    if (!line) continue

    const step = scene.workflow_step?.trim()
    const label = step
      ? `Scene ${scene.scene_index} (${step})`
      : `Scene ${scene.scene_index}`

    lines.push(`${label}: ${line}`)
  }

  if (context.cta?.trim()) {
    lines.push(`Close: ${context.cta.trim()}`)
  }

  return lines.join("\n")
}

export function buildVoiceoverScriptFallback(
  scenes: VoiceoverSceneInput[],
  context: VoiceoverProjectContext = {},
): string {
  const parts: string[] = []

  const intro = context.hook?.trim() || context.workflowSummary?.trim()
  if (intro) {
    parts.push(shortenSentence(intro))
  } else if (context.brandName?.trim()) {
    parts.push(
      shortenSentence(
        `${context.brandName.trim()} helps you run your coaching business in one place.`,
      ),
    )
  }

  let transitionIndex = 0
  for (const scene of scenes) {
    const line = resolveSceneLine(scene)
    if (!line) continue

    const transition = parts.length > 0 ? `${pickTransition(transitionIndex)} ` : ""
    transitionIndex += 1
    parts.push(`${transition}${shortenSentence(line)}`)
  }

  if (context.cta?.trim()) {
    const transition = parts.length > 0 ? `${pickTransition(transitionIndex)} ` : ""
    parts.push(`${transition}${shortenSentence(context.cta.trim())}`)
  }

  return trimVoiceoverToMaxWords(stripHypeyLanguage(parts.join(" ")))
}

const VOICEOVER_SYSTEM_PROMPT = `You write voiceover scripts for premium B2B SaaS product demo videos.

Rules:
- Sound like a premium SaaS product demo: calm, confident, and professional
- Keep sentences short (maximum 18 words per sentence)
- Explain the workflow clearly, step by step
- Avoid hypey TikTok language (no "game-changer", "crushing it", "viral", "insane", exclamation marks)
- Focus on business value and outcomes for coaches and gym owners
- Total length must fit within 90 seconds when spoken (maximum 225 words)
- Use smooth transitions between scenes (e.g. "Next,", "From here,", "Then,", "With that in place,")

Return ONLY the final voiceover script as plain text. No JSON, no markdown, no labels.`

async function refineVoiceoverScriptWithAi(
  scenes: VoiceoverSceneInput[],
  context: VoiceoverProjectContext,
): Promise<string> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const outline = buildSceneOutline(scenes, context)

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature: 0.4,
    messages: [
      { role: "system", content: VOICEOVER_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Turn this scene outline into one cohesive voiceover script:\n\n${outline}`,
      },
    ],
  })

  const content = response.choices[0]?.message?.content?.trim()
  if (!content) {
    throw new Error("AI did not return a voiceover script.")
  }

  return trimVoiceoverToMaxWords(stripHypeyLanguage(content))
}

export async function buildVoiceoverScript(
  scenes: VoiceoverSceneInput[],
  context: VoiceoverProjectContext = {},
): Promise<string> {
  const hasSource = scenes.some((scene) => Boolean(resolveSceneLine(scene)))

  if (!hasSource) {
    return ""
  }

  if (!isAiMockMode() && process.env.OPENAI_API_KEY) {
    try {
      return await refineVoiceoverScriptWithAi(scenes, context)
    } catch {
      // Fall back to deterministic script if refinement fails.
    }
  }

  return buildVoiceoverScriptFallback(scenes, context)
}

export function estimateVoiceoverSeconds(script: string): number {
  return Math.round((countWords(script) / 150) * 60)
}
