import { handleBrandContentInsightsRequest } from "@/lib/marketing/handle-brand-content-insights-request"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  return handleBrandContentInsightsRequest(req)
}
