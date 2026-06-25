import { handleSyncAnalyticsRequest } from "@/lib/marketing/handle-sync-analytics-request"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST() {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  return handleSyncAnalyticsRequest()
}
