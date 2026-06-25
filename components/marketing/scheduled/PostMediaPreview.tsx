import { Film, ImageIcon } from "lucide-react"
import type { MarketingPost } from "@/lib/marketing/get-mock-marketing-data"
import { getMarketingPlatformDisplayLabel } from "@/lib/marketing/platform-availability"
import { isInstagramPlatform } from "@/lib/marketing/platform-utils"

export function resolvePostMediaPreview(post: MarketingPost): {
  url: string | null
  isVideo: boolean
} {
  const videoUrl = post.video_url?.trim() || null
  const imageUrl = post.image_url?.trim() || null

  if (videoUrl) {
    return { url: videoUrl, isVideo: true }
  }

  if (imageUrl) {
    return { url: imageUrl, isVideo: false }
  }

  return { url: null, isVideo: false }
}

function formatPlatformLabel(platform: string): string {
  return getMarketingPlatformDisplayLabel(platform || "Social")
}

export default function PostMediaPreview({
  post,
  className = "",
}: {
  post: MarketingPost
  className?: string
}) {
  const media = resolvePostMediaPreview(post)
  const platformLabel = formatPlatformLabel(post.platform)
  const isInstagram = isInstagramPlatform(post.platform)

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-inner ${className}`}
    >
      {media.url ? (
        media.isVideo ? (
          <video
            src={media.url}
            className="h-full w-full object-cover"
            controls
            muted
            playsInline
            preload="auto"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={media.url}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        )
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
          {post.content_type === "video" || post.video_project_id ? (
            <Film className="h-10 w-10" />
          ) : (
            <ImageIcon className="h-10 w-10" />
          )}
          <p className="text-sm font-medium">No media preview</p>
        </div>
      )}

      {media.isVideo ? (
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          <Film className="h-3.5 w-3.5" />
          Video
        </span>
      ) : null}

      <span
        className={`absolute left-3 top-3 inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold shadow-sm backdrop-blur-sm ${
          isInstagram
            ? "border-pink-200/80 bg-gradient-to-r from-pink-500 to-purple-600 text-white"
            : "border-white/60 bg-white/90 text-gray-800"
        }`}
      >
        {platformLabel}
      </span>
    </div>
  )
}
