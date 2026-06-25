import Link from "next/link"
import { ArrowRight, CalendarClock } from "lucide-react"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import type { MarketingPost } from "@/lib/marketing/get-mock-marketing-data"

function formatScheduledAt(iso: string | null): string {
  if (!iso) return "Time TBD"

  const date = new Date(iso)
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function ScheduledRow({ post }: { post: MarketingPost }) {
  return (
    <li className="flex items-start gap-3 border-b border-gray-100 px-5 py-4 last:border-b-0">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
        <CalendarClock className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-gray-900">{post.title}</p>
        <p className="mt-1 text-sm text-gray-500">
          {formatScheduledAt(post.scheduled_at)}
        </p>
        <p className="mt-1 text-xs font-medium capitalize text-gray-400">
          {post.platform || "Social"}
        </p>
      </div>
    </li>
  )
}

export default function MarketingScheduledPosts({
  posts,
}: {
  posts: MarketingPost[]
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Scheduled posts
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">Upcoming publish queue</p>
        </div>
        <Link
          href="/marketing/calendar"
          className="inline-flex items-center gap-1 text-sm font-medium text-cyan-600 transition hover:text-cyan-700"
        >
          Calendar
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
            {SAAS_EMPTY.scheduledPosts.eyebrow}
          </p>
          <p className="mt-2 text-sm font-semibold text-gray-900">
            {SAAS_EMPTY.scheduledPosts.title}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {SAAS_EMPTY.scheduledPosts.description}
          </p>
          <Link
            href="/marketing/calendar"
            className="mt-4 inline-flex rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-black"
          >
            Open calendar
          </Link>
        </div>
      ) : (
        <ul>{posts.map((post) => <ScheduledRow key={post.id} post={post} />)}</ul>
      )}
    </section>
  )
}
