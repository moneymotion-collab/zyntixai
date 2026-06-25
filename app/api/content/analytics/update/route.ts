import { handleUpdatePostPerformanceRequest } from "@/lib/marketing/handle-update-post-performance-request"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  return handleUpdatePostPerformanceRequest(req)
}
