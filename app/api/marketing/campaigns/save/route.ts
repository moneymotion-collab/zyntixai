import { handleSaveCampaignRequest } from "@/lib/marketing/handle-save-campaign-request"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  return handleSaveCampaignRequest(req)
}
