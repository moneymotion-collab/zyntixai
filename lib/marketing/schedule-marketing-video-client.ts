export async function scheduleMarketingVideo(
  videoId: string,
  scheduledAt: string,
) {
  const res = await fetch("/api/marketing/video-generator/schedule", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      video_id: videoId,
      scheduled_at: scheduledAt,
    }),
  })

  const data = (await res.json()) as {
    error?: string
    video?: { id: string; status: string; content_post_id: string | null }
    content_post?: { id: string; status: string; scheduled_at: string | null }
    calendar_url?: string
    message?: string
  }

  if (!res.ok) {
    throw new Error(data.error ?? "Could not schedule video.")
  }

  return data
}
