import { handleStoryStructureRequest } from "@/lib/marketing/handle-story-structure-request"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  return handleStoryStructureRequest(req)
}
