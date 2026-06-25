import { handleApplyOptimizedPostRequest } from "@/lib/marketing/handle-apply-optimized-post-request"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  return handleApplyOptimizedPostRequest(req)
}
