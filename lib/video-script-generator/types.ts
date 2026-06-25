import type { SubtitleTrack } from "@/lib/subtitles/types"

export type VideoScriptGeneratorScene = {
  /** On-screen text / overlay (max ~12 words) */
  text: string
  /** Visual direction — what the viewer sees */
  visual: string
  /** Scene length in seconds (3–8) */
  duration: number
}

export type VideoScriptGeneratorOutput = {
  /** Scroll-stopping Reel title for posting */
  title: string
  hook: string
  scenes: VideoScriptGeneratorScene[]
  voiceover: string
  /** Scene-level on-screen captions (derived from scenes when not provided) */
  captions: string[]
  /** Auto-generated timed subtitles from voiceover (word-level, TikTok/Reels style) */
  subtitles: SubtitleTrack
  CTA: string
}

export type VideoScriptGeneratorResult =
  | { ok: true; script: VideoScriptGeneratorOutput; warning?: string }
  | { ok: false; error: string }
