import { isAiMockMode } from "@/lib/ai-coach/mock-mode"
import { safeParse } from "@/lib/safe-parse-json"
import {
  createChatCompletion,
  isAiQuotaError,
} from "@/lib/ai-coach/openai"
import {
  clampViralScore,
  hasRequiredViralScore,
} from "@/lib/marketing/viral-score"

export type ViralRecommendation = "approve" | "optimize" | "reject"

export type AnalyzeViralInput = {
  title: string
  caption: string
  hashtags: string
  platform?: string
}

export type ViralAnalysisResult = {
  viral_score: number
  feedback: string[]
  viral_reason: string
  recommendation: ViralRecommendation
}

const VIRAL_RECOMMENDATIONS = ["approve", "optimize", "reject"] as const

const SYSTEM_PROMPT =
  "You are a viral marketing expert. Output ONLY JSON."

function buildUserPrompt(input: AnalyzeViralInput): string {
  return `Analyze this social media post:

TITLE:
${input.title}

CONTENT:
${input.caption}

HASHTAGS:
${input.hashtags}

Return ONLY JSON with at least 3 feedback items:

{
  "viral_score": 0,
  "feedback": [
    "short actionable tip 1",
    "short actionable tip 2",
    "short actionable tip 3"
  ],
  "recommendation": "approve | optimize | reject"
}`
}

function buildFallbackFeedback(
  score: number,
  recommendation: ViralRecommendation,
  input: AnalyzeViralInput,
): string[] {
  const feedback: string[] = []

  if (score >= 75) {
    feedback.push(
      "Strong hook and message clarity — polish the CTA before publishing.",
    )
  } else if (score >= 55) {
    feedback.push(
      "Solid foundation — sharpen the opening line to boost scroll-stops.",
    )
  } else {
    feedback.push("Rework the hook — lead with a bold claim or question.")
  }

  if (input.hashtags.trim()) {
    feedback.push("Mix broad and niche hashtags for reach and targeting.")
  } else {
    feedback.push("Add 5–8 relevant hashtags to improve discoverability.")
  }

  if (recommendation === "reject") {
    feedback.push("Align the caption tone with your brand before posting.")
  } else if (recommendation === "optimize") {
    feedback.push("Tighten the CTA so viewers know exactly what to do next.")
  } else {
    feedback.push("Post at peak hours to maximize early engagement.")
  }

  return feedback
}

function finalizeAnalysisResult(
  partial: {
    viral_score: number
    feedback: string[]
    viral_reason: string
    recommendation: ViralRecommendation
  },
  input: AnalyzeViralInput,
): ViralAnalysisResult {
  const feedback =
    partial.feedback.length > 0
      ? partial.feedback
      : buildFallbackFeedback(
          partial.viral_score,
          partial.recommendation,
          input,
        )

  const viral_reason =
    partial.viral_reason.trim() ||
    feedbackToReason(feedback) ||
    `Recommendation: ${partial.recommendation}`

  return {
    viral_score: partial.viral_score,
    feedback,
    viral_reason,
    recommendation: partial.recommendation,
  }
}

function feedbackToReason(feedback: string[]): string {
  const items = feedback.map((item) => item.trim()).filter(Boolean)
  if (items.length === 0) return ""
  return items.map((item) => `• ${item}`).join("\n")
}

function inferRecommendation(score: number): ViralRecommendation {
  if (score >= 75) return "approve"
  if (score >= 55) return "optimize"
  return "reject"
}

function normalizeRecommendation(value: unknown): ViralRecommendation | null {
  if (typeof value !== "string") return null
  const normalized = value.trim().toLowerCase()
  return VIRAL_RECOMMENDATIONS.includes(normalized as ViralRecommendation)
    ? (normalized as ViralRecommendation)
    : null
}

function isCompleteAnalysis(result: ViralAnalysisResult): boolean {
  return (
    hasRequiredViralScore(result) &&
    result.feedback.length > 0 &&
    result.viral_reason.trim().length > 0
  )
}

function parseAnalysisResponse(
  raw: string,
  input: AnalyzeViralInput,
): ViralAnalysisResult | null {
  const jsonMatch = raw.trim().match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null

  const parsed = safeParse(jsonMatch[0]) as {
    viral_score?: unknown
    viral_reason?: unknown
    feedback?: unknown
    recommendation?: unknown
  } | null

  if (!parsed) return null

  const viral_score = clampViralScore(parsed.viral_score)
  if (viral_score == null) return null

  const feedback = Array.isArray(parsed.feedback)
    ? parsed.feedback
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : []

  const recommendation =
    normalizeRecommendation(parsed.recommendation) ??
    inferRecommendation(viral_score)

  const viral_reason =
    typeof parsed.viral_reason === "string" ? parsed.viral_reason.trim() : ""

  return finalizeAnalysisResult(
    {
      viral_score,
      feedback,
      viral_reason,
      recommendation,
    },
    input,
  )
}

function buildMockAnalysis(input: AnalyzeViralInput): ViralAnalysisResult {
  const hasHook = input.caption.includes("?") || input.title.length <= 60
  const viral_score = hasHook ? 78 : 64
  const feedback = [
    hasHook
      ? "The hook is clear — test a stronger first line in the caption."
      : "Add a question or bold claim in the first line to stop the scroll.",
    input.hashtags.trim()
      ? "Mix broad and niche hashtags to reach new and targeted audiences."
      : "Add 5–8 relevant hashtags to improve discoverability.",
    "Include a save-worthy CTA such as a checklist or quick tip.",
  ]
  const recommendation = inferRecommendation(viral_score)

  return finalizeAnalysisResult(
    {
      viral_score,
      feedback,
      viral_reason: feedbackToReason(feedback),
      recommendation,
    },
    input,
  )
}

export async function analyzeViralPotential(
  input: AnalyzeViralInput,
): Promise<
  | { ok: true; result: ViralAnalysisResult; warning?: string }
  | { ok: false; error: string }
> {
  if (isAiMockMode()) {
    return { ok: true, result: buildMockAnalysis(input) }
  }

  const userPrompt = buildUserPrompt(input)

  const completion = await createChatCompletion(
    [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    { prompt: userPrompt },
  )

  if (!completion.ok) {
    if (isAiQuotaError(completion.error, completion.status)) {
      return {
        ok: true,
        result: buildMockAnalysis(input),
        warning:
          "OpenAI quota reached — showing sample analysis. Add billing at platform.openai.com or set AI_MOCK_MODE=true in .env.local.",
      }
    }
    return completion
  }

  const result = parseAnalysisResponse(completion.content, input)

  if (!result || !isCompleteAnalysis(result)) {
    return {
      ok: false,
      error:
        "Could not parse viral analysis from AI response. viral_score, feedback, and viral_reason are required.",
    }
  }

  return { ok: true, result }
}
