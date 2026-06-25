import { handleOptimizePostRequest } from "@/lib/marketing/handle-optimize-post-request"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  return handleOptimizePostRequest(req)
}
