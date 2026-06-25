import { handleGeneratePlanPostsRequest } from "@/lib/marketing/handle-generate-plan-posts-request"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  return handleGeneratePlanPostsRequest(req)
}
