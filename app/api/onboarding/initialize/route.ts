import { handleBrandOnboardingComplete } from "@/lib/marketing/handle-brand-onboarding-complete"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST() {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  return handleBrandOnboardingComplete()
}
