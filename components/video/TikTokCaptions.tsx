"use client"

import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion"
import {
  getActivePhrase,
  getActiveWord,
} from "@/lib/subtitles/generate-subtitles"
import type { SubtitleTrack } from "@/lib/subtitles/types"
import {
  REELS_MAX_TEXT_Y,
  REELS_MIN_TEXT_Y,
  REELS_SCENE_TEXT_TOP,
  REELS_SIDE_PADDING,
} from "@/lib/video/reels-safe-layout"

export type TikTokCaptionsProps = {
  track: SubtitleTrack
  /** Vertical position: center (default) or lower third */
  position?: "center" | "lower"
}

const TIKTOK_CAPTION_STYLE = {
  fontFamily:
    '"Inter", "SF Pro Display", system-ui, -apple-system, "Segoe UI", sans-serif',
  fontSize: 54,
  fontWeight: 900,
  lineHeight: 1.15,
  letterSpacing: -0.5,
  textTransform: "none" as const,
}

function phraseLocalTime(
  phraseStart: number,
  currentTime: number,
  fps: number,
): { localFrame: number; popScale: number; popOpacity: number } {
  const localSeconds = Math.max(0, currentTime - phraseStart)
  const localFrame = Math.round(localSeconds * fps)
  const popInFrames = Math.round(fps * 0.12)

  const popScale = interpolate(localFrame, [0, popInFrames], [0.88, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })

  const popOpacity = interpolate(localFrame, [0, popInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })

  return { localFrame, popScale, popOpacity }
}

export default function TikTokCaptions({
  track,
  position = "center",
}: TikTokCaptionsProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const currentTime = frame / fps

  const phrase = getActivePhrase(track, currentTime)
  if (!phrase) return null

  const activeWord = getActiveWord(phrase, currentTime)
  const { popScale, popOpacity } = phraseLocalTime(
    phrase.start,
    currentTime,
    fps,
  )

  const verticalStyle =
    position === "lower"
      ? {
          top: REELS_SCENE_TEXT_TOP - 24,
          bottom: "auto" as const,
          maxHeight: REELS_MAX_TEXT_Y - REELS_SCENE_TEXT_TOP + 24,
        }
      : {
          top: (REELS_MIN_TEXT_Y + REELS_MAX_TEXT_Y) / 2,
          transform: "translateY(-50%)",
        }

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        justifyContent: "center",
        alignItems: "center",
        padding: `0 ${REELS_SIDE_PADDING}px`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: REELS_SIDE_PADDING,
          right: REELS_SIDE_PADDING,
          display: "flex",
          justifyContent: "center",
          textAlign: "center",
          opacity: popOpacity,
          ...verticalStyle,
        }}
      >
        <div
          style={{
            transform: `scale(${popScale})`,
            maxWidth: "92%",
          }}
        >
          <p
            style={{
              margin: 0,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "0.22em",
              ...TIKTOK_CAPTION_STYLE,
            }}
          >
            {phrase.words.map((word, index) => {
              const isActive = activeWord?.text === word.text && activeWord?.start === word.start
              const wordLocalSeconds = Math.max(0, currentTime - word.start)
              const wordLocalFrame = Math.round(wordLocalSeconds * fps)
              const highlightScale = isActive
                ? interpolate(wordLocalFrame, [0, 4], [1, 1.12], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  })
                : 1

              return (
                <span
                  key={`${word.start}-${index}`}
                  style={{
                    display: "inline-block",
                    transform: `scale(${highlightScale})`,
                    color: isActive ? "#FFE135" : "#FFFFFF",
                    opacity: isActive ? 1 : 0.92,
                    WebkitTextStroke: isActive ? "2px #000000" : "1.5px #000000",
                    paintOrder: "stroke fill",
                    textShadow: isActive
                      ? "0 4px 24px rgba(255, 225, 53, 0.45), 0 2px 8px rgba(0,0,0,0.9)"
                      : "0 2px 12px rgba(0,0,0,0.85), 0 1px 4px rgba(0,0,0,0.9)",
                    transition: "color 0.05s linear",
                  }}
                >
                  {word.text}
                </span>
              )
            })}
          </p>
        </div>
      </div>
    </AbsoluteFill>
  )
}
