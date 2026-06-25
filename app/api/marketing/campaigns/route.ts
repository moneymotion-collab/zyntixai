import { handleListCampaignsRequest } from "@/lib/marketing/handle-save-campaign-request"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function GET() {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  return handleListCampaignsRequest()
}
