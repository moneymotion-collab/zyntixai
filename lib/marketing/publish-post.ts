import type { MarketingPost } from "@/lib/marketing/get-mock-marketing-data"

export async function publishPost(id: string): Promise<MarketingPost> {
  const res = await fetch("/api/content/publish", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id,
      published_at: new Date().toISOString(),
    }),
  })

  const payload = (await res.json()) as {
    data?: MarketingPost | null
    error?: { message: string } | null
  }

  if (!res.ok || payload.error || !payload.data) {
    throw new Error(payload.error?.message ?? "Could not publish post.")
  }

  return payload.data
}
