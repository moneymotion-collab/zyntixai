import { handleMarketingStrategyRequest } from "@/lib/marketing/handle-marketing-strategy-request"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  return handleMarketingStrategyRequest(req)
}
