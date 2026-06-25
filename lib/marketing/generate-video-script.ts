import { isAiMockMode } from "@/lib/ai-coach/mock-mode"
import {
  createChatCompletion,
  isAiQuotaError,
} from "@/lib/ai-coach/openai"
import {
  FITCORE_COACH_MASCOT,
  getMascotDescription,
  getMascotStyle,
} from "@/lib/marketing/brand-mascot"
import { enrichScenesWithImagePrompts } from "@/lib/marketing/build-scene-image-prompt"
import { parseVideoScriptFromTextWithResult } from "@/lib/marketing/parse-video-script"
import type { VideoScript } from "@/lib/marketing/video-script-types"
import { buildVideoDirectorSystemPrompt } from "@/lib/marketing/video-director-prompt"

function buildMockVideoScript(): VideoScript {
  const mascot = {
    name: FITCORE_COACH_MASCOT.name,
    description: getMascotDescription(),
    style: getMascotStyle(),
    personality: FITCORE_COACH_MASCOT.personality.join(", "),
  }

  return {
    hook: "Stop guessing your warm-up.",
    style: "mascot_story",
    mascot,
    scenes: enrichScenesWithImagePrompts(
      [
      {
        text: "Most lifters skip the prep that unlocks power.",
        visual:
          "FitCore Coach mascot in a dim gym, pointing at a skipped warm-up checklist on a tablet.",
        image_prompt: "",
        camera_motion: "slow zoom in",
        transition: "motion blur",
        duration: 7,
      },
      {
        text: "I built a 90-second routine that fixes that.",
        visual:
          "Animated timer overlay on a clean gym floor with neon blue glow accents and equipment staged for warm-up.",
        image_prompt: "",
        camera_motion: "dolly slide left",
        transition: "cross dissolve",
        duration: 8,
      },
      {
        text: "Same weight. Cleaner reps. Better sessions.",
        visual:
          "Split-screen before/after rep comparison beside the mascot, warm rim light on the solution side.",
        image_prompt: "",
        camera_motion: "pull back reveal",
        transition: "fade to black",
        duration: 7,
      },
      ],
      mascot,
    ),
    cta: "Follow FitCore Coach for smarter training.",
    thumbnail_title: "Stop Guessing",
    thumbnail_text: "Fix your warm-up in 90 seconds",
    thumbnail_visual:
      "FitCore Coach mascot close-up, neon blue rim light, bold cover composition on dark gym background.",
    musicMood: "confident, energetic, premium",
    caption:
      "Your warm-up is either building your session or killing it. FitCore Coach breaks down the 90-second fix.",
    hashtags: ["fitness", "warmup", "gymtips", "FitCoreCoach", "reels"],
  }
}

export async function generateVideoScript(
  userInput = "Create a short-form marketing video for my gym. Focus on education or member motivation.",
): Promise<
  | { ok: true; script: VideoScript; warning?: string }
  | { ok: false; error: string }
> {
  if (isAiMockMode()) {
    return { ok: true, script: buildMockVideoScript() }
  }

  const result = await createChatCompletion(
    [
      { role: "system", content: buildVideoDirectorSystemPrompt() },
      { role: "user", content: userInput },
    ],
    {
      prompt: "Create a short-form marketing video for my gym.",
    },
  )

  if (!result.ok) {
    if (isAiQuotaError(result.error, result.status)) {
      return {
        ok: true,
        script: buildMockVideoScript(),
        warning:
          "OpenAI quota reached — showing a sample script. Add billing at platform.openai.com or set AI_MOCK_MODE=true.",
      }
    }
    return result
  }

  const parsed = parseVideoScriptFromTextWithResult(result.content)
  if (!parsed.ok) {
    return {
      ok: false,
      error: `Could not parse video script from AI response: ${parsed.reason}`,
    }
  }

  return { ok: true, script: parsed.script }
}
