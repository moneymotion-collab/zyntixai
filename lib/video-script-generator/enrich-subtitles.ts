import { generateSubtitlesFromVoiceover } from "@/lib/subtitles"
import type { VideoScriptGeneratorOutput } from "@/lib/video-script-generator/types"

export function enrichVideoScriptWithSubtitles(
  script: Omit<VideoScriptGeneratorOutput, "subtitles">,
): VideoScriptGeneratorOutput {
  const subtitles = generateSubtitlesFromVoiceover(script.voiceover, {
    sceneDurations: script.scenes.map((scene) => scene.duration),
    bookendSeconds: 4,
    maxWordsPerPhrase: 4,
  })

  return {
    ...script,
    subtitles,
  }
}
