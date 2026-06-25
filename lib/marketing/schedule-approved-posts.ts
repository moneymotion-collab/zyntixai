type ScheduleApprovedPostsResponse = {
  success?: boolean
  scheduled?: number
  posts?: unknown[]
  message?: string
  error?: string
}

export async function scheduleApprovedPosts(brandId: string) {
  const res = await fetch("/api/content/schedule", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      brand_id: brandId,
    }),
  })

  const data = (await res.json()) as ScheduleApprovedPostsResponse

  if (!res.ok) {
    throw new Error(data.error ?? "Could not schedule posts.")
  }

  return data
}
