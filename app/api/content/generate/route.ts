import { handleContentIdeasRequest } from "@/lib/marketing/handle-content-ideas-request"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  return handleContentIdeasRequest(req)
}
