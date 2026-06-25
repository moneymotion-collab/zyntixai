import { handleViralScoreRequest } from "@/lib/marketing/handle-viral-score-request"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  return handleViralScoreRequest(req)
}
