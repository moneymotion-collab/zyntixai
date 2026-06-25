export type DemoVideoType = "youtube" | "loom" | "mp4"

export type ResolvedDemoVideo = {
  type: DemoVideoType
  /** iframe `src` for YouTube and Loom */
  embedUrl: string
  /** Direct file URL for HTML5 video */
  src?: string
  poster?: string
}

const DEFAULT_MP4_FALLBACK = "/renders/final-527801c2-18fa-422f-b849-e38bcb940d80.mp4"
const DEFAULT_POSTER = "/app-showcase/dashboard.png"

function trimUrl(value: string | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed || null
}

function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, "")

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0]
      return id || null
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/")[2] ?? null
      }
      return parsed.searchParams.get("v")
    }
  } catch {
    return null
  }

  return null
}

function extractLoomId(url: string): string | null {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, "")
    if (host !== "loom.com") return null

    const parts = parsed.pathname.split("/").filter(Boolean)
    const shareIndex = parts.findIndex((part) => part === "share" || part === "embed")
    if (shareIndex === -1) return null

    return parts[shareIndex + 1] ?? null
  } catch {
    return null
  }
}

function isMp4Source(url: string): boolean {
  if (url.startsWith("/")) return true
  try {
    const parsed = new URL(url)
    return /\.mp4($|\?)/i.test(parsed.pathname)
  } catch {
    return /\.mp4($|\?)/i.test(url)
  }
}

export function parseDemoVideoUrl(rawUrl: string): ResolvedDemoVideo | null {
  const url = rawUrl.trim()
  if (!url) return null

  const youtubeId = extractYouTubeId(url)
  if (youtubeId) {
    return {
      type: "youtube",
      embedUrl: `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`,
    }
  }

  const loomId = extractLoomId(url)
  if (loomId) {
    return {
      type: "loom",
      embedUrl: `https://www.loom.com/embed/${loomId}`,
    }
  }

  if (isMp4Source(url)) {
    return {
      type: "mp4",
      embedUrl: url,
      src: url,
      poster: DEFAULT_POSTER,
    }
  }

  return null
}

/** Resolve landing demo video from `NEXT_PUBLIC_DEMO_VIDEO_URL` with MP4 fallback. */
export function resolveLandingDemoVideo(): ResolvedDemoVideo {
  const configured = trimUrl(process.env.NEXT_PUBLIC_DEMO_VIDEO_URL)
  const poster = trimUrl(process.env.NEXT_PUBLIC_DEMO_VIDEO_POSTER) ?? DEFAULT_POSTER

  if (configured) {
    const parsed = parseDemoVideoUrl(configured)
    if (parsed) {
      return parsed.type === "mp4" ? { ...parsed, poster } : parsed
    }
  }

  return {
    type: "mp4",
    embedUrl: DEFAULT_MP4_FALLBACK,
    src: DEFAULT_MP4_FALLBACK,
    poster,
  }
}
