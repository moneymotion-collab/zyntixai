import type { MarketingPost } from "@/lib/marketing/get-mock-marketing-data"

async function parseJson<T>(res: Response): Promise<T> {
  return (await res.json()) as T
}

export async function scorePost(id: string) {
  const res = await fetch("/api/content/score", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ post_id: id }),
  })

  const data = await parseJson<{
    result?: {
      viral_score: number
      viral_reason: string
      feedback: string[]
    }
    warning?: string
    error?: string | { message?: string }
  }>(res)

  if (!res.ok || !data.result) {
    const message =
      typeof data.error === "string"
        ? data.error
        : data.error?.message ?? "Could not score post."
    throw new Error(message)
  }

  return { result: data.result, warning: data.warning }
}

export async function optimizePost(id: string) {
  const res = await fetch("/api/content/optimize", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ post_id: id }),
  })

  const data = await parseJson<{
    result?: {
      optimized_title: string
      optimized_content: string
      optimized_hashtags: string
      predicted_score: number
      changes: string[]
    }
    warning?: string
    error?: string
  }>(res)

  if (!res.ok || !data.result) {
    throw new Error(data.error ?? "Could not optimize post.")
  }

  return { result: data.result, warning: data.warning }
}

export async function generateSimilarPost(id: string) {
  const res = await fetch("/api/content/generate-similar", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  })

  const data = await parseJson<{
    post?: MarketingPost
    warning?: string
    error?: { message?: string }
  }>(res)

  if (!res.ok || !data.post) {
    throw new Error(data.error?.message ?? "Could not generate similar post.")
  }

  return { post: data.post, warning: data.warning }
}

export { publishPost } from "@/lib/marketing/publish-post"
