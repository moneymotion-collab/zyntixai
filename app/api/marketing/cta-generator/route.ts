import { handleCtaGeneratorRequest } from "@/lib/marketing/handle-cta-generator-request"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  return handleCtaGeneratorRequest(req)
}
