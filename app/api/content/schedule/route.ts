import { handleScheduleBrandPostsRequest } from "@/lib/marketing/handle-schedule-brand-posts-request"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  return handleScheduleBrandPostsRequest(req)
}
