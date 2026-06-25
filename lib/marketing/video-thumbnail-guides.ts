import type { GeneratorVideoStyle } from "@/lib/marketing/video-styles"

export type VideoStyleThumbnailGuide = {
  titleTone: string
  textTone: string
  visualTone: string
  example: {
    thumbnail_title: string
    thumbnail_text: string
    thumbnail_visual: string
  }
}

export const VIDEO_STYLE_THUMBNAIL_GUIDES: Record<
  GeneratorVideoStyle,
  VideoStyleThumbnailGuide
> = {
  viral_caption: {
    titleTone: "2-4 words, ALL CAPS friendly, hook-driven",
    textTone: "Short punchy subline, max 6 words",
    visualTone:
      "Bold kinetic typography zone, high-contrast gym lighting, scroll-stopping cover frame",
    example: {
      thumbnail_title: "STOP GUESSING",
      thumbnail_text: "Your warm-up is broken",
      thumbnail_visual:
        "Coach mid-gym with bold negative space for text, electric blue accent glow, dramatic top lighting.",
    },
  },
  problem_solution: {
    titleTone: "Pain-point headline, 2-5 words",
    textTone: "Promise of transformation, max 8 words",
    visualTone:
      "Split before/after composition, desaturated problem side vs bright solution side",
    example: {
      thumbnail_title: "Still Stuck?",
      thumbnail_text: "Fix it in one session",
      thumbnail_visual:
        "Split-screen frustrated coach vs confident coach, high contrast, cinematic cover framing.",
    },
  },
  premium_ad: {
    titleTone: "Minimal luxury headline, 2-4 words",
    textTone: "Aspirational subline, refined tone",
    visualTone:
      "Cinematic shallow depth of field, golden rim light, premium fitness brand aesthetic",
    example: {
      thumbnail_title: "Train Smarter",
      thumbnail_text: "Premium coaching redefined",
      thumbnail_visual:
        "Silhouetted athlete in luxury gym, golden rim light, dark moody background, minimal copy space.",
    },
  },
  saas_demo: {
    titleTone: "ROI or time-savings hook, 2-5 words",
    textTone: "Feature benefit subline",
    visualTone:
      "Cinematic dark office with holographic dashboard glow, electric blue accents, premium FitCore AI brand",
    example: {
      thumbnail_title: "Save 10 Hours",
      thumbnail_text: "Automate your content",
      thumbnail_visual:
        "Coach at standing desk, abstract AI dashboard glowing electric blue in dark office, clean cinematic cover composition.",
    },
  },
  app_showcase: {
    titleTone: "Business ROI headline, 2-5 words",
    textTone: "Platform benefit subline for coaches",
    visualTone:
      "FitCore Coach mascot in cinematic dark commercial frame, electric blue accent glow, premium B2B fitness SaaS",
    example: {
      thumbnail_title: "RUN YOUR GYM",
      thumbnail_text: "One platform. Full control.",
      thumbnail_visual:
        "FitCore Coach mascot in dark cinematic office, holographic command center glow, electric blue rim light, premium cover composition.",
    },
  },
  mascot_story: {
    titleTone: "Character-led hook, 2-5 words",
    textTone: "Mascot voice subline, conversational",
    visualTone:
      "Brand mascot front and center, neon blue glow, premium fitness environment",
    example: {
      thumbnail_title: "Coach Says",
      thumbnail_text: "Try this warm-up fix",
      thumbnail_visual:
        "FitCore Coach mascot close-up, confident expression, neon blue rim light, dark gym backdrop.",
    },
  },
}

export function buildVideoStyleThumbnailPromptList(): string {
  return (
    Object.entries(VIDEO_STYLE_THUMBNAIL_GUIDES) as [
      GeneratorVideoStyle,
      VideoStyleThumbnailGuide,
    ][]
  )
    .map(
      ([style, guide]) =>
        `- ${style}: title (${guide.titleTone}), text (${guide.textTone}), visual (${guide.visualTone}). Example: ${JSON.stringify(guide.example)}`,
    )
    .join("\n")
}

export function applyStyleThumbnailDefaults(
  style: GeneratorVideoStyle,
  hook: string,
  cta: string,
  scenes: { visual: string }[],
  thumbnail_title: string,
  thumbnail_text: string,
  thumbnail_visual: string,
): {
  thumbnail_title: string
  thumbnail_text: string
  thumbnail_visual: string
} {
  const guide = VIDEO_STYLE_THUMBNAIL_GUIDES[style]

  return {
    thumbnail_title: thumbnail_title || guide.example.thumbnail_title || hook,
    thumbnail_text: thumbnail_text || guide.example.thumbnail_text || cta,
    thumbnail_visual:
      thumbnail_visual ||
      scenes[0]?.visual ||
      guide.example.thumbnail_visual,
  }
}
