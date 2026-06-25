"use client"

import { useEffect, useState } from "react"
import {
  getActivePhrase,
  getActiveWord,
} from "@/lib/subtitles/generate-subtitles"
import type { SubtitleTrack } from "@/lib/subtitles/types"

type SubtitlePreviewProps = {
  track: SubtitleTrack
  playing?: boolean
}

export default function SubtitlePreview({
  track,
  playing = true,
}: SubtitlePreviewProps) {
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    if (!playing || track.totalDuration <= 0) return

    const startedAt = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const elapsed = (now - startedAt) / 1000
      setCurrentTime(elapsed % track.totalDuration)
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, track])

  const phrase = getActivePhrase(track, currentTime)
  const activeWord = phrase ? getActiveWord(phrase, currentTime) : null

  return (
    <div className="relative mx-auto aspect-[9/16] w-full max-w-[320px] overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black shadow-xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.08),transparent_55%)]" />

      <div className="absolute inset-0 flex items-center justify-center px-6">
        {phrase ? (
          <p
            className="flex flex-wrap justify-center gap-x-1.5 gap-y-1 text-center text-2xl font-black leading-tight tracking-tight"
            aria-live="polite"
          >
            {phrase.words.map((word, index) => {
              const isActive =
                activeWord?.start === word.start && activeWord?.text === word.text

              return (
                <span
                  key={`${word.start}-${index}`}
                  className={`inline-block transition-transform duration-75 ${
                    isActive ? "scale-110 text-[#FFE135]" : "text-white"
                  }`}
                  style={{
                    WebkitTextStroke: isActive ? "1.5px #000" : "1px #000",
                    paintOrder: "stroke fill",
                    textShadow: isActive
                      ? "0 4px 20px rgba(255,225,53,0.4)"
                      : "0 2px 10px rgba(0,0,0,0.8)",
                  }}
                >
                  {word.text}
                </span>
              )
            })}
          </p>
        ) : (
          <p className="text-sm text-white/40">Subtitles preview</p>
        )}
      </div>

      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-white/45">
        <span>Instagram Reels style</span>
        <span>
          {currentTime.toFixed(1)}s / {track.totalDuration.toFixed(1)}s
        </span>
      </div>
    </div>
  )
}
