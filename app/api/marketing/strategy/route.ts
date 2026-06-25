import { handleBrandStrategyRequest } from "@/lib/marketing/handle-brand-strategy-request"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  return handleBrandStrategyRequest(req)
}
