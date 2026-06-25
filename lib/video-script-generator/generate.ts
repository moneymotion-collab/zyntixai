import OpenAI from "openai"
import { isAiMockMode } from "@/lib/ai-coach/mock-mode"
import {
  createChatCompletion,
  isAiQuotaError,
} from "@/lib/ai-coach/openai"
import { enrichVideoScriptWithSubtitles } from "@/lib/video-script-generator/enrich-subtitles"
import { appendLearningContext } from "@/lib/marketing/learning/build-learning-context"
import { parseVideoScriptGeneratorFromText } from "@/lib/video-script-generator/parse"
import {
  buildVideoScriptGeneratorSystemPrompt,
  DEFAULT_INSTAGRAM_REEL_BRIEF,
} from "@/lib/video-script-generator/system-prompt"
import type {
  VideoScriptGeneratorOutput,
  VideoScriptGeneratorResult,
} from "@/lib/video-script-generator/types"

function buildMockInstagramReel(_prompt?: string): VideoScriptGeneratorOutput {
  return enrichVideoScriptWithSubtitles({
    title: "Why Clients Quit Month One",
    hook: "Your clients aren't quitting because of your workouts.",
    scenes: [
      {
        text: "It's the silence after session one.",
        visual:
          "Trainer checks phone in empty gym — unread client message bubble, 9:16 vertical, face close-up, slight zoom.",
        duration: 2,
      },
      {
        text: "No check-in. No plan. No wins.",
        visual:
          "Quick cuts: blank notes app, generic PDF plan, client looking confused at home — bold text overlays, fast pace.",
        duration: 4,
      },
      {
        text: "Give them one win in 7 days.",
        visual:
          "Coach records a 30-second Loom on phone — form cue, habit tracker with one green check, client smiling at screen.",
        duration: 5,
      },
      {
        text: "Message them twice. Not ten.",
        visual:
          "Split screen: messy DM thread vs clean 2-message check-in template — thumb-friendly mobile UI mockup.",
        duration: 4,
      },
      {
        text: "Retention beats new leads.",
        visual:
          "Simple graphic: 10 retained clients > 30 churned leads — coach pointing at number on whiteboard, confident energy.",
        duration: 4,
      },
    ],
    voiceover: `Your clients aren't quitting because of your workouts. They quit because week one feels unclear. No check-in. No quick win. No proof they're progressing. Here's the fix coaches overlook: give every new client one visible win in seven days. A form video. A habit streak. A scale or strength marker they can feel. Then message them twice — not ten times. Once after session one. Once when they hit that win. Retention beats chasing new leads every month. Save this if you run a gym or coach online.`,
    captions: [
      "It's the silence after session one.",
      "No check-in. No plan. No wins.",
      "Give them one win in 7 days.",
      "Message them twice. Not ten.",
      "Retention beats new leads.",
    ],
    CTA: "Comment RETAIN — I'll send my 7-day client onboarding checklist.",
  })
}

async function generateWithOpenAiJson(
  prompt: string,
  learningContext?: string | null,
): Promise<{ ok: true; content: string } | { ok: false; error: string; status?: number }> {
  if (!process.env.OPENAI_API_KEY?.trim()) {
    return { ok: false, error: "OPENAI_API_KEY is not configured on the server." }
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini"

  try {
    const userContent = appendLearningContext(prompt.trim(), learningContext)

    const response = await openai.chat.completions.create({
      model,
      temperature: 0.8,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildVideoScriptGeneratorSystemPrompt() },
        { role: "user", content: userContent },
      ],
    })

    const content = response.choices[0]?.message?.content?.trim() ?? ""
    if (!content) {
      return { ok: false, error: "AI returned an empty response." }
    }

    return { ok: true, content }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to reach OpenAI."
    const status =
      err && typeof err === "object" && "status" in err
        ? Number((err as { status?: number }).status)
        : undefined

    return { ok: false, error: message, status }
  }
}

export async function generateInstagramReel(
  prompt: string = DEFAULT_INSTAGRAM_REEL_BRIEF,
): Promise<VideoScriptGeneratorResult> {
  return generateVideoScriptFromPrompt(prompt)
}

export async function generateVideoScriptFromPrompt(
  prompt: string,
  learningContext?: string | null,
): Promise<VideoScriptGeneratorResult> {
  const trimmed = prompt.trim() || DEFAULT_INSTAGRAM_REEL_BRIEF

  if (isAiMockMode()) {
    return { ok: true, script: buildMockInstagramReel(trimmed) }
  }

  const openAiResult = await generateWithOpenAiJson(trimmed, learningContext)

  if (!openAiResult.ok) {
    if (isAiQuotaError(openAiResult.error, openAiResult.status)) {
      return {
        ok: true,
        script: buildMockInstagramReel(trimmed),
        warning:
          "OpenAI quota reached — showing a sample script. Add billing or set AI_MOCK_MODE=true.",
      }
    }

    const fallback = await createChatCompletion(
      [
        { role: "system", content: buildVideoScriptGeneratorSystemPrompt() },
        {
          role: "user",
          content: appendLearningContext(trimmed, learningContext),
        },
      ],
      { prompt: trimmed },
    )

    if (!fallback.ok) {
      return fallback
    }

    const parsedFallback = parseVideoScriptGeneratorFromText(fallback.content)
    if (!parsedFallback.ok) {
      return {
        ok: false,
        error: `Could not parse video script: ${parsedFallback.reason}`,
      }
    }

    return { ok: true, script: enrichVideoScriptWithSubtitles(parsedFallback.script) }
  }

  const parsed = parseVideoScriptGeneratorFromText(openAiResult.content)
  if (!parsed.ok) {
    return {
      ok: false,
      error: `Could not parse video script: ${parsed.reason}`,
    }
  }

  return { ok: true, script: enrichVideoScriptWithSubtitles(parsed.script) }
}
