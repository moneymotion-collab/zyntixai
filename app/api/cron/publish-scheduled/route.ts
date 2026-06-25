import { processScheduledPosts } from "@/lib/marketing/publisher/process-scheduled-posts"
import { cronAuthResponse, verifyCronRequest } from "@/lib/security/cron-auth"

export async function GET(req: Request) {
  const denied = verifyCronRequest(req)
  if (denied) {
    return cronAuthResponse(denied)
  }

  try {
    const result = await processScheduledPosts()
    return Response.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cron publish failed."
    return Response.json({ error: message }, { status: 500 })
  }
}
