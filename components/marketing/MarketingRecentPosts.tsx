import Link from "next/link"
import { ArrowRight, Clock } from "lucide-react"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import PostStatusBadge from "@/app/components/PostStatusBadge"
import type { ContentPostStatus } from "@/lib/marketing/content-post-status"
import { isContentPostStatus } from "@/lib/marketing/content-post-status"
import type { MarketingPost } from "@/lib/marketing/get-mock-marketing-data"
import {
  getViralScoreStyles,
  getViralScoreTier,
} from "@/lib/marketing/viral-score"

function formatRelativeTime(iso: string): string {
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffHours < 1) return "Just now"
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
}

function ViralScorePill({ score }: { score: number | null }) {
  if (score == null) {
    return (
      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
        Unscored
      </span>
    )
  }

  const tier = getViralScoreTier(score)
  const styles = getViralScoreStyles(tier)

  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${styles.badge}`}
    >
      {score}
    </span>
  )
}

function PostRow({ post }: { post: MarketingPost }) {
  const status: ContentPostStatus = isContentPostStatus(post.status)
    ? post.status
    : "draft"

  return (
    <li className="flex items-center gap-4 border-b border-gray-100 px-5 py-4 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-gray-900">{post.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span className="rounded-md bg-gray-100 px-2 py-0.5 font-medium capitalize text-gray-600">
            {post.platform || "Social"}
          </span>
          <PostStatusBadge status={status} />
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(post.updated_at)}
          </span>
        </div>
      </div>
      <ViralScorePill score={post.viral_score} />
    </li>
  )
}

export default function MarketingRecentPosts({
  posts,
}: {
  posts: MarketingPost[]
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Recent posts</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Latest updates across your content pipeline
          </p>
        </div>
        <Link
          href="/marketing/scheduled"
          className="inline-flex items-center gap-1 text-sm font-medium text-cyan-600 transition hover:text-cyan-700"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
            {SAAS_EMPTY.marketingPosts.eyebrow}
          </p>
          <p className="mt-2 text-sm font-semibold text-gray-900">
            {SAAS_EMPTY.marketingPosts.title}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {SAAS_EMPTY.marketingPosts.description}
          </p>
          <Link
            href="/marketing/content-ideas"
            className="mt-4 inline-flex rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Generate posts
          </Link>
        </div>
      ) : (
        <ul>{posts.map((post) => <PostRow key={post.id} post={post} />)}</ul>
      )}
    </section>
  )
}
