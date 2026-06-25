export const CINEMATIC_VISUAL_MODES = [
  "image",
  "motion",
  "commercial",
] as const

export type CinematicVisualMode = (typeof CINEMATIC_VISUAL_MODES)[number]

export type CinematicVisualCategory =
  | "coach_lifestyle"
  | "overwhelm"
  | "technology"
  | "gym_environment"
  | "transformation"
  | "business"
  | "solution"

export type CinematicVisualExample = {
  id: string
  label: string
  category: CinematicVisualCategory
  sceneDirection: string
  imagePrompt: string
  motionPrompt: string
  commercialPrompt: string
}

export type BuildCinematicPromptInput = {
  sceneDirection: string
  onScreenText?: string
  storyBeat?: string
  cameraMotion?: string
  characterAction?: string
  mascotName?: string
  mascotDescription?: string
  mascotStyle?: string
  mode?: CinematicVisualMode
  palette?: string
}

/** When true, scene rendering uses AI-generated cinematic frames instead of app screenshots. */
export const PREFER_CINEMATIC_VISUALS = true
