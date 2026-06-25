export async function addVideoToCalendar(videoId: string) {
  const res = await fetch("/api/marketing/video-generator/add-to-calendar", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ video_id: videoId }),
  })

  const data = (await res.json()) as {
    error?: string
    video?: { id: string; content_post_id: string | null }
    content_post?: { id: string; status: string }
    calendar_url?: string
    already_exists?: boolean
    message?: string
  }

  if (!res.ok) {
    throw new Error(data.error ?? "Could not add video to calendar.")
  }

  return data
}
