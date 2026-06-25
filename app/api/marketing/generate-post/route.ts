import { handleGeneratePostRequest } from "@/lib/marketing/handle-generate-post-request"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  return handleGeneratePostRequest(req)
}
