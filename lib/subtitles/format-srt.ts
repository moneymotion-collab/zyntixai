import type { SubtitleTrack } from "@/lib/subtitles/types"

function pad(value: number, length: number): string {
  return String(value).padStart(length, "0")
}

function formatSrtTimestamp(seconds: number): string {
  const totalMs = Math.max(0, Math.round(seconds * 1000))
  const hours = Math.floor(totalMs / 3_600_000)
  const minutes = Math.floor((totalMs % 3_600_000) / 60_000)
  const secs = Math.floor((totalMs % 60_000) / 1000)
  const ms = totalMs % 1000

  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(secs, 2)},${pad(ms, 3)}`
}

export function subtitleTrackToSrt(track: SubtitleTrack): string {
  return track.phrases
    .map((phrase, index) => {
      const start = formatSrtTimestamp(phrase.start)
      const end = formatSrtTimestamp(phrase.end)
      return `${index + 1}\n${start} --> ${end}\n${phrase.text}\n`
    })
    .join("\n")
    .trim()
}
