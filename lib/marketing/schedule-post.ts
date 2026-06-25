import type { PostStatus } from "@/lib/marketing/content-post-status"

export async function schedulePost(
  postId: string,
  dateTime: string | null,
  status: PostStatus = "scheduled",
) {
  const res = await fetch("/api/schedule-post", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      post_id: postId,
      scheduled_for: dateTime,
      status,
    }),
  })

  const data = (await res.json()) as {
    error?: string
    success?: boolean
  }

  if (!res.ok) {
    throw new Error(data.error ?? "Could not schedule post.")
  }

  return data
}
