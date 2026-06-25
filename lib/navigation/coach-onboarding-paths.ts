const COACH_ONBOARDING_EXEMPT_PAGE_PREFIXES = [
  "/onboarding",
  "/settings",
  "/trial-ended",
  "/pricing",
]

const COACH_ONBOARDING_EXEMPT_API_PREFIXES = [
  "/api/onboarding",
  "/api/access",
  "/api/workspace/enter-demo",
  "/api/workspace/enter-live",
  "/api/billing",
  "/api/stripe",
  "/api/create-checkout-session",
  "/api/gym-settings",
]

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

export function isCoachOnboardingExemptPath(pathname: string): boolean {
  if (
    COACH_ONBOARDING_EXEMPT_PAGE_PREFIXES.some((prefix) =>
      matchesPrefix(pathname, prefix),
    )
  ) {
    return true
  }

  if (!pathname.startsWith("/api/")) {
    return false
  }

  return COACH_ONBOARDING_EXEMPT_API_PREFIXES.some((prefix) =>
    matchesPrefix(pathname, prefix),
  )
}
