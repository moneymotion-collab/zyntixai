import type { SaveablePost } from "@/lib/marketing/parse-saveable-post"

export async function savePost(post: SaveablePost) {
  const res = await fetch("/api/marketing/save-post", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      platform: post.platform,
      content: post.content,
      hook: post.hook,
      post_type: post.post_type,
      scheduled_date: post.scheduled_date,
      viral_score: post.viral_score,
    }),
  })

  const data = (await res.json()) as {
    error?: string
    success?: boolean
  }

  console.log("SAVE POST RESPONSE:", res.status, data)

  if (!res.ok) {
    throw new Error(data.error ?? "Could not save to calendar.")
  }

  return data
}
