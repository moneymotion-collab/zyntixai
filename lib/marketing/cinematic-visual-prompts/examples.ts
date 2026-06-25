import type { CinematicVisualExample } from "@/lib/marketing/cinematic-visual-prompts/types"
import { FITCORE_VISUAL_IDENTITY } from "@/lib/marketing/visual-identity"

export const CINEMATIC_VISUAL_EXAMPLES: CinematicVisualExample[] = [
  {
    id: "coach_late_night",
    label: "Coach working late",
    category: "coach_lifestyle",
    sceneDirection: "Fitness coach working late behind laptop in dim gym office",
    imagePrompt:
      "Cinematic medium shot of a tired fitness coach in athletic wear working late behind a laptop in a dim modern gym office, warm desk lamp and cool blue screen glow, shallow depth of field, premium commercial photography, moody atmosphere, vertical 9:16",
    motionPrompt:
      "Slow push-in on coach typing at laptop, screen glow reflecting on face, subtle handheld energy, late-night coaching business mood, cinematic commercial pacing",
    commercialPrompt:
      "Premium B2B fitness SaaS commercial frame — exhausted coach alone with laptop after hours, relatable pain point, cinematic lighting, aspirational turnaround implied, vertical 9:16, no UI screenshots",
  },
  {
    id: "overwhelmed_messages",
    label: "Overwhelmed by messages",
    category: "overwhelm",
    sceneDirection: "Busy coach overwhelmed by messages and notifications",
    imagePrompt:
      "Cinematic close-up of an overwhelmed fitness coach surrounded by floating notification icons and message bubbles, stressed expression, modern home gym background, dramatic rim lighting, premium ad style, vertical 9:16",
    motionPrompt:
      "Rack focus from coach's face to cascading notification graphics, quick subtle zoom, tension-building commercial edit, overwhelmed coach narrative beat",
    commercialPrompt:
      "High-end commercial visual — coach buried in DMs, spreadsheets, and app chaos, before-and-after story setup, emotional hook, no literal app screenshots, vertical 9:16",
  },
  {
    id: "ai_dashboard_glow",
    label: "AI dashboard glow",
    category: "technology",
    sceneDirection: "Modern AI dashboard glowing in dark office",
    imagePrompt:
      "Cinematic wide shot of a sleek abstract AI dashboard interface glowing electric blue in a dark modern office, holographic UI elements, premium SaaS commercial aesthetic, shallow depth of field, no readable text, vertical 9:16",
    motionPrompt:
      "Slow orbit around glowing dashboard interface, light pulses across UI panels, futuristic product reveal energy, premium tech commercial motion",
    commercialPrompt:
      "Luxury tech commercial frame — abstract intelligent dashboard as hero object in dark office, solution reveal moment, electric blue accent lighting, no flat screenshots, vertical 9:16",
  },
  {
    id: "professional_gym",
    label: "Professional gym",
    category: "gym_environment",
    sceneDirection: "Professional gym environment with premium lighting",
    imagePrompt:
      "Cinematic establishing shot of a professional boutique gym interior, clean equipment, dramatic overhead lighting, athletes training in soft background blur, premium fitness brand commercial, vertical 9:16",
    motionPrompt:
      "Smooth dolly through gym floor, rack focus on equipment then coach in foreground, aspirational fitness business atmosphere, slow cinematic motion",
    commercialPrompt:
      "Premium fitness brand commercial — immaculate gym environment signaling serious coaching business, trust and professionalism, golden-hour gym lighting, vertical 9:16",
  },
  {
    id: "transformation_montage",
    label: "Transformation montage",
    category: "transformation",
    sceneDirection: "Athletic transformation montage with before-and-after energy",
    imagePrompt:
      "Cinematic split-tone fitness transformation montage, athletic client mid-workout, confident coach guiding rep, sweat and rim light, high-energy premium sports commercial, vertical 9:16",
    motionPrompt:
      "Dynamic montage cuts — warm-up, coaching cue, breakthrough rep, results energy, fast but polished commercial pacing with motion blur transitions",
    commercialPrompt:
      "Results-driven fitness commercial montage — transformation story payoff, emotional client win, coach as hero guide, cinematic sports ad lighting, vertical 9:16",
  },
]

export const CINEMATIC_PALETTE = FITCORE_VISUAL_IDENTITY.paletteDescription

export const CINEMATIC_NEGATIVE_CONSTRAINTS =
  FITCORE_VISUAL_IDENTITY.negativeConstraints

export function getCinematicExample(id: string): CinematicVisualExample | undefined {
  return CINEMATIC_VISUAL_EXAMPLES.find((example) => example.id === id)
}
