import { handleUpdateStrategyFromInsightsRequest } from "@/lib/marketing/handle-update-strategy-from-insights-request"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  return handleUpdateStrategyFromInsightsRequest(req)
}
