"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { Play } from "lucide-react"
import {
  resolveLandingDemoVideo,
  type DemoVideoType,
  type ResolvedDemoVideo,
} from "@/lib/landing/demo-video-config"

type DemoVideoPlayerProps = {
  video?: ResolvedDemoVideo
}

function EmbedFrame({
  title,
  src,
  type,
}: {
  title: string
  src: string
  type: DemoVideoType
}) {
  return (
    <iframe
      src={src}
      title={title}
      className="absolute inset-0 h-full w-full border-0"
      allow={
        type === "youtube"
          ? "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          : "autoplay; fullscreen; picture-in-picture"
      }
      allowFullScreen
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  )
}

function Mp4Player({
  src,
  poster,
  title,
}: {
  src: string
  poster?: string
  title: string
}) {
  const [started, setStarted] = useState(false)

  if (!started) {
    return (
      <button
        type="button"
        onClick={() => setStarted(true)}
        className="group relative absolute inset-0 flex flex-col items-center justify-center bg-[#0a0e17]"
        aria-label={`Play ${title}`}
      >
        {poster ? (
          <Image
            src={poster}
            alt=""
            fill
            className="object-cover object-top opacity-70"
            sizes="(max-width: 1024px) 100vw, 60vw"
            priority={false}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/70 via-[#0c1019]/80 to-violet-950/70" />
        <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/40 transition-transform duration-300 group-hover:scale-110 sm:h-20 sm:w-20">
          <Play className="ml-1 h-7 w-7 fill-white text-white sm:h-8 sm:w-8" />
        </span>
        <p className="relative mt-4 text-sm font-medium text-slate-300">
          Play product demo
        </p>
      </button>
    )
  }

  return (
    <video
      className="absolute inset-0 h-full w-full bg-black object-contain"
      controls
      playsInline
      preload="metadata"
      poster={poster}
      autoPlay
    >
      <source src={src} type="video/mp4" />
      Your browser does not support embedded video playback.
    </video>
  )
}

export default function DemoVideoPlayer({ video }: DemoVideoPlayerProps) {
  const resolved = useMemo(() => video ?? resolveLandingDemoVideo(), [video])
  const title = "FitCore AI product demo"

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-[#0a0e17]">
      {resolved.type === "mp4" && resolved.src ? (
        <Mp4Player src={resolved.src} poster={resolved.poster} title={title} />
      ) : (
        <EmbedFrame
          title={title}
          src={resolved.embedUrl}
          type={resolved.type}
        />
      )}
    </div>
  )
}
