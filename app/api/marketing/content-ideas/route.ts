import { handleContentIdeasRequest } from "@/lib/marketing/handle-content-ideas-request"
import { handleFetchContentIdeaDraftsRequest } from "@/lib/marketing/handle-fetch-content-idea-drafts-request"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function GET() {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  return handleFetchContentIdeaDraftsRequest()
}

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  return handleContentIdeasRequest(req)
}
