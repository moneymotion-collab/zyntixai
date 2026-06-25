import { handleMarketingGenerateCampaignRequest } from "@/lib/marketing/handle-marketing-generate-campaign-request"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  return handleMarketingGenerateCampaignRequest(req)
}
