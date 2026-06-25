import {
  CalendarClock,
  CheckCircle2,
  FileText,
  Hash,
  Video,
} from "lucide-react"
import ViralScoreBadge from "@/app/components/ViralScoreBadge"
import PostActions, { type PostAction } from "@/components/marketing/PostActions"
import PostOptimizationFlow from "@/components/marketing/PostOptimizationFlow"
import type { AppliedOptimizedPost } from "@/lib/marketing/marketing-optimize-client"
import PostPipeline from "@/components/marketing/scheduled/PostPipeline"
import PostMediaPreview from "@/components/marketing/scheduled/PostMediaPreview"
import PostPerformancePreview from "@/components/marketing/scheduled/PostPerformancePreview"
import PublishStatusBadge from "@/components/marketing/scheduled/PublishStatusBadge"
import TikTokPublishingComingSoon from "@/components/marketing/TikTokPublishingComingSoon"
import {
  VIDEO_BADGE,
  VIDEO_BODY,
  VIDEO_CARD_PADDING,
  VIDEO_SECTION_LABEL,
} from "@/components/marketing/scheduled/scheduled-video-styles"
import type { MarketingPost } from "@/lib/marketing/get-mock-marketing-data"
import { getMarketingPlatformDisplayLabel } from "@/lib/marketing/platform-availability"
import { isInstagramPlatform } from "@/lib/marketing/platform-utils"
import { shouldShowTikTokPublishingComingSoon } from "@/lib/marketing/post-eligibility"
import {
  getPipelineStage,
  getPlatformBadgeClass,
  getPostCardAccent,
} from "@/lib/marketing/post-pipeline"
import {
  isPublishProcessing,
  resolvePublishDisplayStatus,
} from "@/lib/marketing/publish-display-status"

function formatScheduledAt(value: string | null): string {
  if (!value) return "Not scheduled yet"

  return new Date(value).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function getContentTypeLabel(post: MarketingPost): {
  label: string
  isVideo: boolean
} {
  if (post.content_type === "video" || post.video_project_id) {
    return { label: "Video", isVideo: true }
  }
  return { label: "Post", isVideo: false }
}

function parseHashtags(value: string | null | undefined): string[] {
  if (!value?.trim()) return []
  return value
    .split(/[\s,#]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
}

export default function ScheduledPostCard({
  post,
  busyAction,
  highlighted = false,
  demoMode = false,
  onGenerateSimilar,
  onScore,
  onApprove,
  showApprove,
  onPublish,
  onSchedule,
  showSchedule,
  showPublish,
  onPublishInstagram,
  showPublishInstagram,
  showRetryInstagram,
  onSyncAnalytics,
  showSyncAnalytics,
  showTikTokComingSoon,
  onOptimizedApplied,
  onOptimizationError,
}: {
  post: MarketingPost
  busyAction: PostAction | null
  highlighted?: boolean
  demoMode?: boolean
  onGenerateSimilar: (post: MarketingPost) => void
  onScore: (post: MarketingPost) => void
  onApprove: (post: MarketingPost) => void
  showApprove: (post: MarketingPost) => boolean
  onPublish: (post: MarketingPost) => void
  onSchedule: (post: MarketingPost) => void
  showSchedule: (post: MarketingPost) => boolean
  showPublish: (post: MarketingPost) => boolean
  onPublishInstagram: (post: MarketingPost) => void
  showPublishInstagram: (post: MarketingPost) => boolean
  showRetryInstagram: (post: MarketingPost) => boolean
  onSyncAnalytics: (post: MarketingPost) => void
  showSyncAnalytics: (post: MarketingPost) => boolean
  showTikTokComingSoon: (post: MarketingPost) => boolean
  onOptimizedApplied: (postId: string, applied: AppliedOptimizedPost) => void
  onOptimizationError?: (message: string) => void
}) {
  const stage = getPipelineStage(post)
  const accent = getPostCardAccent(stage)
  const isProcessing = isPublishProcessing(post, busyAction)
  const publishStatus = resolvePublishDisplayStatus(post, { isProcessing })
  const isPublished = publishStatus === "published"
  const isFailed = publishStatus === "failed"
  const contentType = getContentTypeLabel(post)
  const hashtags = parseHashtags(post.hashtags)
  const isInstagram = isInstagramPlatform(post.platform)
  const instagramMediaId = post.external_post_id?.trim() || null

  return (
    <article
      id={`post-${post.id}`}
      className={`group overflow-hidden rounded-[2rem] border-2 bg-white shadow-[0_12px_48px_rgba(15,23,42,0.08)] transition duration-300 ${accent.border} ${
        highlighted
          ? "ring-4 ring-violet-400 ring-offset-4"
          : "ring-1 ring-gray-100"
      } ${isPublished ? "bg-gradient-to-b from-emerald-50/50 via-white to-white" : ""} ${
        isFailed ? "bg-gradient-to-b from-red-50/40 via-white to-white" : ""
      }`}
    >
      <div className={`h-2 bg-gradient-to-r ${accent.header}`} />

      <div className={`border-b border-gray-100 bg-white ${VIDEO_CARD_PADDING}`}>
        <PostPipeline post={post} />
      </div>

      <div className={`border-b border-gray-100 bg-white ${VIDEO_CARD_PADDING}`}>
        <div className="flex flex-col gap-8 lg:flex-row">
          <PostMediaPreview
            post={post}
            className="aspect-[4/5] w-full shrink-0 lg:w-56 xl:w-64"
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`${VIDEO_BADGE} ${getPlatformBadgeClass(post.platform)}`}
              >
                {getMarketingPlatformDisplayLabel(post.platform || "Social")}
              </span>

              <PublishStatusBadge status={publishStatus} large />

              <span
                className={`${VIDEO_BADGE} gap-2 ${
                  contentType.isVideo
                    ? "border-gray-800 bg-gray-900 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-700"
                }`}
              >
                {contentType.isVideo ? (
                  <Video className="h-5 w-5" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
                {contentType.label}
              </span>

              {isPublished ? (
                <span
                  className={`${VIDEO_BADGE} gap-2 border-emerald-200 bg-emerald-100 text-emerald-900`}
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Live
                </span>
              ) : null}
            </div>

            <h3
              className={`mt-6 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1] ${
                isPublished ? "text-emerald-950" : "text-gray-950"
              }`}
            >
              {post.title}
            </h3>

            {post.caption ? (
              <p className={`mt-5 max-w-4xl ${VIDEO_BODY}`}>{post.caption}</p>
            ) : (
              <p className="mt-5 text-lg italic text-gray-400 sm:text-xl">
                No caption yet.
              </p>
            )}

            {hashtags.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2.5">
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-4 py-2 text-base font-semibold text-cyan-900 sm:text-lg"
                  >
                    <Hash className="h-4 w-4 opacity-60" />
                    {tag.replace(/^#/, "")}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-gray-50/80 px-5 py-4">
                <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                <div>
                  <p className={VIDEO_SECTION_LABEL}>
                    {isPublished ? "Published" : "Scheduled for"}
                  </p>
                  <p className="mt-1 text-base font-bold text-gray-950 sm:text-lg">
                    {isPublished && post.published_at
                      ? formatScheduledAt(post.published_at)
                      : formatScheduledAt(post.scheduled_at)}
                  </p>
                </div>
              </div>

              {isInstagram && instagramMediaId ? (
                <div className="rounded-2xl border border-pink-200 bg-pink-50/60 px-5 py-4">
                  <p className={VIDEO_SECTION_LABEL}>Instagram media id</p>
                  <p className="mt-1 break-all font-mono text-sm font-semibold text-pink-900 sm:text-base">
                    {instagramMediaId}
                  </p>
                </div>
              ) : null}
            </div>

            {isFailed && post.publish_error ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
                <p className={`${VIDEO_SECTION_LABEL} text-red-700`}>
                  Publish error
                </p>
                <p className="mt-2 text-base font-medium leading-relaxed text-red-800 sm:text-lg">
                  {post.publish_error}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className={`border-b border-gray-100 bg-white ${VIDEO_CARD_PADDING}`}>
        <PostPerformancePreview post={post} />
      </div>

      <div className={VIDEO_CARD_PADDING}>
        <div className="rounded-3xl border border-gray-200 bg-gray-50/60 p-2">
          <p className={`px-5 pb-3 pt-4 ${VIDEO_SECTION_LABEL}`}>
            Viral score breakdown
          </p>
          <ViralScoreBadge
            score={post.viral_score}
            reason={post.viral_reason}
            viral_feedback={post.viral_feedback}
            title={post.title}
            caption={post.caption}
            className="rounded-2xl"
          />
        </div>

        <div className="mt-8">
          <PostOptimizationFlow
            postId={post.id}
            sourceTable="content_posts"
            originalTitle={post.title}
            originalCaption={post.caption}
            originalHashtags={post.hashtags}
            platform={post.platform}
            demoMode={demoMode}
            disabled={busyAction !== null}
            variant="compact"
            onApplied={(applied) => onOptimizedApplied(post.id, applied)}
            onError={onOptimizationError}
          />
        </div>
      </div>

      <div className={`border-t border-gray-200 bg-gray-50/80 ${VIDEO_CARD_PADDING}`}>
        <p className={`mb-6 ${VIDEO_SECTION_LABEL}`}>Actions</p>
        {showTikTokComingSoon(post) ? (
          <TikTokPublishingComingSoon className="mb-6" />
        ) : null}
        <PostActions
          publishStatus={publishStatus}
          busy={busyAction}
          video
          onGenerateSimilar={() => onGenerateSimilar(post)}
          onScore={() => onScore(post)}
          onApprove={() => onApprove(post)}
          showApprove={showApprove(post)}
          onPublish={() => onPublish(post)}
          showPublish={showPublish(post)}
          showSchedule={showSchedule(post)}
          onSchedule={() => onSchedule(post)}
          showPublishInstagram={showPublishInstagram(post)}
          onPublishInstagram={() => onPublishInstagram(post)}
          showRetryInstagram={showRetryInstagram(post)}
          onRetryInstagram={() => onPublishInstagram(post)}
          showSyncAnalytics={showSyncAnalytics(post)}
          onSyncAnalytics={() => onSyncAnalytics(post)}
        />
      </div>
    </article>
  )
}
