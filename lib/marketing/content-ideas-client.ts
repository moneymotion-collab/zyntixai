import type { ContentIdeaCard } from "@/lib/marketing/content-idea-cards"

export async function fetchContentIdeaDrafts(): Promise<ContentIdeaCard[]> {
  const res = await fetch("/api/marketing/content-ideas", {
    credentials: "include",
  })

  const data = (await res.json()) as {
    ideas?: ContentIdeaCard[]
    error?: { message?: string } | string
  }

  if (!res.ok) {
    const message =
      typeof data.error === "string"
        ? data.error
        : data.error?.message ?? "Could not load content ideas."
    throw new Error(message)
  }

  return data.ideas ?? []
}
