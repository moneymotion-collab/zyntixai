import { handleGenerateCampaignRequest } from "@/lib/marketing/handle-generate-campaign-request"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  return handleGenerateCampaignRequest(req)
}
